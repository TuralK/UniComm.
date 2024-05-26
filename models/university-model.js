const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');
const City = require('./city-model');
const Question = require('./question-model');

const University = sequelize.define('University', {
    uni_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uni_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    il_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'universiteler',
    timestamps: false,
});

University.belongsTo(City, { foreignKey: 'il_id' });
University.hasMany(Question, { foreignKey: 'uni_id' });
Question.belongsTo(University, { foreignKey: 'uni_id' });

module.exports = University;
