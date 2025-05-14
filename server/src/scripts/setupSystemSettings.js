const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

/**
 * Script to set up the system settings table
 */
async function setupSystemSettings() {
  try {
    console.log('Setting up system settings table...');
    
    // Load migration SQL
    const sqlPath = path.join(__dirname, '../database/migrations/create_system_settings_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log('System settings table setup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up system settings table:', error);
    process.exit(1);
  }
}

// Run the setup
setupSystemSettings(); 