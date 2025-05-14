import mysql from 'mysql2/promise';
import { ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env
const envPath = path.resolve(process.cwd(), '.env');
console.log('Reading .env from:', envPath);
try {
  // Check if file exists without storing it in a variable
  fs.readFileSync(envPath, 'utf-8');
  console.log('.env file found');
} catch (e) {
  console.error('Could not read .env file:', e);
}
dotenv.config({ path: envPath });

console.log('Database configuration:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_USER:', process.env.DB_USER || 'sdmi');
console.log('DB_NAME:', process.env.DB_NAME || 'energyauditdb');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'sdmi',
  password: process.env.DB_PASS || 'SMD1SQLADM1N',
  database: process.env.DB_NAME || 'energyauditdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Helper functions for database queries
export const query = async (text: string, params: any[] = []): Promise<any> => {
  try {
    const start = Date.now();
    const [rows] = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: Array.isArray(rows) ? rows.length : 1 });
    }
    
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Transaction helper
export const transaction = async (callback: (connection: mysql.PoolConnection) => Promise<any>): Promise<any> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Override the query method to return properly typed results
const originalQuery = pool.query;
pool.query = async function<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string | mysql.QueryOptions,
  values?: any
): Promise<[T, FieldPacket[]]> {
  return originalQuery.call(this, sql, values);
};

// Function to run a migration file
async function runMigration(filename: string) {
  try {
    const filePath = path.join(__dirname, '../database/migrations', filename);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await pool.query(sql);
    console.log(`Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`Error running migration ${filename}:`, error);
    throw error;
  }
}

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
    
    // Setup database after successful connection
    setupDatabase().catch(err => {
      console.error('Database setup error:', err);
    });
  })
  .catch(error => {
    console.error('Error connecting to database:', error);
  });

// Function to create and update tables
async function setupDatabase() {
  try {
    // Run migrations in order
    const migrations = [
      '001_create_users_table.sql',
      '002_create_findings_table.sql',
      'create_power_readings_table.sql'
    ];

    for (const migration of migrations) {
      await runMigration(migration);
    }

    // Create attachments table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        finding_id INT UNSIGNED NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        uploaded_by INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);

    // Create comments table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        finding_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create notifications table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        finding_id INT UNSIGNED,
        type ENUM('ASSIGNED', 'UPDATED', 'COMMENTED', 'CLOSED', 'SYSTEM') NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE SET NULL
      )
    `);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

export { pool }; 