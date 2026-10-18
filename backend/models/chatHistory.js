const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

/**
 * ChatHistory Model
 */
const ChatHistory = sequelize.define('ChatHistory', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    sessionId: {
        type: DataTypes.STRING(36),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON
    }
}, {
    tableName: 'ChatHistories',
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'sessionId']
        }
    ]
});

module.exports = ChatHistory;
