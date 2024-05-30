const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');
const Student = require('./student-model');

const Department = sequelize.define('Department', {
    department_id: {
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

Student.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(Student, { foreignKey: 'department_id' });

module.exports = Department;
