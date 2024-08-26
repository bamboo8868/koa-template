const redis = require('../connections/RedisConnection').getConnection();

class Queue {
    /**
     *
     * @param data
     * @param router 路由分发
     * @param queue_name
     * @returns {Promise<ResultTypes<number, Context>[Context["type"]]>}
     */
    static async enqueue(data, router, queue_name = 'queue_jobs') {
        let obj = {
            router: router,
            data: data
        }
        return redis.lpush(queue_name, JSON.stringify(obj));
    }
}

module.exports = Queue;