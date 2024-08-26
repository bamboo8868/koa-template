const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const {combine, timestamp, label, prettyPrint} = winston.format;

let base = path.dirname(path.dirname(__dirname));

let file = path.join(base, 'logs/error-%DATE%.log')

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), winston.format.json()),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: file,
            level: 'debug',
            datePattern: 'yyyy-MM-DD',
            zippedArchive: true,
            prepend: true
        }),
    ],
});


module.exports = logger;