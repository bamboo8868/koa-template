const Koa = require('koa')
const PORT = 9999;
const Kernel = require('./middlewares/kernels');
const logger = require('./components/Logger');
var argMap = new Map();


async function parseArgs() {
    const argv = process.argv.slice(2);
    for (let val of argv) {
        if (val.indexOf('=') > -1) {
            let arr = val.split('=');
            if (arr[0] && arr[1]) {
                argMap.set(arr[0], arr[1]);
            }
        }
    }
}

async function main() {
    parseArgs();

    let app = new Koa();

    if (Array.isArray(Kernel.middleware)) {
        for (let middleware of Kernel.middleware) {
            app.use(middleware);
        }
    }


    let config = require('./config/config');
    let port = argMap.get('port') || (config.server.port || PORT);

    app.listen(port, '0.0.0.0');
    console.log(`app starting========>0.0.0.0:${port}`);

    process.on('uncaughtException', err => {
        console.log(err);
        logger.info(err.message);
        logger.info(err.stack);
    })
    app.on('error', (err) => {
        console.log(err);
        logger.info(err.message);
        logger.info(err.stack);
    })


}

console.green = function (message) {
    console.log("\x1b[32m%s\x1b[0m", message);
}


main();