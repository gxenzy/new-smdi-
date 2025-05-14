/**
 * Migration to create the standards table that other migration files depend on
 */
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First create the standards table which is referenced by other tables
    await queryInterface.createTable('standards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      issuing_body: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      effective_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance, but only if they don't already exist
    const indexes = await queryInterface.showIndex('standards');
    const hasCodeNameIndex = indexes.some(idx => idx.name === 'standards_code_name');
    if (!hasCodeNameIndex) {
      await queryInterface.addIndex('standards', ['code_name'], { name: 'standards_code_name' });
    }
    const hasVersionIndex = indexes.some(idx => idx.name === 'standards_version');
    if (!hasVersionIndex) {
      await queryInterface.addIndex('standards', ['version'], { name: 'standards_version' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('standards');
  }
}; 