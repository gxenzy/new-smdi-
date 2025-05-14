/**
 * Migration to create the compliance_verifications table
 * Stores verification results and compliance status
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('compliance_verifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      calculation_id: {
        type: Sequelize.STRING(36),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      result_data: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      compliant_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      non_compliant_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'needs_review'
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
    const indexes = await queryInterface.showIndex('compliance_verifications');
    const hasCalcIdIndex = indexes.some(idx => idx.name === 'compliance_verifications_calculation_id');
    if (!hasCalcIdIndex) {
      await queryInterface.addIndex('compliance_verifications', ['calculation_id'], { name: 'compliance_verifications_calculation_id' });
    }
    const hasUserCreatedAtIndex = indexes.some(idx => idx.name === 'compliance_verifications_user_id_created_at');
    if (!hasUserCreatedAtIndex) {
      await queryInterface.addIndex('compliance_verifications', ['user_id', 'created_at'], { name: 'compliance_verifications_user_id_created_at' });
    }
    const hasStatusIndex = indexes.some(idx => idx.name === 'compliance_verifications_status');
    if (!hasStatusIndex) {
      await queryInterface.addIndex('compliance_verifications', ['status'], { name: 'compliance_verifications_status' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('compliance_verifications');
  }
}; 