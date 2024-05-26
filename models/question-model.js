const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');
const University = require('./university-model');

const Question = sequelize.define('Question', {
    question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uni_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'question',
    timestamps: false,
});

module.exports = Question;