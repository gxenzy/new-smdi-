/**
 * ProjectTypeStandard model
 * Represents standards values specific to project types (for ROI, payback, etc.)
 */
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const Standard = require('./StandardModel');

class ProjectTypeStandard extends Model {
  static associate(models) {
    ProjectTypeStandard.belongsTo(models.Standard, {
      foreignKey: 'sourceStandardId',
      as: 'sourceStandard'
    });
  }

  /**
   * Get standards for a specific project type
   * @param {String} projectType - The project type
   * @returns {Promise<Array>} - Array of standards for the project type
   */
  static async getStandardsByProjectType(projectType) {
    return await ProjectTypeStandard.findAll({
      where: { project_type: projectType }
    });
  }

  /**
   * Get standards by project type and standard type
   * @param {String} projectType - The project type
   * @param {String} standardType - The standard type
   * @returns {Promise<Array>} - Array of standards
   */
  static async getStandardsByTypeAndProject(projectType, standardType) {
    return await ProjectTypeStandard.findAll({
      where: {
        project_type: projectType,
        standard_type: standardType
      }
    });
  }

  /**
   * Get a standard value for a specific project type, standard type, and code
   * @param {String} projectType - The project type
   * @param {String} standardType - The standard type
   * @param {String} standardCode - The standard code
   * @returns {Promise<Object>} - The standard value
   */
  static async getStandardValue(projectType, standardType, standardCode) {
    return await ProjectTypeStandard.findOne({
      where: {
        project_type: projectType,
        standard_type: standardType,
        standard_code: standardCode
      }
    });
  }

  /**
   * Get ROI standard for a project type
   * @param {String} projectType - The project type
   * @returns {Promise<Object>} - The ROI standard value
   */
  static async getROIStandard(projectType) {
    return await ProjectTypeStandard.findOne({
      where: {
        project_type: projectType,
        standard_type: 'financial',
        standard_code: 'FNANCL-ROI'
      }
    });
  }

  /**
   * Get payback period standard for a project type
   * @param {String} projectType - The project type
   * @returns {Promise<Object>} - The payback period standard value
   */
  static async getPaybackStandard(projectType) {
    return await ProjectTypeStandard.findOne({
      where: {
        project_type: projectType,
        standard_type: 'financial',
        standard_code: 'FNANCL-PAYBCK'
      }
    });
  }

  /**
   * Get NPV ratio standard for a project type
   * @param {String} projectType - The project type
   * @returns {Promise<Object>} - The NPV ratio standard value
   */
  static async getNPVRatioStandard(projectType) {
    return await ProjectTypeStandard.findOne({
      where: {
        project_type: projectType,
        standard_type: 'financial',
        standard_code: 'FNANCL-NPV'
      }
    });
  }

  /**
   * Get IRR margin standard for a project type
   * @param {String} projectType - The project type
   * @returns {Promise<Object>} - The IRR margin standard value
   */
  static async getIRRMarginStandard(projectType) {
    return await ProjectTypeStandard.findOne({
      where: {
        project_type: projectType,
        standard_type: 'financial',
        standard_code: 'FNANCL-IRR'
      }
    });
  }
}

ProjectTypeStandard.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projectType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'project_type'
    },
    standardType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'standard_type'
    },
    standardCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'standard_code'
    },
    minimumValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'minimum_value'
    },
    maximumValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'maximum_value'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    sourceStandardId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'standards',
        key: 'id'
      },
      allowNull: true,
      field: 'source_standard_id'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    modelName: 'ProjectTypeStandard',
    tableName: 'project_type_standards',
    underscored: true
  }
);

module.exports = ProjectTypeStandard; 