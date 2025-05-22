'use strict'; //업격모드

const { Sequelize, DataTypes } = require('sequelize');
const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } = require('../config.js');
console.log("datamodel index.js");
console.log("DB_HOST="+DB_HOST);
console.log("DB_NAME="+DB_NAME);
console.log("DB_USER="+DB_USER);
console.log("DB_PORT="+DB_PORT);

//const env = process.env.NODE_ENV || 'development';

const db = {};

const sequelize = new Sequelize(
    DB_NAME,   
    DB_USER,       
    DB_PASSWORD,   
    {
        host: DB_HOST, 
        port: DB_PORT,
        dialect: 'mysql'  
    }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize.DataTypes);
db.code = require("./code.model.js")(sequelize, Sequelize.DataTypes);
db.mailcert = require("./mailcert.model.js")(sequelize, Sequelize.DataTypes);
db.org = require("./org.model.js")(sequelize, Sequelize.DataTypes);
db.km_request = require("./km_request.model.js")(sequelize, Sequelize.DataTypes);
db.km_detect = require("./km_detect.model.js")(sequelize, Sequelize.DataTypes);

module.exports = db;