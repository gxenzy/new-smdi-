require('dotenv').config();
const path = require('path');
const { seedStandards } = require('../database/seeders/standards_seed');

async function runSeeders() {
  try {
    console.log('Running database seeders...');
    
    // Run standards seeder
    await seedStandards();
    
    console.log('All seeders completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders(); 