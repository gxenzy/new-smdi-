/**
 * Create Test User Script
 * 
 * This script creates a test user for API testing
 * Run with: node src/scripts/create-test-user.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

async function createTestUser() {
  let connection;
  
  try {
    logger.info('Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    
    // Check if users table exists
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME}' 
        AND table_name = 'users'
    `);
    
    if (tables.length === 0) {
      logger.info('Creating users table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          role ENUM('admin', 'user', 'auditor') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_role (role)
        )
      `);
    }
    
    // Check if test user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      ['testuser']
    );
    
    if (existingUsers.length > 0) {
      logger.info('Test user already exists, updating password...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await connection.query(
        'UPDATE users SET password = ?, role = ? WHERE username = ?',
        [hashedPassword, 'admin', 'testuser']
      );
      
      logger.info('Test user updated successfully');
    } else {
      logger.info('Creating test user...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await connection.query(
        'INSERT INTO users (username, password, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['testuser', hashedPassword, 'test@example.com', 'Test', 'User', 'admin']
      );
      
      logger.info('Test user created successfully');
    }
    
    logger.info('Test user credentials:');
    logger.info('- Username: testuser');
    logger.info('- Password: password123');
    logger.info('- Role: admin');
    
  } catch (error) {
    logger.error('Error creating test user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
createTestUser(); 