/**
 * Migration script to create tables for compliance verification
 */

const mysql = require('mysql2/promise');
const config = require('../../config/db');
const logger = require('../../utils/logger');

async function up() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    logger.info('Running migration: Create Compliance Verification Tables');
    
    // Create calculation_compliance_verifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS calculation_compliance_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        calculation_id VARCHAR(36) NOT NULL,
        user_id INT,
        status ENUM('passed', 'failed', 'needs_review') NOT NULL DEFAULT 'needs_review',
        compliant_count INT NOT NULL DEFAULT 0,
        non_compliant_count INT NOT NULL DEFAULT 0,
        needs_review_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_calculation (calculation_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    logger.info('Created calculation_compliance_verifications table');
    
    // Create calculation_compliance_details table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS calculation_compliance_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        verification_id INT NOT NULL,
        rule_id INT NOT NULL,
        status ENUM('compliant', 'non_compliant', 'needs_review') NOT NULL DEFAULT 'needs_review',
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (verification_id) REFERENCES calculation_compliance_verifications(id) ON DELETE CASCADE,
        FOREIGN KEY (rule_id) REFERENCES compliance_rules(id) ON DELETE CASCADE,
        UNIQUE KEY unique_verification_rule (verification_id, rule_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    logger.info('Created calculation_compliance_details table');
    
    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

async function down() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    logger.info('Rolling back migration: Create Compliance Verification Tables');
    
    // Drop tables in reverse order (to handle foreign key constraints)
    await connection.execute(`DROP TABLE IF EXISTS calculation_compliance_details;`);
    logger.info('Dropped calculation_compliance_details table');
    
    await connection.execute(`DROP TABLE IF EXISTS calculation_compliance_verifications;`);
    logger.info('Dropped calculation_compliance_verifications table');
    
    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { up, down }; 