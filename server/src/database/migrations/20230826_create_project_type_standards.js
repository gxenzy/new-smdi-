/**
 * Migration to create the project_type_standards table
 * Stores project type specific standard values (for ROI, payback, etc.)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('project_type_standards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      project_type: {
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
        allowNull: true,
        // Remove the references section temporarily to allow the table to be created
        // We can add the constraint later once we understand the exact data types
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
    const indexes = await queryInterface.showIndex('project_type_standards');
    const hasTypeIndex = indexes.some(idx => idx.name === 'project_type_standards_project_type_standard_type');
    if (!hasTypeIndex) {
      await queryInterface.addIndex('project_type_standards', ['project_type', 'standard_type'], { name: 'project_type_standards_project_type_standard_type' });
    }
    const hasCodeIndex = indexes.some(idx => idx.name === 'project_type_standards_standard_code');
    if (!hasCodeIndex) {
      await queryInterface.addIndex('project_type_standards', ['standard_code'], { name: 'project_type_standards_standard_code' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('project_type_standards');
  }
}; 