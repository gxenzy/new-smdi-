const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  action: {
    type: DataTypes.ENUM('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'IMPORT', 'AUDIT', 'TEST', 'CONFIGURE', 'ANALYZE'),
    allowNull: false,
  },
  module: {
    type: DataTypes.ENUM('AUTH', 'USER', 'ELECTRICAL_SYSTEM', 'ENERGY_AUDIT', 'SYSTEM_TOOLS', 'TESTING', 'TAM_EVALUATION', 'SETTINGS', 'ADMIN'),
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILURE', 'WARNING'),
    defaultValue: 'SUCCESS',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'activity_logs',
  timestamps: true,
});

module.exports = ActivityLog; 