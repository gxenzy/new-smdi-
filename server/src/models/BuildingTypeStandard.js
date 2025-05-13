/**
 * BuildingTypeStandard model
 * Represents standards values specific to building types
 */
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const Standard = require('./StandardModel');

class BuildingTypeStandard extends Model {
  static associate(models) {
    BuildingTypeStandard.belongsTo(models.Standard, {
      foreignKey: 'sourceStandardId',
      as: 'sourceStandard'
    });
  }

  /**
   * Get standards for a specific building type
   * @param {String} buildingType - The building type
   * @returns {Promise<Array>} - Array of standards for the building type
   */
  static async getStandardsByBuildingType(buildingType) {
    return await BuildingTypeStandard.findAll({
      where: { building_type: buildingType }
    });
  }

  /**
   * Get standards by building type and standard type
   * @param {String} buildingType - The building type
   * @param {String} standardType - The standard type
   * @returns {Promise<Array>} - Array of standards
   */
  static async getStandardsByTypeAndBuilding(buildingType, standardType) {
    return await BuildingTypeStandard.findAll({
      where: {
        building_type: buildingType,
        standard_type: standardType
      }
    });
  }

  /**
   * Get a standard value for a specific building type, standard type, and code
   * @param {String} buildingType - The building type
   * @param {String} standardType - The standard type
   * @param {String} standardCode - The standard code
   * @returns {Promise<Object>} - The standard value
   */
  static async getStandardValue(buildingType, standardType, standardCode) {
    return await BuildingTypeStandard.findOne({
      where: {
        building_type: buildingType,
        standard_type: standardType,
        standard_code: standardCode
      }
    });
  }

  /**
   * Get standard values for Energy Use Intensity by building type
   * @param {String} buildingType - The building type
   * @returns {Promise<Object>} - The EUI standard value
   */
  static async getEUIStandard(buildingType) {
    return await BuildingTypeStandard.findOne({
      where: {
        building_type: buildingType,
        standard_type: 'energy_efficiency',
        standard_code: 'DOE-EE-EUI'
      }
    });
  }

  /**
   * Get standard values for Lighting Power Density by building type
   * @param {String} buildingType - The building type
   * @returns {Promise<Object>} - The LPD standard value
   */
  static async getLPDStandard(buildingType) {
    return await BuildingTypeStandard.findOne({
      where: {
        building_type: buildingType,
        standard_type: 'illumination',
        standard_code: 'PGBC-LPD'
      }
    });
  }
}

BuildingTypeStandard.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    buildingType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'building_type'
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
    modelName: 'BuildingTypeStandard',
    tableName: 'building_type_standards',
    underscored: true
  }
);

module.exports = BuildingTypeStandard; 