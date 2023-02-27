const Koa = require('koa')
const PORT = 8888;
const Kernel = require('./middleware/kernels');


async function parseArgs() {
    const argv = process.argv.slice(2);
    for(let val of run_args) {
        if(val.indexOf('=') > -1) {
            let arr = val.split('=');
            if(arr[0] && arr[1]) {
                argMap.set(arr[0],arr[1]);
            }
        }
    }
}

async function main() {

    let app = new Koa();

    if(Array.isArray(Kernel.middleware)) {
        for(let middleware of Kernel.middleware) {
            app.use(middleware);
        }
    }
    app.listen(port,'0.0.0.0')
}


main();