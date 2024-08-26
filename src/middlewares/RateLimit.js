const redis = require('../connections/RedisConnection').getConnection();
const luaLoader = require('../lua');

/**
 * 系统限流，避免请求量过大     //针对单个ip,每秒请求不超过100次
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
module.exports = async (ctx, next) => {
    let ip = ctx.request.ip;
    let key = `request_limit:${ip}`;


    //单IP最大不超过100
    let times = 100;

    let sha1 = await luaLoader.getSha('RateLimit');

    let res = await redis.evalsha(sha1,2,key,times);

    res = +res;
    if (res === 1) {
        await next();
    } else {
        ctx.json({code: 1, message: 'rate_limit'})
    }


}