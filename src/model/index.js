const createDataSource = require('../components/MysqlDataSource');
const fs = require("fs");
const path = require('path');

const config = require('../config/config');

let dbconfig = config.mysql.default;


let sequelize = createDataSource(dbconfig);


let models = {
    origin:{}
};
models.sequelize = sequelize;
fs.readdirSync(__dirname).forEach((file) => {

    if(file !== 'index.js' && file.includes('js')) {
        
        let model = require(path.join(__dirname,file));
        if(model.model && model.name) {
            models[model.name] = sequelize.define(model.name, model.model, {tableName: model.name});

            models.origin[model.name] = model.model;
        }
    }

});

module.exports = models;
