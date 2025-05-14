/**
 * Database Migration Runner
 * 
 * This script runs pending database migrations in order.
 * 
 * Usage:
 *   node run_migrations.js [--down] [--target=migration_name]
 * 
 * Options:
 *   --down            Run down migrations (rollback)
 *   --target=name     Run/rollback migrations up to and including the specified migration
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const sequelize = require('../database/sequelize');
const queryInterface = sequelize.getQueryInterface();
const SequelizeLib = require('sequelize');

// Parse command line arguments
const args = process.argv.slice(2);
const isDown = args.includes('--down');
const targetMigration = args.find(arg => arg.startsWith('--target='))?.split('=')[1];

// Get migration files - only include .js files
const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');
const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
  .filter(file => file.endsWith('.js')) // Only include .js files for now
  .sort(); // Sort to ensure migrations run in order by filename

logger.info(`Found ${migrationFiles.length} JavaScript migration files`);

async function runMigrations() {
  try {
    logger.info(`Running migrations in ${isDown ? 'down' : 'up'} direction`);
    
    // If target migration specified, slice the array
    let migrations = migrationFiles;
    if (targetMigration) {
      const targetIndex = migrations.findIndex(file => file.includes(targetMigration));
      if (targetIndex === -1) {
        throw new Error(`Target migration "${targetMigration}" not found`);
      }
      migrations = isDown ? migrations.slice(0, targetIndex + 1).reverse() : migrations.slice(0, targetIndex + 1);
    } else if (isDown) {
      // If rolling back all migrations, reverse the order
      migrations = migrations.reverse();
    }
    
    logger.info(`Found ${migrations.length} migrations to process`);
    
    // Run migrations
    for (const file of migrations) {
      let migration;
      try {
        migration = require(path.join(MIGRATIONS_DIR, file));
      } catch (error) {
        logger.error(`Failed to require migration file ${file}:`, error);
        throw new Error(`Failed to load migration ${file}: ${error.message}`);
      }
      
      // Validate migration has up/down methods
      if (!migration.up || typeof migration.up !== 'function') {
        throw new Error(`Migration ${file} is missing an 'up' function`);
      }
      
      if (isDown && (!migration.down || typeof migration.down !== 'function')) {
        throw new Error(`Migration ${file} is missing a 'down' function for rollback`);
      }
      
      logger.info(`Running migration ${file} (${isDown ? 'down' : 'up'})`);
      
      try {
        await (isDown
          ? migration.down(queryInterface, SequelizeLib)
          : migration.up(queryInterface, SequelizeLib)
        );
        logger.info(`Migration ${file} completed successfully`);
      } catch (error) {
        logger.error(`Migration ${file} failed:`, error);
        throw error; // Stop on first error
      }
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 