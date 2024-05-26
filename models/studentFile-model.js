const {DataTypes} = require("sequelize");
const sequelize = require("../data/db");
const Student = require("./student-model");

const StudentFile = sequelize.define('StudentFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileData: {
        type: DataTypes.BLOB('long'),
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Student,
            key: 'id'
        }
}}, 
{
    tableName: 'student_file',
    timestamps: false 
});

Student.hasMany(StudentFile, { foreignKey: 'studentId' });
StudentFile.belongsTo(Student, { foreignKey: 'studentId' });

module.exports = StudentFile;