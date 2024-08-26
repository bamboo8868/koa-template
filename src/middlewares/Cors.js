const dayjs = require('dayjs');

module.exports = async (ctx, next) => {
    let s = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} ${ctx.request.method} ${ctx.request.url}`
    console.log("\x1b[32m%s\x1b[0m", s);
    console.log("request========>", ctx.request.body);
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Methods", "*");
    ctx.set("Access-Control-Allow-Headers", "Authorization,*");
    ctx.set("Access-Control-Max-Age", "1728000");
    let method = ctx.request.method;
    if (method === "OPTIONS") {
        ctx.status = 204;
    } else {
        await next();
    }
};
