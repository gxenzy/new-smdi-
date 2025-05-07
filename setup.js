const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  db: {
    name: 'energyauditdb',
    user: 'sdmisql',
    password: 'cXg4uIEMAUQ2zy5O'
  },
  jwt: {
    secret: 'e465aa6a212abe4bb21fb3218aa044ed2be68720b46298c20b22f861ab7324f3d299f35ec4720e2ab57a03e4810a7a885e5aac6c1'
  },
  ports: {
    client: 3000,
    server: 5000
  }
};

// Create server .env file
const serverEnv = `PORT=${config.ports.server}
NODE_ENV=development
DB_HOST=localhost
DB_USER=${config.db.user}
DB_PASS=${config.db.password}
DB_NAME=${config.db.name}
JWT_SECRET=${config.jwt.secret}
CORS_ORIGIN=http://localhost:${config.ports.client}
`;

// Create client .env file
const clientEnv = `REACT_APP_API_URL=http://localhost:${config.ports.server}/api
REACT_APP_WS_URL=ws://localhost:${config.ports.server}
REACT_APP_TITLE=Energy Audit Panel
`;

// Function to create .env files
function createEnvFiles() {
  console.log('Creating environment files...');
  
  // Server .env
  fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnv);
  console.log('✓ Created server/.env');
  
  // Client .env
  fs.writeFileSync(path.join(__dirname, 'client', '.env'), clientEnv);
  console.log('✓ Created client/.env');
}

// Function to set up database
function setupDatabase() {
  console.log('Setting up database...');
  try {
    // Run the database setup scripts
    execSync(`mysql -u ${config.db.user} -p${config.db.password} < server/setup_database.sql`);
    execSync(`mysql -u ${config.db.user} -p${config.db.password} < server/create_database_and_tables.sql`);
    execSync(`mysql -u ${config.db.user} -p${config.db.password} < server/setup_energy_monitoring_tables.sql`);
    console.log('✓ Database setup completed');
  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  }
}

// Function to install dependencies
function installDependencies() {
  console.log('Installing dependencies...');
  try {
    // Root dependencies
    execSync('npm install', { stdio: 'inherit' });
    
    // Server dependencies
    process.chdir('server');
    execSync('npm install', { stdio: 'inherit' });
    
    // Client dependencies
    process.chdir('../client');
    execSync('npm install', { stdio: 'inherit' });
    
    // Return to root
    process.chdir('..');
    console.log('✓ Dependencies installed');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Main setup function
async function setup() {
  console.log('Starting Energy Audit Panel setup...\n');
  
  try {
    createEnvFiles();
    setupDatabase();
    installDependencies();
    
    console.log('\n✓ Setup completed successfully!');
    console.log('\nTo start the application:');
    console.log('1. Start the backend: cd server && npm run dev');
    console.log('2. Start the frontend: cd client && npm start');
    console.log('\nOr use the root command to start both: npm start');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup(); 