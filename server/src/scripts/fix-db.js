/**
 * Simple Database and Tables Fix Script
 */

const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'sdmi',
  password: process.env.DB_PASS || 'SMD1SQLADM1N'
};

const dbName = process.env.DB_NAME || 'energyauditdb';

// Connect to MySQL without selecting a database
const connection = mysql.createConnection(dbConfig);

console.log('=== MySQL Database Check and Fix ===');
console.log(`Connecting to: ${dbConfig.host}:${dbConfig.port}`);
console.log(`User: ${dbConfig.user}`);

connection.connect((err) => {
  if (err) {
    console.error('✗ Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  
  console.log('✓ Connected to MySQL server');
  
  // Create database if it doesn't exist
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error(`✗ Error creating database '${dbName}':`, err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log(`✓ Database '${dbName}' exists or was created`);
    
    // Use the database
    connection.query(`USE ${dbName}`, (err) => {
      if (err) {
        console.error(`✗ Error using database '${dbName}':`, err.message);
        connection.end();
        process.exit(1);
      }
      
      console.log(`✓ Using database '${dbName}'`);
      
      // Check tables
      const requiredTables = [
        'energy_audits',
        'standards',
        'compliance_rules',
        'compliance_checklists',
        'compliance_checks'
      ];
      
      let tablesChecked = 0;
      let tablesExist = 0;
      
      requiredTables.forEach(table => {
        connection.query(`SHOW TABLES LIKE '${table}'`, (err, results) => {
          if (err) {
            console.error(`✗ Error checking table '${table}':`, err.message);
          } else if (results.length > 0) {
            console.log(`✓ Table '${table}' exists`);
            tablesExist++;
          } else {
            console.log(`✗ Table '${table}' is missing`);
          }
          
          tablesChecked++;
          
          // If we've checked all tables, exit
          if (tablesChecked === requiredTables.length) {
            if (tablesExist === requiredTables.length) {
              console.log('\n✓ All required tables exist');
            } else {
              console.log(`\n✗ ${tablesExist}/${requiredTables.length} tables exist`);
              console.log('Run migrations to create missing tables:');
              console.log('npm run migrate');
            }
            connection.end();
          }
        });
      });
    });
  });
}); 