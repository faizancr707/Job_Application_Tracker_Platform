const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

/**
 * Interview Model
 */
const Interview = sequelize.define('Interview', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    jobId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('technical', 'behavioral', 'hr', 'system_design'),
        allowNull: false
    },
    difficulty: {
        type: DataTypes.ENUM('junior', 'mid', 'senior'),
        defaultValue: 'mid'
    },
    questions: {
        type: DataTypes.JSON
    },
    answers: {
        type: DataTypes.JSON
    },
    evaluations: {
        type: DataTypes.JSON
    },
    overallScore: {
        type: DataTypes.FLOAT
    },
    feedback: {
        type: DataTypes.JSON
    },
    status: {
        type: DataTypes.ENUM('in_progress', 'completed'),
        defaultValue: 'in_progress'
    }
}, {
    tableName: 'Interviews',
    timestamps: true
});

module.exports = Interview;
