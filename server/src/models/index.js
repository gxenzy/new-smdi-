/**
 * Initialize Sequelize models and associations
 */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');
const basename = path.basename(__filename);
const db = {};

// Load all model files in the current directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.endsWith('.js') &&
      !file.endsWith('.test.js')
    );
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file));
      if (model.init && typeof model.init === 'function') {
        // For models defined using class syntax
        db[model.name] = model;
      } else if (model.default && model.default.init && typeof model.default.init === 'function') {
        // For ES modules
        db[model.default.name] = model.default;
      }
    } catch (error) {
      console.error(`Error loading model file ${file}:`, error);
    }
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 