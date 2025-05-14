const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Password to hash - change this as needed
const password = 'Renz#143';

async function hashPassword() {
  console.log(`Creating hashed password for: ${password}`);
  
  try {
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Hashed password:');
    console.log(hashedPassword);
    
    // Database connection config
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'sdmi',
      password: process.env.DB_PASS || 'SMD1SQLADM1N',
      database: process.env.DB_NAME || 'energyauditdb',
    };
    
    console.log('Checking admin user in database...');
    
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if admin user exists
    const [users] = await connection.execute(
      "SELECT id, username, role FROM users WHERE username = 'renzyadmin' LIMIT 1"
    );
    
    if (users.length === 0) {
      console.log('Admin user not found, creating...');
      
      // Insert admin user - removed status field
      await connection.execute(
        `INSERT INTO users (username, password, email, role, first_name, last_name, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        ['renzyadmin', hashedPassword, 'renzylaurenzlogrono@gmail.com', 'admin', 'Renzy', 'Logroño']
      );
      
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user exists, updating password...');
      
      // Update admin password
      await connection.execute(
        "UPDATE users SET password = ? WHERE username = 'renzyadmin'",
        [hashedPassword]
      );
      
      console.log('Admin password updated successfully!');
    }
    
    // Close connection
    await connection.end();
    
    console.log('\nYou can now login with:');
    console.log('Username: renzyadmin');
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
hashPassword(); 