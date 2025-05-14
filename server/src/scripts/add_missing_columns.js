const { pool } = require('../config/database');

/**
 * Script to add missing columns to users table
 */
async function addMissingColumns() {
  try {
    console.log('Adding missing columns to users table...');
    
    const connection = await pool.getConnection();
    
    try {
      // Check if student_id column exists
      const [studentIdCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND column_name = 'student_id'
      `);
      
      if (studentIdCheck[0].count === 0) {
        console.log('Adding student_id column');
        await connection.query('ALTER TABLE users ADD COLUMN student_id VARCHAR(50) NULL');
      } else {
        console.log('student_id column already exists');
      }
      
      // Check if department column exists
      const [departmentCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND column_name = 'department'
      `);
      
      if (departmentCheck[0].count === 0) {
        console.log('Adding department column');
        await connection.query('ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL');
      } else {
        console.log('department column already exists');
      }
      
      // Check if position column exists
      const [positionCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND column_name = 'position'
      `);
      
      if (positionCheck[0].count === 0) {
        console.log('Adding position column');
        await connection.query('ALTER TABLE users ADD COLUMN position VARCHAR(100) NULL');
      } else {
        console.log('position column already exists');
      }
      
      // Check if phone_number column exists
      const [phoneCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND column_name = 'phone_number'
      `);
      
      if (phoneCheck[0].count === 0) {
        console.log('Adding phone_number column');
        await connection.query('ALTER TABLE users ADD COLUMN phone_number VARCHAR(50) NULL');
      } else {
        console.log('phone_number column already exists');
      }
      
      // Check if profile_image column exists
      const [profileCheck] = await connection.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND column_name = 'profile_image'
      `);
      
      if (profileCheck[0].count === 0) {
        console.log('Adding profile_image column');
        await connection.query('ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL');
      } else {
        console.log('profile_image column already exists');
      }
      
      console.log('Successfully added all missing columns');
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

// Run the script
addMissingColumns(); 