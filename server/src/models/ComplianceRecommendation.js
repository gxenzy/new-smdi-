/**
 * ComplianceRecommendation model
 * Represents recommendation templates for non-compliant results
 */
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

class ComplianceRecommendation extends Model {
  static associate(models) {
    ComplianceRecommendation.belongsTo(models.ComplianceRule, {
      foreignKey: 'rule_id',
      as: 'rule'
    });
  }

  /**
   * Get recommendations for a specific rule
   * @param {Number} ruleId - The rule ID
   * @returns {Promise<Array>} - Array of recommendations for the rule
   */
  static async getRecommendationsByRule(ruleId) {
    return await ComplianceRecommendation.findAll({
      where: { rule_id: ruleId }
    });
  }

  /**
   * Get recommendations by calculator type
   * @param {String} calculatorType - The calculator type
   * @returns {Promise<Array>} - Array of recommendations
   */
  static async getRecommendationsByCalculatorType(calculatorType) {
    return await ComplianceRecommendation.findAll({
      where: { calculator_type: calculatorType }
    });
  }

  /**
   * Get recommendations by non-compliance type
   * @param {String} nonComplianceType - The non-compliance type
   * @returns {Promise<Array>} - Array of recommendations
   */
  static async getRecommendationsByNonComplianceType(nonComplianceType) {
    return await ComplianceRecommendation.findAll({
      where: { non_compliance_type: nonComplianceType }
    });
  }

  /**
   * Get a specific recommendation
   * @param {Number} ruleId - Rule ID
   * @param {String} nonComplianceType - Type of non-compliance
   * @returns {Promise<Object>} - Recommendation
   */
  static async getSpecificRecommendation(ruleId, nonComplianceType) {
    return await ComplianceRecommendation.findOne({
      where: {
        rule_id: ruleId,
        non_compliance_type: nonComplianceType
      }
    });
  }

  /**
   * Get recommendations by calculator type and priority
   * @param {String} calculatorType - The calculator type
   * @param {String} priority - The priority level
   * @returns {Promise<Array>} - Array of recommendations
   */
  static async getRecommendationsByPriority(calculatorType, priority) {
    return await ComplianceRecommendation.findAll({
      where: {
        calculator_type: calculatorType,
        priority: priority
      }
    });
  }
}

ComplianceRecommendation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ruleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rule_id'
    },
    nonComplianceType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'non_compliance_type'
    },
    recommendationText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'recommendation_text'
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium',
      allowNull: false
    },
    calculatorType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'calculator_type'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    modelName: 'ComplianceRecommendation',
    tableName: 'compliance_recommendations',
    underscored: true
  }
);

module.exports = ComplianceRecommendation; 