const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const City = sequelize.define('City', {
    il_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    il_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'iller',
    timestamps: false,
});

module.exports = City;
