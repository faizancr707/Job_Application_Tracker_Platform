const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

/**
 * AiUsage Model
 */
const AiUsage = sequelize.define('AiUsage', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    feature: {
        type: DataTypes.ENUM(
            'resume_parse', 'resume_analyze', 'job_analyze', 'match', 
            'skill_gap', 'cover_letter', 'interview_generate', 
            'interview_evaluate', 'copilot', 'semantic_search', 
            'dashboard_insights', 'embedding'
        ),
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    inputTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    outputTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    cost: {
        type: DataTypes.DECIMAL(10, 6),
        defaultValue: 0
    },
    latencyMs: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    success: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'AiUsages',
    timestamps: true
});

module.exports = AiUsage;
