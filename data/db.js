const mysql = require("mysql2");
const dotenv = require('dotenv');
const path = require('path');
const Sequlize = require("sequelize");

dotenv.config({ path: './.env'});

const sequelize= new Sequlize(process.env.DATABASE,process.env.DATABASE_USER, process.env.DATABASE_PASSWORD,{
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    logging: false
});

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("mysql server bağlantısı yapıldı.");
    } catch (error) {
        console.log("bağlantı hatası", error);
    }
}
    
connectDB();
module.exports= sequelize;