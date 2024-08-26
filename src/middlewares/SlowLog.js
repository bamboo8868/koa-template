const dao = require('../dao');
const helpers = require('../utils/helps');

module.exports = async (ctx,next) =>{
    let t1 = Date.now();
    await next();
    let t2 = Date.now();

    //执行时间大于2s的数据记录下来
    if((t2-t1) > 200) {

        let url = ctx.url;
        let method = ctx.method;
        let body = ctx.request.body;
        let bodystr = JSON.stringify(body);

        if(bodystr.length > 500 ) bodystr = bodystr.slice(0,500);
        if(url.length > 100) url = url.slice(0,100);

        let obj = {
            url:url,
            method:method,
            body:bodystr,
            time:t2-t1,
            ip:ctx.request.ip,
        }

        // dao['slow_logs'].insertOne(obj);

    }
}