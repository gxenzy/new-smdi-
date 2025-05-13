/**
 * Script to validate compliance verification database tables
 * 
 * This script checks if the compliance-related tables exist in the database
 * and prints their structure
 * 
 * Run with: node src/scripts/validate-compliance-tables.js
 */

require('dotenv').config();
const sequelize = require('../database/sequelize');
const logger = require('../utils/logger');

async function validateComplianceTables() {
  try {
    logger.info('Connecting to database...');
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    const tables = [
      'standards',
      'building_type_standards',
      'project_type_standards',
      'compliance_rules',
      'compliance_recommendations',
      'compliance_verifications'
    ];

    logger.info('Checking tables...');
    
    for (const table of tables) {
      try {
        const [result] = await sequelize.query(`
          SELECT * 
          FROM information_schema.tables 
          WHERE table_schema = '${process.env.DB_NAME}' 
            AND table_name = '${table}'
        `);

        if (result.length > 0) {
          logger.info(`✅ Table '${table}' exists`);
          
          // Get table structure
          const [columns] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = '${process.env.DB_NAME}'
              AND table_name = '${table}'
            ORDER BY ordinal_position
          `);
          
          logger.info(`Table structure for '${table}':`);
          columns.forEach(col => {
            logger.info(`  - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
          });
          
          // Get row count
          const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
          logger.info(`  - Row count: ${count[0].count}`);
          
        } else {
          logger.error(`❌ Table '${table}' does not exist`);
        }
      } catch (err) {
        logger.error(`Error checking table '${table}':`, err);
      }
    }

    logger.info('Database validation complete');
  } catch (err) {
    logger.error('Database validation failed:', err);
  } finally {
    try {
      await sequelize.close();
    } catch (err) {
      logger.error('Error closing database connection:', err);
    }
  }
}

validateComplianceTables(); 