/**
 * Standard model for Sequelize ORM
 * Represents standards data
 */
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

class StandardModel extends Model {
  static associate(models) {
    StandardModel.hasMany(models.BuildingTypeStandard, {
      foreignKey: 'source_standard_id',
      as: 'buildingStandards'
    });
    
    StandardModel.hasMany(models.ProjectTypeStandard, {
      foreignKey: 'source_standard_id',
      as: 'projectStandards'
    });
  }
}

StandardModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codeName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'code_name'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name'
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    issuingBody: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'issuing_body'
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'effective_date'
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
    modelName: 'Standard',
    tableName: 'standards',
    underscored: true
  }
);

module.exports = StandardModel; 