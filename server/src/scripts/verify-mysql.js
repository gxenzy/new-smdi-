/**
 * MySQL Database Verification Script
 * 
 * This script:
 * 1. Checks if MySQL is accessible with provided credentials
 * 2. Creates the database if it doesn't exist
 * 3. Tests table creation privileges
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'sdmi',
  password: process.env.DB_PASS || 'SMD1SQLADM1N'
};

const dbName = process.env.DB_NAME || 'energyauditdb';

async function verifyMySQLConnection() {
  console.log('=== MySQL Connection Test ===');
  console.log(`Attempting to connect to: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`With user: ${dbConfig.user}`);
  
  try {
    // First try to connect to MySQL without database
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Successfully connected to MySQL server');
    
    // Check if database exists
    const [rows] = await connection.execute(`SHOW DATABASES LIKE '${dbName}'`);
    
    if (rows.length === 0) {
      console.log(`Database '${dbName}' does not exist, creating it...`);
      await connection.execute(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully`);
    } else {
      console.log(`✓ Database '${dbName}' already exists`);
    }
    
    // Connect to the database and test privileges
    await connection.execute(`USE ${dbName}`);
    console.log(`✓ Connected to database '${dbName}'`);
    
    // Try to create a test table
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS _test_table (
          id INT PRIMARY KEY,
          test_column VARCHAR(255)
        )
      `);
      console.log('✓ Successfully created test table - write permissions OK');
      
      // Clean up the test table
      await connection.execute('DROP TABLE _test_table');
      console.log('✓ Successfully cleaned up test table');
    } catch (err) {
      console.error('✗ Failed to create test table - you may not have write permissions:', err.message);
    }
    
    connection.end();
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:');
    console.error(`  Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('  Possible causes:');
      console.error('  - MySQL server is not running');
      console.error('  - MySQL server is not accessible at the specified host/port');
      console.error('  Solution: Start MySQL server or check host/port settings');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  Possible causes:');
      console.error('  - Username or password is incorrect');
      console.error('  - User does not have access from this host');
      console.error('  Solution: Check username/password in .env file or grant access to this user');
    }
    return false;
  }
}

// Run the verification
verifyMySQLConnection().then(success => {
  if (success) {
    console.log('\n✓ MySQL connection and database setup successful');
  } else {
    console.error('\n✗ MySQL verification failed - fix the errors above and retry');
    process.exit(1);
  }
}); 