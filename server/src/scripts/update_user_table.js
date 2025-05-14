const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

/**
 * Script to add profile fields to users table
 */
async function updateUserTable() {
  try {
    console.log('Adding profile fields to users table...');
    
    // Load migration SQL
    const sqlPath = path.join(__dirname, '../database/migrations/add_profile_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log('User table updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating user table:', error);
    process.exit(1);
  }
}

// Run the update
updateUserTable(); 