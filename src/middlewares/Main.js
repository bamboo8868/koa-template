const MyError = require('../error/MyError');
const ValidateError = require('../error/ValidateError');
const dayjs = require('dayjs');
const path = require('path');
const asyncContext = require('../components/AsyncContext');
const sequelize = require('sequelize');
const helpers = require('../utils/helps');


function trim_func(obj) {
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
        let fields = Object.keys(obj);
        for (let field of fields) {
            if (typeof obj[field] === 'string') {
                obj[field] = obj[field].trim();
            }
            if (typeof obj[field] === 'object' && !Array.isArray(obj[field]) && obj[field] !== null) {
                trim_func(obj[field]);
            }
        }
    }
}

function renderValidateError(err, ctx) {
    let message = err.message;

    if (typeof message === 'string') {
        let code = err.code || 1;
        ctx.json({code: code, message: message});
    }
}

function renderMyError(err, ctx) {
    //自定义报错
    let lang = ctx.lang;
    let accept_lang = ['zh', 'en', 'japan'];
    if (!accept_lang.includes(lang)) lang = 'zh';
    let field = err.message;
    let msg = helpers.translate(field, lang);
    let code = err.code || 1;

    ctx.json({code: code, message: msg, key: err.message});
}


const func = async function (ctx, next) {
    ctx.lang = ctx.headers.lang;

    if (ctx.request.body === undefined || ctx.request.body === null) {
        ctx.request.body = {};
    } else {
        trim_func(ctx.request.body);
    }

    if (!ctx.response) {
        ctx.response = function (data, headers) {
            ctx.body = data;
        }
    }

    //注册asyncLocalStorage
    if (!ctx.json) {
        ctx.json = (data) => {
            if (data.message) {
                let lang = ctx.lang;
                let accept_lang = ['zh', 'en', 'japan'];
                if (!accept_lang.includes(lang)) lang = 'zh';
                let file_path = path.join(path.dirname(__dirname), `/lang/${lang}.json`);
                let langArr = require(file_path);
                data.message = langArr[data.message] || data.message;
            }

            ctx.body = data;
            ctx.set('Content-Type', 'application/json;charset=utf-8')
        }
    }
    if (!ctx.download) {
        ctx.download = (fileName, data) => {
            ctx.body = data;
            ctx.set(`Content-Type`, `application/octet-stream`)
            ctx.set(`Content-Disposition`, `attachment; filename="${fileName}"`)
        }
    }


    try {
        await asyncContext.run(ctx, () => next());
    } catch (err) {


        if (err instanceof ValidateError) {
            renderValidateError(err, ctx);
        } else if (err instanceof MyError) {
            renderMyError(err, ctx);
            //数据库异常
        } else if (err instanceof sequelize.BaseError) {
            console.log("database_error=======>", err);
            let message = `database error:${err.message}`
            ctx.json({code: 1, message: message, key: 'database_error'});
        } else {

            //未知异常
            ctx.json({code: 1, message: err.message, key: err.message});
            // throw err;
            console.log(err);
        }
    }

}

module.exports = func;