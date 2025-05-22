'use strict'; //업격모드

const { Sequelize, DataTypes } = require('sequelize');
const { DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } = require('../config.js');
console.log("datamodel index.js");
console.log("DB_HOST="+DB_HOST);
console.log("DB_DATABASE="+DB_DATABASE);
console.log("DB_USER="+DB_USER);
console.log("DB_PORT="+DB_PORT);

//const env = process.env.NODE_ENV || 'development';

const db = {};

const sequelize = new Sequelize(
    DB_DATABASE,   
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

db.user = require("./user.model.js")(sequelize, Sequelize);
db.query = require("./query.model.js")(sequelize, Sequelize);
db.dbconfig = require("./dbconfig.model.js")(sequelize, Sequelize);
db.code = require("./code.model.js")(sequelize, Sequelize);
db.project = require("./project.model.js")(sequelize, Sequelize);
db.datamodel = require("./datamodel.model.js")(sequelize, Sequelize);
db.query = require("./query.model.js")(sequelize, Sequelize);
db.mailcert = require("./mailcert.model.js")(sequelize, Sequelize);
db.datagrp = require("./datagrp.model.js")(sequelize, Sequelize);
db.datagrpfolder = require("./datagrpfolder.model.js")(sequelize, Sequelize);
db.metarelation = require("./metarelation.model.js")(sequelize, Sequelize);
db.querymenu = require("./querymenu.model.js")(sequelize, Sequelize);
db.org = require("./org.model.js")(sequelize, Sequelize);
db.job = require("./job.model.js")(sequelize, Sequelize);
db.appmodel = require("./appmodel.model.js")(sequelize, Sequelize);
db.module = require("./module.model.js")(sequelize, Sequelize);
db.project = require("./project.model.js")(sequelize, Sequelize);
db.metadomain = require("./metadomain.model.js")(sequelize, Sequelize);
db.aicode = require("./aicode.model.js")(sequelize, Sequelize);
db.projectuser = require("./projectuser.model.js")(sequelize, Sequelize);
db.framework = require("./framework.model.js")(sequelize, Sequelize);
// db.metacode = require("./metacode.model.js")(sequelize, Sequelize);
// db.request = require("./request.model.js")(sequelize, Sequelize);
// db.File = require("./file.model.js")(sequelize, Sequelize);
// db.fileUpload = require("./fileUpload.model.js")(sequelize, Sequelize);

module.exports = db;