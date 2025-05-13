import knex, { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Default configuration
const DEFAULT_POOL_MIN = 2;
const DEFAULT_POOL_MAX = 10;
const CONNECTION_TIMEOUT = 10000; // 10 seconds
const ACQUIRE_CONNECTION_TIMEOUT = 60000; // 60 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

let retryCount = 0;
let dbInstance: Knex | null = null;

/**
 * Create a new database connection
 */
const createConnection = (): Knex => {
  logger.info('Initializing database connection');
  
  // Get configuration from environment variables
  const config = {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'sdmi',
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || 'energyauditdb',
      connectTimeout: CONNECTION_TIMEOUT,
      multipleStatements: true,
      dateStrings: true,
    },
    pool: {
      min: Number(process.env.DB_POOL_MIN) || DEFAULT_POOL_MIN,
      max: Number(process.env.DB_POOL_MAX) || DEFAULT_POOL_MAX,
      // Validate connections before use
      afterCreate: (conn: any, done: any) => {
        conn.query('SELECT 1', (err: Error) => {
          if (err) {
            logger.error('Error validating connection:', err);
            done(err, conn);
          } else {
            logger.debug('Connection validated successfully');
            done(null, conn);
          }
        });
      },
      // Automatically check connection health before getting from pool
      validateConnection: (conn: any) => {
        return conn && !conn._closing;
      },
      // Handle errors at the pool level
      handleError: (err: Error) => {
        logger.error('Connection pool error:', err);
        // Attempt to reconnect if the database goes down
        if (!dbInstance) {
          retryDatabaseConnection();
        }
      }
    },
    acquireConnectionTimeout: ACQUIRE_CONNECTION_TIMEOUT,
    debug: process.env.NODE_ENV === 'development',
  };
  
  return knex(config);
};

/**
 * Retry database connection with exponential backoff
 */
const retryDatabaseConnection = async () => {
  if (retryCount >= MAX_RETRY_ATTEMPTS) {
    logger.error(`Failed to connect to database after ${MAX_RETRY_ATTEMPTS} attempts`);
    process.exit(1); // Exit the process if we can't connect to the database
  }
  
  const delay = RETRY_DELAY * Math.pow(2, retryCount);
  retryCount++;
  
  logger.info(`Retrying database connection in ${delay}ms (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})`);
  
  setTimeout(() => {
    try {
      dbInstance = createConnection();
      testConnection();
    } catch (error) {
      logger.error('Error creating database connection during retry:', error);
      retryDatabaseConnection();
    }
  }, delay);
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    if (!dbInstance) {
      throw new Error('Database instance is null');
    }
    
    await dbInstance.raw('SELECT 1');
    logger.info('Database connection successful');
    retryCount = 0; // Reset retry count on successful connection
  } catch (error) {
    logger.error('Database connection test failed:', error);
    dbInstance = null;
    retryDatabaseConnection();
  }
};

// Initialize database connection
dbInstance = createConnection();

// Test initial connection
testConnection();

// Define db as the singleton instance
export const db = dbInstance;

// Export the createConnection function for testing
export { createConnection, testConnection };

export default db; 