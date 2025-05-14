/**
 * Database Connection Utility
 * Provides a connection pool and transaction support
 */

const mysql = require('mysql2/promise');
const config = require('../config/db');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.pool = null;
    this.connection = null;
    this.transaction = false;
  }

  /**
   * Initialize connection pool
   */
  init() {
    if (!this.pool) {
      try {
        // Check if we're using a connection string or individual parameters
        const connectionConfig = config.uri
          ? { uri: config.uri }
          : {
              host: config.host,
              port: config.port,
              user: config.user,
              password: config.password,
              database: config.database,
              timezone: config.timezone || '+00:00',
              // Remove connectionTimeout as it's not supported
              namedPlaceholders: true,
              waitForConnections: true,
              connectionLimit: 10,
              queueLimit: 0
            };

        this.pool = mysql.createPool(connectionConfig);
        
        // Test connection
        this.testConnection();
        
        logger.info('Database connection pool initialized');
      } catch (error) {
        logger.error('Error initializing database connection pool:', error);
        throw error;
      }
    }
  }
  
  /**
   * Test the database connection
   * @returns {Promise<void>}
   */
  async testConnection() {
    let conn;
    try {
      conn = await this.pool.getConnection();
      logger.info('Database connection test successful');
    } catch (error) {
      logger.error('Database connection test failed:', error);
      
      // Provide helpful error messages based on error type
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        logger.error(`Access denied: Check your username and password. 
          You can configure them by running 'node server/src/scripts/setup-database.js'
          Current configuration: user=${config.user}, database=${config.database}, host=${config.host}`);
      } else if (error.code === 'ECONNREFUSED') {
        logger.error(`Connection refused: Check if MySQL server is running at ${config.host}:${config.port}`);
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        logger.error(`Database '${config.database}' does not exist. Create it or configure a different database.`);
      }
      
      throw error;
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Get a connection from the pool
   * @returns {Promise<Connection>} Database connection
   */
  async getConnection() {
    if (!this.pool) {
      this.init();
    }

    try {
      if (this.transaction && this.connection) {
        return this.connection;
      } else {
        const connection = await this.pool.getConnection();
        logger.debug('Database connection acquired');
        return connection;
      }
    } catch (error) {
      logger.error('Error getting database connection:', error);
      throw error;
    }
  }

  /**
   * Execute a query with retries
   * @param {string} sql - SQL query
   * @param {Array|Object} params - Query parameters (array for positional, object for named)
   * @param {number} retries - Number of retries (default: 3)
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = [], retries = 3) {
    let connection;
    try {
      connection = await this.getConnection();
      
      const [rows] = await connection.query(sql, params);
      
      if (!this.transaction) {
        connection.release();
      }
      
      return rows;
    } catch (error) {
      if (connection && !this.transaction) {
        connection.release();
      }
      
      // Retry on connection errors if we have retries left
      if ((error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') && retries > 0) {
        logger.warn(`Database connection error (${error.code}). Retrying (${retries} retries left)...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.query(sql, params, retries - 1);
      }
      
      // More specific error handling
      if (error.code === 'ER_NO_SUCH_TABLE') {
        logger.error(`Table does not exist: ${error.message}. Make sure you've run migrations.`);
      } else if (error.code === 'ER_BAD_FIELD_ERROR') {
        logger.error(`Column does not exist: ${error.message}`);
      }
      
      logger.error(`Database query error: ${error.message}`, {
        sql: sql.substring(0, 200), // Log only part of the query for security
        error
      });
      throw error;
    }
  }

  /**
   * Begin a transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    try {
      if (this.transaction) {
        throw new Error('Transaction already in progress');
      }
      
      this.connection = await this.getConnection();
      await this.connection.beginTransaction();
      this.transaction = true;
      logger.debug('Transaction started');
    } catch (error) {
      logger.error('Error beginning transaction:', error);
      if (this.connection) {
        this.connection.release();
        this.connection = null;
      }
      this.transaction = false;
      throw error;
    }
  }

  /**
   * Commit a transaction
   * @returns {Promise<void>}
   */
  async commit() {
    try {
      if (!this.transaction || !this.connection) {
        throw new Error('No transaction in progress');
      }
      
      await this.connection.commit();
      logger.debug('Transaction committed');
    } catch (error) {
      logger.error('Error committing transaction:', error);
      throw error;
    } finally {
      if (this.connection) {
        this.connection.release();
        this.connection = null;
      }
      this.transaction = false;
    }
  }

  /**
   * Rollback a transaction
   * @returns {Promise<void>}
   */
  async rollback() {
    try {
      if (!this.transaction || !this.connection) {
        throw new Error('No transaction in progress');
      }
      
      await this.connection.rollback();
      logger.debug('Transaction rolled back');
    } catch (error) {
      logger.error('Error rolling back transaction:', error);
      throw error;
    } finally {
      if (this.connection) {
        this.connection.release();
        this.connection = null;
      }
      this.transaction = false;
    }
  }
}

// Create a singleton instance
const db = new Database();

module.exports = db; 