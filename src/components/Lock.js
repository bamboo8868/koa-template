const Redis = require('../connections/RedisConnection');

class MemoryLock {

    constructor() {
        this.map = new Map();
        this.expire_map = new Map();
    }


    /**
     * 锁 过期时间按毫秒计算
     * @param key
     * @param value
     * @param expire
     * @returns {boolean}
     */
    async lock(key, value, expire = 0) {
        let res = this.map.get(key);
        if (res) {
            return false;
        }
        this.map.set(key, value);
        if (expire > 0) {
            setTimeout(() => {
                this.map.delete(key);
            }, expire)
        }

        return true;
    }


    async unlock(key) {
        this.map.delete(key);
        return true;
    }
}

function sleep(times) {
    return new Promise((resolve => {
        setTimeout(() => {
            resolve()
        }, times);
    }))
}

class RedisLock {
    constructor() {
        this.instance = Redis.getConnection();
    }

    async lock(key, value, expire = 0) {
        if (expire > 0) {
            let res = await this.instance.set(key, value, 'PX', expire, 'NX');
            if (res === 'OK') return true;
            return false;
        } else {
            let res = await this.instance.set(key, value, 'NX');
            if (res === 'OK') return true;
            return false;
        }
    }

    async unlock(key) {
        let res = await this.instance.del(key);
        if (res > 0) return true;
        return false;
    }

    async lockWait(key, value, expire, retry_times = 20) {
        let flag = false
        while (retry_times > 0) {
            if (expire > 0) {
                let res = await this.instance.set(key, value, 'PX', expire, 'NX');
                if (res === 'OK') {
                    flag = true;
                    break;
                }
            } else {
                let res = await this.instance.set(key, value, 'NX');
                if (res === 'OK') {
                    flag = true;
                    break;
                }
            }
            retry_times--;
            //等待200毫秒
            await sleep(200);
        }

        return flag;


    }
}

class Lock {
    constructor() {
        this.instance = new RedisLock();
    }

    /**
     *
     * @param key
     * @param value
     * @param expire 过期时间 按毫秒计算
     * @returns {Promise<boolean>}
     */
    async lock(key, value = 1, expire = 1000) {
        return await this.instance.lock(key, value, expire);
    }

    async lockWait(key, value, expire, retry_times = 20) {
        return await this.instance.lockWait(key, value, expire,retry_times);
    }


    async unlock(key) {
        return await this.instance.unlock(key);
    }
}


module.exports = new Lock();