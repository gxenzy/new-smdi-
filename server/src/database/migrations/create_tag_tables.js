/**
 * Migration script to create tables for the standards tagging system
 */

const mysql = require('mysql2/promise');
const config = require('../../config/db');
const logger = require('../../utils/logger');

async function up() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    logger.info('Running migration: Create Tag Tables');
    
    // Create standard_tags table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS standard_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    logger.info('Created standard_tags table');

    // Create section_tags table without foreign key constraint to standard_sections
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS section_tags (
        section_id INT NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (section_id, tag_id),
        FOREIGN KEY (tag_id) REFERENCES standard_tags(id) ON DELETE CASCADE,
        INDEX idx_section_id (section_id),
        INDEX idx_tag_id (tag_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    logger.info('Created section_tags table with indexes');
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
    
    logger.info('Rolling back migration: Create Tag Tables');
    
    // Drop tables in reverse order
    await connection.execute(`DROP TABLE IF EXISTS section_tags;`);
    await connection.execute(`DROP TABLE IF EXISTS standard_tags;`);
    
    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = { up, down }; 
 
 