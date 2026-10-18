const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

/**
 * Resume Model
 */
const Resume = sequelize.define('Resume', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER
    },
    mimeType: {
        type: DataTypes.STRING,
        defaultValue: 'application/pdf'
    },
    rawText: {
        type: DataTypes.TEXT('long')
    },
    parsedData: {
        type: DataTypes.JSON
    },
    skills: {
        type: DataTypes.JSON
    },
    qualityScore: {
        type: DataTypes.INTEGER
    },
    analysis: {
        type: DataTypes.JSON
    },
    status: {
        type: DataTypes.ENUM('uploading', 'processing', 'ready', 'failed'),
        defaultValue: 'uploading'
    },
    embeddingId: {
        type: DataTypes.STRING
    },
    processingError: {
        type: DataTypes.TEXT
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Resumes',
    timestamps: true
});

module.exports = Resume;
