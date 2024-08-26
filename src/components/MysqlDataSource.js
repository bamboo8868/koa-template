const {Sequelize, DataTypes} = require("sequelize");
const Logger = require('./CommonLogger');
const Config = require('../config/config');

function customLogger(queryString, execute_time) {
    if(execute_time > 1000) {
        let message = `[Mysql] ${queryString} ${execute_time}`
        Logger.slowLogger.info(message);
    }
    if(Config.server.env === 'debug') {
        console.log(queryString,execute_time)
    }
}



function createDataSource(config) {

    return new Sequelize(config.database, config.username, config.password, {

        host: config.host,
        port: config.port,
        dialect: 'mysql',

        // dialectOptions: {
        //     socketPath: '/var/lib/mysql/mysql.sock'
        // },

        pool: {
            max: 100,
            min: 1,
            idle: 30000,
            acquire: 5000,
            evict:60000,
            handleDisconnects: true
        },
        benchmark:true,//

        retry: {
            match: [
                Sequelize.ConnectionError,
                Sequelize.ConnectionRefusedError,
                Sequelize.ConnectionTimedOutError,
                Sequelize.OptimisticLockError,
                Sequelize.TimeoutError,
            ],
            max: 3
        },

        define: {
            timestamps: false
        },

        timezone: '+08:00', //东八时区,
        logging: customLogger
    });
}


module.exports = createDataSource;