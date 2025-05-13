/**
 * Database Configuration
 * Loads database connection settings from environment variables with defaults
 */

// Load environment variables
require('dotenv').config();

// Determine if we're running in a development environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// If DATABASE_URL is set (common in production environments), use it
// Otherwise, use individual configuration settings
const config = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'sdmi',
      // Using DB_PASS instead of DB_PASSWORD to match user's env variables
      password: process.env.DB_PASS || 'SMD1SQLADM1N',
      database: process.env.DB_NAME || 'energyauditdb',
      timezone: '+00:00', // Store and retrieve dates in UTC
      // connectionTimeout removed as it's not supported by mysql2
    };

// If this is development mode and no password is provided, show warning
if (isDevelopment && !config.uri && !process.env.DB_PASS) {
  console.warn('\x1b[33m%s\x1b[0m', 
    'WARNING: No database password set. If your MySQL instance requires authentication, ' +
    'set the DB_PASS environment variable or update server/src/config/db.js with your credentials.'
  );
}

module.exports = config; 