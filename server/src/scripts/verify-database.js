/**
 * Database Verification Script
 * 
 * This script verifies the database connection and checks if the database exists.
 * It provides detailed error messages and suggestions for fixing common issues.
 */

const mysql = require('mysql2/promise');
const config = require('../config/db');
const logger = require('../utils/logger');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

logger.info('Database configuration:');
logger.info(`Host: ${config.host}`);
logger.info(`User: ${config.user}`);
logger.info(`Database: ${config.database}`);
logger.info(`Password: ${config.password ? '*****' : 'Not set'}`);

async function verifyConnection() {
  let connection;
  
  try {
    // Try connecting to the MySQL server (without specifying a database)
    const serverConfig = { ...config };
    delete serverConfig.database;
    
    logger.info(`Attempting to connect to MySQL server at ${serverConfig.host}:${serverConfig.port}`);
    connection = await mysql.createConnection(serverConfig);
    
    logger.info('Successfully connected to MySQL server');
    
    // Check if database exists
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, 
      [config.database]
    );
    
    if (rows.length === 0) {
      logger.warn(`Database '${config.database}' does not exist`);
      
      // Ask if user wants to create it
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question(`Would you like to create the database '${config.database}'? (y/n) `, async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          try {
            await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            logger.info(`Database '${config.database}' created successfully`);
          } catch (error) {
            logger.error(`Failed to create database: ${error.message}`);
          }
        }
        
        readline.close();
        await connection.end();
      });
    } else {
      logger.info(`Database '${config.database}' exists`);
      
      // Now test connecting to the specific database
      await connection.end();
      
      logger.info(`Testing connection to database '${config.database}'`);
      const dbConnection = await mysql.createConnection(config);
      
      // Check if we can list tables
      const [tables] = await dbConnection.execute(
        `SHOW TABLES`
      );
      
      logger.info(`Connection to database successful. Found ${tables.length} tables.`);
      
      if (tables.length === 0) {
        logger.warn('No tables found in the database. You may need to run migrations.');
        logger.info('You can run migrations with: npm run migrate');
      } else {
        logger.info('Database connection verification complete. Your database is ready to use.');
      }
      
      await dbConnection.end();
    }
  } catch (error) {
    logger.error(`Database verification failed: ${error.message}`);
    
    // Provide more detailed error messages and suggested fixes
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error(`Access denied: Check your username and password.`);
      logger.info(`Current configuration: user=${config.user}, database=${config.database}, host=${config.host}`);
      logger.info(`You can configure the connection by editing .env or by running: npm run setup:db`);
    } else if (error.code === 'ECONNREFUSED') {
      logger.error(`Connection refused: Check if MySQL server is running at ${config.host}:${config.port}`);
      logger.info('Make sure your MySQL server is running and accessible from this machine.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      logger.error(`Database '${config.database}' does not exist.`);
      logger.info('You can create the database manually or by running this script again.');
    }
    
    // If connection was established, close it
    if (connection) {
      await connection.end();
    }
    
    process.exit(1);
  }
}

// Run the verification
verifyConnection(); 