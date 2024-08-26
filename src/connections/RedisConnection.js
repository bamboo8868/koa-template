const Config = require('../config/config');
const Redis = require('ioredis');
const logger = require('../components/Logger');

class RedisConnection {
    constructor() {
        this.connection = {};

    }

    getConnection(conn = 'default') {
        if (this.connection[conn]) {
            return this.connection[conn];
        }

        let config = Config["redis"][conn];
        let option = {
            port: config.port,
            host: config.host,
            db: config.database
        };
        if (config.auth) {
            option.password = config.password;
        }

        let connection = new Redis(option);
        this.connection[conn] = connection;

        connection.on('error', (err) => {
            console.log(err);
            logger.info(err.message);
        })
        return connection;
    }
}


module.exports = new RedisConnection();