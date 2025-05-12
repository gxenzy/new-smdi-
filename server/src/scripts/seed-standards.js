/**
 * Standards Database Seeder
 * 
 * This script populates the database with standards data
 * Run with: node server/src/scripts/seed-standards.js
 */

const mongoose = require('mongoose');
const { Standard, Section } = require('../../models/Standard');
const { pecStandard, pecRules } = require('../database/seeders/pec1075Standards');
require('dotenv').config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    process.exit(1);
  }
};

// Seed Standards Data
const seedStandards = async () => {
  try {
    // Clear existing data
    await Standard.deleteMany({});
    await Section.deleteMany({});
    
    console.log('Previous data cleared.');
    
    // Add PEC Standard
    const standard = await Standard.create(pecStandard);
    console.log(`Added standard: ${standard.code_name}`);
    
    // Add PEC Rules/Sections
    for (const rule of pecRules) {
      const section = await Section.create({
        ...rule,
        standard_id: standard._id
      });
      console.log(`Added section: ${section.section_number} - ${section.title}`);
    }
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Run the seeder
connectDB().then(() => {
  seedStandards();
}); 