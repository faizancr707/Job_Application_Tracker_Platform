const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const SavedJob = sequelize.define('SavedJob', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  jobId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
}, {
  tableName: 'SavedJobs',
  timestamps: true,
});

module.exports = SavedJob;
