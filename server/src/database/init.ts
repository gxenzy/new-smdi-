import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';
import { seedStandards } from './seeders/standards_seeder';

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Read and execute standards tables migration
    const standardsTablesPath = path.join(__dirname, 'migrations/create_standards_tables.sql');
    if (fs.existsSync(standardsTablesPath)) {
      const standardsSchema = fs.readFileSync(standardsTablesPath, 'utf8');
      
      // Split schema into individual statements by semicolon
      const statements = standardsSchema
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
  
      // Execute each statement
      for (const statement of statements) {
        if (statement.length > 0) {
          try {
            console.log('Executing standards migration:', statement.substring(0, 50) + '...');
            await query(statement);
          } catch (err) {
            console.error('Error executing statement:', err);
            console.error('Failed statement:', statement);
            // Continue with next statement
          }
        }
      }
    }

    // Run seeders
    console.log('Running seeders...');
    await seedStandards();

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed successfully.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase; 