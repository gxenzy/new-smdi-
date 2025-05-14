/**
 * Sequelize Connection Configuration
 * Sets up and exports a Sequelize instance for model usage
 */

const { Sequelize } = require('sequelize');
const config = require('../config/db');
const logger = require('../utils/logger');

// Determine if we're using a connection string or individual parameters
let sequelize;

if (config.uri) {
  sequelize = new Sequelize(config.uri, {
    logging: (msg) => logger.debug(msg),
    dialectOptions: {
      timezone: config.timezone || '+00:00'
    }
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: 'mysql',
      logging: (msg) => logger.debug(msg),
      dialectOptions: {
        timezone: config.timezone || '+00:00'
      }
    }
  );
}

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Sequelize connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database with Sequelize:', error);
    
    // Provide helpful error messages based on error type
    if (error.name === 'SequelizeAccessDeniedError') {
      logger.error(`Access denied: Check your username and password. 
        You can configure them by setting DB_USER and DB_PASS environment variables.
        Current configuration: user=${config.user}, database=${config.database}, host=${config.host}`);
    } else if (error.name === 'SequelizeConnectionRefusedError') {
      logger.error(`Connection refused: Check if MySQL server is running at ${config.host}:${config.port}`);
    } else if (error.name === 'SequelizeConnectionError') {
      logger.error(`Database '${config.database}' does not exist. Create it or configure a different database.`);
    }
    
    throw error;
  }
}

// Test connection on module load (can be removed if causing issues)
testConnection();

module.exports = sequelize; 