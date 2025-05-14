/**
 * ComplianceRule model
 * Represents compliance rules for verification
 */
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

class ComplianceRule extends Model {
  static associate(models) {
    ComplianceRule.hasMany(models.ComplianceRecommendation, {
      foreignKey: 'rule_id',
      as: 'recommendations'
    });
  }
}

ComplianceRule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'section_id'
    },
    ruleCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'rule_code'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('critical', 'major', 'minor'),
      defaultValue: 'major'
    },
    type: {
      type: DataTypes.ENUM('prescriptive', 'performance', 'mandatory'),
      defaultValue: 'mandatory'
    },
    verificationMethod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'verification_method'
    },
    evaluationCriteria: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'evaluation_criteria'
    },
    failureImpact: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'failure_impact'
    },
    remediationAdvice: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'remediation_advice'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    modelName: 'ComplianceRule',
    tableName: 'compliance_rules',
    underscored: true
  }
);

module.exports = ComplianceRule; 