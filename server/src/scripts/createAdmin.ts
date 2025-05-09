import * as bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'admin123';
    const firstName = 'Admin';
    const lastName = 'User';
    const role = 'admin';

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    console.log('Checking if user exists...');
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    console.log('Creating new admin user...');
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, firstName, lastName, role]
    );
    console.log('Insert result:', result);

    console.log('Admin user created successfully');
    console.log('Username:', username);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  } finally {
    process.exit();
  }
}

createAdminUser(); 