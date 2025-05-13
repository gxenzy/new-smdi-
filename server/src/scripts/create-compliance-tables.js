/**
 * Script to directly create the compliance-related tables
 * Run with: node server/src/scripts/create-compliance-tables.js
 */

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/db');
const logger = require('../utils/logger');

// Create Sequelize instance
let sequelize;

if (config.uri) {
  sequelize = new Sequelize(config.uri, {
    logging: (msg) => logger.debug(msg)
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
      logging: (msg) => logger.debug(msg)
    }
  );
}

// Synchronize the database
async function createTables() {
  try {
    logger.info('Creating database tables...');
    
    // First, try to drop foreign keys that might cause issues
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      logger.info('Disabled foreign key checks');
    } catch (error) {
      logger.warn('Could not disable foreign key checks:', error.message);
    }
    
    // Create tables directly with raw SQL to avoid Sequelize sync issues
    try {
      // Create standards table first
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS standards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code_name VARCHAR(50) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          version VARCHAR(50) NOT NULL,
          issuing_body VARCHAR(255) NOT NULL,
          effective_date DATE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_code_name (code_name),
          INDEX idx_version (version)
        );
      `);
      logger.info('Created standards table');
      
      // Create building_type_standards table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS building_type_standards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          building_type VARCHAR(50) NOT NULL,
          standard_type VARCHAR(50) NOT NULL,
          standard_code VARCHAR(50) NOT NULL,
          minimum_value DECIMAL(10, 2),
          maximum_value DECIMAL(10, 2),
          unit VARCHAR(20),
          source_standard_id INT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_building_standard (building_type, standard_type),
          INDEX idx_standard_code (standard_code)
        );
      `);
      logger.info('Created building_type_standards table');
      
      // Create project_type_standards table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS project_type_standards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          project_type VARCHAR(50) NOT NULL,
          standard_type VARCHAR(50) NOT NULL,
          standard_code VARCHAR(50) NOT NULL,
          minimum_value DECIMAL(10, 2),
          maximum_value DECIMAL(10, 2),
          unit VARCHAR(20),
          source_standard_id INT,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_project_standard (project_type, standard_type),
          INDEX idx_standard_code (standard_code)
        );
      `);
      logger.info('Created project_type_standards table');
      
      // Create compliance_rules table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS compliance_rules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          section_id INT, 
          rule_code VARCHAR(20) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          severity ENUM('critical', 'major', 'minor') DEFAULT 'major',
          type ENUM('prescriptive', 'performance', 'mandatory') DEFAULT 'mandatory',
          verification_method VARCHAR(255),
          evaluation_criteria TEXT,
          failure_impact TEXT,
          remediation_advice TEXT,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_rule_code (rule_code)
        );
      `);
      logger.info('Created compliance_rules table');
      
      // Create compliance_recommendations table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS compliance_recommendations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          rule_id INT NOT NULL,
          non_compliance_type VARCHAR(50) NOT NULL,
          recommendation_text TEXT NOT NULL,
          priority ENUM('high', 'medium', 'low') DEFAULT 'medium' NOT NULL,
          calculator_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_rule_id (rule_id),
          INDEX idx_calculator_type (calculator_type, non_compliance_type)
        );
      `);
      logger.info('Created compliance_recommendations table');
      
      // Re-enable foreign key checks
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      logger.info('Re-enabled foreign key checks');
      
    } catch (error) {
      logger.error('Error creating tables:', error);
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      throw error;
    }
    
    // Add initial standards
    try {
      await sequelize.query(`
        INSERT INTO standards (code_name, full_name, version, issuing_body, effective_date, description)
        VALUES 
        ('PEC 2017', 'Philippine Electrical Code', '2017', 'IIEE', '2017-01-01', 'The Philippine Electrical Code (PEC) sets the minimum standards for electrical installations.'),
        ('ASHRAE 90.1', 'Energy Standard for Buildings Except Low-Rise Residential Buildings', '2019', 'ASHRAE', '2019-10-31', 'ASHRAE 90.1 provides minimum requirements for energy-efficient design of buildings.');
      `);
      logger.info('Initial standards added');
    } catch (error) {
      logger.warn('Could not add standards:', error.message);
    }
    
    // Add sample rules
    try {
      await sequelize.query(`
        INSERT INTO compliance_rules (rule_code, title, description, severity, type, verification_method, evaluation_criteria)
        VALUES
        ('PEC-1075', 'Minimum Illumination Levels', 'Illumination levels must meet minimum requirements specified in PEC 2017.', 'critical', 'mandatory', 'On-site measurement with calibrated light meter', 'Minimum of 500 lux for office spaces'),
        ('PGBC-LPD', 'Maximum Lighting Power Density', 'LPD must not exceed maximum values specified in green building standards.', 'major', 'performance', 'Calculate total wattage per square meter', 'Maximum of 10 W/m² for office spaces'),
        ('FNANCL-ROI', 'Minimum ROI for Energy Projects', 'Energy retrofits should meet minimum ROI requirements.', 'major', 'performance', 'Financial calculation', 'Minimum ROI of 15% for lighting retrofits');
      `);
      logger.info('Initial compliance rules added');
    } catch (error) {
      logger.warn('Could not add rules:', error.message);
    }
    
    // Add sample building standards
    try {
      await sequelize.query(`
        INSERT INTO building_type_standards (building_type, standard_type, standard_code, minimum_value, maximum_value, unit, description)
        VALUES
        ('office', 'illumination', 'PEC-1075-ILLUM', 500, NULL, 'lux', 'Minimum illumination level for office spaces'),
        ('classroom', 'illumination', 'PEC-1075-ILLUM', 500, NULL, 'lux', 'Minimum illumination level for classroom spaces'),
        ('hallway', 'illumination', 'PEC-1075-ILLUM', 100, NULL, 'lux', 'Minimum illumination level for hallways'),
        ('office', 'lpd', 'PGBC-LPD-2019', NULL, 10, 'W/m²', 'Maximum LPD for office spaces');
      `);
      logger.info('Initial building standards added');
    } catch (error) {
      logger.warn('Could not add building standards:', error.message);
    }
    
    // Add sample project standards
    try {
      await sequelize.query(`
        INSERT INTO project_type_standards (project_type, standard_type, standard_code, minimum_value, maximum_value, unit, description)
        VALUES
        ('lighting_retrofit', 'roi', 'FNANCL-ROI-2022', 15, NULL, '%', 'Minimum ROI for lighting retrofit projects'),
        ('lighting_retrofit', 'payback', 'FNANCL-PAYBCK-2022', NULL, 3, 'years', 'Maximum payback period for lighting retrofit projects'),
        ('hvac_upgrade', 'roi', 'FNANCL-ROI-2022', 12, NULL, '%', 'Minimum ROI for HVAC upgrade projects'),
        ('renewable_energy', 'roi', 'FNANCL-ROI-2022', 10, NULL, '%', 'Minimum ROI for renewable energy projects');
      `);
      logger.info('Initial project standards added');
    } catch (error) {
      logger.warn('Could not add project standards:', error.message);
    }
    
    // Add sample recommendations
    try {
      await sequelize.query(`
        INSERT INTO compliance_recommendations (rule_id, non_compliance_type, recommendation_text, priority, calculator_type)
        VALUES
        (1, 'below_minimum', 'Increase lighting levels by adding fixtures or increasing lamp wattage to meet the minimum illumination requirement.', 'high', 'illumination'),
        (2, 'above_maximum', 'Reduce lighting power density by replacing fixtures with more efficient options or reducing the number of fixtures.', 'medium', 'lpd'),
        (3, 'below_minimum', 'Review project financials to improve ROI through increased energy savings or reduced implementation costs.', 'medium', 'roi');
      `);
      logger.info('Initial recommendations added');
    } catch (error) {
      logger.warn('Could not add recommendations:', error.message);
    }

    // Close connection
    await sequelize.close();
    logger.info('Database setup complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error setting up database:', error);
    try {
      await sequelize.close();
    } catch (err) {
      // Ignore error on close
    }
    process.exit(1);
  }
}

// Run the function
createTables(); 