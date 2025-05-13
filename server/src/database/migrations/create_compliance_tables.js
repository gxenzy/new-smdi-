/**
 * Create tables for compliance checkers
 */
const mysql = require('mysql2/promise');
const config = require('../../config/db');
const logger = require('../../utils/logger');

async function up() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    logger.info('Running migration: Create Compliance Tables');
    
    // Create compliance_rules table
    await connection.execute(`
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
        INDEX idx_section_id (section_id),
        INDEX idx_rule_code (rule_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    logger.info('Created compliance_rules table');
    
    // Create compliance_checklists table 
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS compliance_checklists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INT,
        status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    logger.info('Created compliance_checklists table');
    
    // Create compliance_checks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS compliance_checks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        checklist_id INT NOT NULL,
        rule_id INT NOT NULL,
        status ENUM('pending', 'passed', 'failed', 'not_applicable') DEFAULT 'pending',
        notes TEXT,
        evidence TEXT,
        checked_by INT,
        checked_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_rule_checklist (checklist_id, rule_id),
        INDEX idx_checklist_id (checklist_id),
        INDEX idx_rule_id (rule_id),
        FOREIGN KEY (checklist_id) REFERENCES compliance_checklists(id) ON DELETE CASCADE,
        FOREIGN KEY (rule_id) REFERENCES compliance_rules(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    logger.info('Created compliance_checks table');
    
    // Insert some default compliance rules
    await connection.execute(`
      INSERT INTO compliance_rules 
        (rule_code, title, description, severity, type, verification_method, 
         evaluation_criteria, failure_impact, remediation_advice)
      VALUES
        ('PEC-IL-001', 'Minimum Illumination Levels', 
         'Illumination levels must meet minimum requirements specified in PEC 2017 for the specific room type and usage.', 
         'critical', 'mandatory', 'On-site measurement with calibrated light meter',
         'Measured average lux level must be at least 90% of required minimum',
         'Insufficient lighting causing eye strain, safety hazards, and reduced productivity',
         'Increase lamp power, add fixtures, or reduce fixture spacing'),
        
        ('PEC-IL-002', 'Light Uniformity', 
         'Illumination must be uniformly distributed to avoid dark spots and excessive brightness variation.',
         'major', 'performance', 'Measurement grid of 9 points minimum per standard room',
         'Minimum to maximum ratio should not exceed 1:3',
         'Visual discomfort, reduced visibility, and increased risk of accidents',
         'Adjust fixture spacing, add supplementary lighting, or use diffusers'),
         
        ('PEC-IL-003', 'Emergency Lighting Compliance',
         'Emergency lighting must provide minimum illumination for safe egress during power failures.',
         'critical', 'mandatory', 'Visual inspection and light meter measurement during simulated power failure',
         'Minimum 10 lux at floor level along egress paths',
         'Life safety risk during emergency evacuation',
         'Install additional emergency fixtures or adjust placement')
    `);
    
    logger.info('Inserted default compliance rules');
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * Drop compliance-related tables
 */
async function down() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    logger.info('Rolling back migration: Create Compliance Tables');
    
    // Drop tables in reverse order to handle foreign key constraints
    await connection.execute(`DROP TABLE IF EXISTS compliance_checks;`);
    logger.info('Dropped compliance_checks table');
    
    await connection.execute(`DROP TABLE IF EXISTS compliance_checklists;`);
    logger.info('Dropped compliance_checklists table');
    
    await connection.execute(`DROP TABLE IF EXISTS compliance_rules;`);
    logger.info('Dropped compliance_rules table');
    
    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { up, down }; 