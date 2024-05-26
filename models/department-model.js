const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const Department = sequelize.define('Department', {
    bolum_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    uni_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bolum_ad: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    fakulte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'bolumler',
    timestamps: false,
});

module.exports = Department;
