/**
 * Database Setup Script
 * Run with: node server/src/scripts/setup-database.js
 * 
 * This script:
 * 1. Creates the database if it doesn't exist
 * 2. Runs all migrations
 * 3. Seeds the database with initial data
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
const { Sequelize } = require('sequelize');
const config = require('../config/db');
const logger = require('../utils/logger');

// Migration directory paths
const migrationDir = path.join(__dirname, '../database/migrations');
const seederDir = path.join(__dirname, '../database/seeders');

// Create database connection without database name
async function createDatabaseIfNotExists() {
  const connectionConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password
  };

  let connection;
  try {
    // Connect to server without specifying database
    connection = await mysql.createConnection(connectionConfig);
    
    logger.info(`Checking if database ${config.database} exists...`);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`);
    
    logger.info(`Database ${config.database} created or already exists`);
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Run migrations
async function runMigrations() {
  logger.info('Running migrations...');
  
  try {
    // Get all migration files
    const migrationFiles = await fs.readdir(migrationDir);
    
    // Filter JS files and sort them
    const jsFiles = migrationFiles
      .filter(file => file.endsWith('.js'))
      .sort();
    
    if (jsFiles.length === 0) {
      logger.warn('No migration files found');
      return;
    }
    
    // Create Sequelize instance
    const sequelize = new Sequelize(
      config.database,
      config.user,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg)
      }
    );
    
    // Run each migration
    for (const file of jsFiles) {
      logger.info(`Running migration: ${file}`);
      
      const migration = require(path.join(migrationDir, file));
      
      if (typeof migration.up === 'function') {
        // For migrations with up/down functions
        await migration.up(sequelize.getQueryInterface(), Sequelize);
      } else if (migration.default && typeof migration.default === 'function') {
        // For migrations exported as default
        await migration.default(sequelize.getQueryInterface(), Sequelize);
      } else {
        logger.warn(`Skipping invalid migration file: ${file}`);
      }
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Error running migrations:', error);
    throw error;
  }
}

// Run seeders
async function runSeeders() {
  logger.info('Running seeders...');
  
  try {
    // Get all seeder files
    const seederFiles = await fs.readdir(seederDir);
    
    // Filter JS files and sort them
    const jsFiles = seederFiles
      .filter(file => file.endsWith('.js'))
      .sort();
    
    if (jsFiles.length === 0) {
      logger.warn('No seeder files found');
      return;
    }
    
    // Create Sequelize instance
    const sequelize = new Sequelize(
      config.database,
      config.user,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        logging: (msg) => logger.debug(msg)
      }
    );
    
    // Run each seeder
    for (const file of jsFiles) {
      logger.info(`Running seeder: ${file}`);
      
      const seeder = require(path.join(seederDir, file));
      
      if (typeof seeder.up === 'function') {
        // For seeders with up/down functions
        await seeder.up(sequelize.getQueryInterface(), Sequelize);
      } else if (seeder.default && typeof seeder.default === 'function') {
        // For seeders exported as default
        await seeder.default(sequelize.getQueryInterface(), Sequelize);
      } else {
        logger.warn(`Skipping invalid seeder file: ${file}`);
      }
    }
    
    logger.info('All seeders completed successfully');
  } catch (error) {
    logger.error('Error running seeders:', error);
    throw error;
  }
}

// Main function
async function setupDatabase() {
  try {
    // Step 1: Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Step 2: Run migrations
    await runMigrations();
    
    // Step 3: Run seeders
    await runSeeders();
    
    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 