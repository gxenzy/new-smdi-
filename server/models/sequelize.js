const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create the Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'energyauditdb',
  process.env.DB_USER || 'smdi',
  process.env.DB_PASS || 'SMD1SQLADM1N',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize; 