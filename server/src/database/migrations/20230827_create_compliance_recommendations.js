/**
 * Migration to create the compliance_recommendations table
 * Stores recommendation templates for non-compliant results
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('compliance_recommendations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      rule_id: {
        type: Sequelize.INTEGER,
        allowNull: false
        // Temporarily remove foreign key constraint
      },
      non_compliance_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      recommendation_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('high', 'medium', 'low'),
        defaultValue: 'medium',
        allowNull: false
      },
      calculator_type: {
        type: Sequelize.STRING(50),
        allowNull: false
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
    const indexes = await queryInterface.showIndex('compliance_recommendations');
    const hasRuleIdIndex = indexes.some(idx => idx.name === 'compliance_recommendations_rule_id');
    if (!hasRuleIdIndex) {
      await queryInterface.addIndex('compliance_recommendations', ['rule_id'], { name: 'compliance_recommendations_rule_id' });
    }
    const hasCalcTypeIndex = indexes.some(idx => idx.name === 'compliance_recommendations_calculator_type_non_compliance_type');
    if (!hasCalcTypeIndex) {
      await queryInterface.addIndex('compliance_recommendations', ['calculator_type', 'non_compliance_type'], { name: 'compliance_recommendations_calculator_type_non_compliance_type' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('compliance_recommendations');
  }
}; 