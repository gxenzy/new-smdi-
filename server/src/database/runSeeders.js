/**
 * Script to run all seeders in the proper order
 */
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import seeders
const buildingTypeStandardsSeeder = require('./seeders/building_type_standards_seeder');
const projectTypeStandardsSeeder = require('./seeders/project_type_standards_seeder');
const complianceRecommendationsSeeder = require('./seeders/compliance_recommendations_seeder');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'energyaudit',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log
  }
);

async function runSeeders() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    console.log('Running building type standards seeder...');
    await buildingTypeStandardsSeeder.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Building type standards seeder completed.');

    console.log('Running project type standards seeder...');
    await projectTypeStandardsSeeder.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Project type standards seeder completed.');

    console.log('Running compliance recommendations seeder...');
    await complianceRecommendationsSeeder.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Compliance recommendations seeder completed.');

    console.log('All seeders completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders(); 