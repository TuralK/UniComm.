const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const Faculty = sequelize.define('Faculty', {
    fakulte_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fakulte_ad: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    uni_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'fakulteler',
    timestamps: false,
});

module.exports = Faculty;
