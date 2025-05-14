/**
 * Migration: Create Compliance Verification Tables
 * Creates tables for storing calculation compliance verification data
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
        calculation_id VARCHAR(64) NOT NULL,
        user_id INT,
        status ENUM('passed', 'failed', 'needs_review') NOT NULL DEFAULT 'needs_review',
        compliant_count INT NOT NULL DEFAULT 0,
        non_compliant_count INT NOT NULL DEFAULT 0,
        needs_review_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(calculation_id),
        INDEX(user_id),
        UNIQUE KEY(calculation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
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
        INDEX(verification_id),
        INDEX(rule_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
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
    
    // Drop tables in reverse order
    await connection.execute(`DROP TABLE IF EXISTS calculation_compliance_details;`);
    await connection.execute(`DROP TABLE IF EXISTS calculation_compliance_verifications;`);
    
    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { up, down }; 