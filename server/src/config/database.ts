import mysql from 'mysql2/promise';
import { ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smdi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Override the query method to return properly typed results
const originalQuery = pool.query;
pool.query = async function<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string | mysql.QueryOptions,
  values?: any
): Promise<[T, FieldPacket[]]> {
  return originalQuery.call(this, sql, values);
};

// Function to create and update tables
async function setupDatabase() {
  try {
    // Create attachments table
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

    // Create comments table
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

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        finding_id INT UNSIGNED NOT NULL,
        type ENUM('ASSIGNED', 'UPDATED', 'COMMENTED', 'CLOSED') NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Setup database on server startup
setupDatabase();

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to database:', error);
  });

export { pool }; 