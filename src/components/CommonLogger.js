const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const {combine, timestamp, label, prettyPrint} = winston.format;

let base = path.dirname(path.dirname(__dirname));

let mqFile = path.join(base, 'logs/mq-%DATE%.log')
const mqLogger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), winston.format.json()),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: mqFile,
            level: 'debug',
            datePattern: 'yyyy-MM-DD',
            zippedArchive: true,
            prepend: true
        }),
    ],
});

let scheduleFile = path.join(base, 'logs/schedule-%DATE%.log')
const scheduleLogger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), winston.format.json()),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: scheduleFile,
            level: 'debug',
            datePattern: 'yyyy-MM-DD',
            zippedArchive: true,
            prepend: true
        }),
    ],
});

let slowLogFile = path.join(base, 'logs/slow-%DATE%.log')
const slowLogger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), winston.format.json()),
    transports: [
        new winston.transports.DailyRotateFile({
            filename: slowLogFile,
            level: 'debug',
            datePattern: 'yyyy-MM-DD',
            zippedArchive: true,
            prepend: true
        }),
    ],
});

module.exports.slowLogger = slowLogger;
module.exports.mqLogger = mqLogger;
module.exports.scheduleLogger = scheduleLogger;