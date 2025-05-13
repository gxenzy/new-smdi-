/**
 * Setup Compliance Verification System
 * 
 * This script initializes the compliance verification system by running:
 * 1. Migrations to create database tables
 * 2. Seeders to populate initial data
 * 
 * Run with: node src/scripts/setup-compliance.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const sequelize = require('../database/sequelize');

// Import migrations and seeders
const standardsTableMigration = require('../database/migrations/20230824_create_standards_table');
const buildingTypeStandardsMigration = require('../database/migrations/20230825_create_building_type_standards');
const projectTypeStandardsMigration = require('../database/migrations/20230826_create_project_type_standards');
const complianceRecommendationsMigration = require('../database/migrations/20230827_create_compliance_recommendations');
const complianceVerificationsMigration = require('../database/migrations/20230828_create_compliance_verifications');
const complianceVerificationTablesMigration = require('../database/migrations/20240523_create_compliance_verification_tables');

// Import seeders
const standardsSeeder = require('../database/seeders/20230824_seed_standards');
const complianceRulesSeeder = require('../database/seeders/20230829_seed_compliance_rules');
const complianceRecommendationsSeeder = require('../database/seeders/20230830_seed_compliance_recommendations');
const buildingTypeStandardsSeeder = require('../database/seeders/building_type_standards_seeder');
const projectTypeStandardsSeeder = require('../database/seeders/project_type_standards_seeder');

async function setupCompliance() {
  try {
    logger.info('Starting compliance verification system setup...');
    
    // Run migrations
    logger.info('Running migrations...');
    
    try {
      await standardsTableMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Standards table migration completed');
    } catch (error) {
      logger.warn('Standards table migration failed, may already exist:', error.message);
    }
    
    try {
      await buildingTypeStandardsMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Building type standards table migration completed');
    } catch (error) {
      logger.warn('Building type standards table migration failed, may already exist:', error.message);
    }
    
    try {
      await projectTypeStandardsMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Project type standards table migration completed');
    } catch (error) {
      logger.warn('Project type standards table migration failed, may already exist:', error.message);
    }
    
    try {
      await complianceRecommendationsMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Compliance recommendations table migration completed');
    } catch (error) {
      logger.warn('Compliance recommendations table migration failed, may already exist:', error.message);
    }
    
    try {
      await complianceVerificationsMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Compliance verifications table migration completed');
    } catch (error) {
      logger.warn('Compliance verifications table migration failed, may already exist:', error.message);
    }
    
    try {
      await complianceVerificationTablesMigration.up();
      logger.info('✅ Compliance verification tables migration completed');
    } catch (error) {
      logger.warn('Compliance verification tables migration failed, may already exist:', error.message);
    }
    
    // Run seeders
    logger.info('Running seeders...');
    
    try {
      await standardsSeeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Standards seeder completed');
    } catch (error) {
      logger.warn('Standards seeder failed, data may already exist:', error.message);
    }
    
    try {
      await complianceRulesSeeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Compliance rules seeder completed');
    } catch (error) {
      logger.warn('Compliance rules seeder failed, data may already exist:', error.message);
    }
    
    try {
      await complianceRecommendationsSeeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Compliance recommendations seeder completed');
    } catch (error) {
      logger.warn('Compliance recommendations seeder failed, data may already exist:', error.message);
    }
    
    try {
      await buildingTypeStandardsSeeder();
      logger.info('✅ Building type standards seeder completed');
    } catch (error) {
      logger.warn('Building type standards seeder failed, data may already exist:', error.message);
    }
    
    try {
      await projectTypeStandardsSeeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      logger.info('✅ Project type standards seeder completed');
    } catch (error) {
      logger.warn('Project type standards seeder failed, data may already exist:', error.message);
    }
    
    logger.info('Compliance verification system setup completed successfully.');
  } catch (error) {
    logger.error('Error during compliance setup:', error);
  } finally {
    try {
      await sequelize.close();
    } catch (err) {
      logger.error('Error closing database connection:', err);
    }
  }
}

setupCompliance(); 