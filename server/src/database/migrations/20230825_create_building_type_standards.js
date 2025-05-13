/**
 * Migration to create the building_type_standards table
 * Stores building type specific standard values (EUI, LPD, etc.)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('building_type_standards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      building_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      standard_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      standard_code: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      minimum_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      maximum_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      source_standard_id: {
        type: Sequelize.INTEGER,
        allowNull: true
        // Remove foreign key reference temporarily
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

    // Add indexes for better query performance, but only if they don't already exist
    const indexes = await queryInterface.showIndex('building_type_standards');
    const hasTypeIndex = indexes.some(idx => idx.name === 'building_type_standards_building_type_standard_type');
    if (!hasTypeIndex) {
      await queryInterface.addIndex('building_type_standards', ['building_type', 'standard_type'], { name: 'building_type_standards_building_type_standard_type' });
    }
    const hasCodeIndex = indexes.some(idx => idx.name === 'building_type_standards_standard_code');
    if (!hasCodeIndex) {
      await queryInterface.addIndex('building_type_standards', ['standard_code'], { name: 'building_type_standards_standard_code' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('building_type_standards');
  }
}; 