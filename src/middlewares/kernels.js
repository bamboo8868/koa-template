const Main = require('./Main');
const koaStatic = require('./KoaStatic');
const Router = require('./routers');
const Render = require('./Render');
const {koaBody} = require('koa-body');
const Cors = require('./Cors');
const Auth = require('./Auth');
const SlowLog = require('./SlowLog');
// const RateLimit = require('./RateLimit');

module.exports = {

    middleware: [
        koaBody({
            jsonLimit: 10 * 1024 * 1024,
            multipart: true,
            formidable: {
                maxFieldsSize: 50 * 1024 * 1024
            }
        }),
        Cors,
        Main,
        // RateLimit,
        SlowLog,
        Auth,
        // Render,
        Router,
        koaStatic
    ]

}