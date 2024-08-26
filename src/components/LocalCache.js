
class LocalCache {

    constructor() {
        this.map = new Map();
        this.expire = new Map();
    }


    get(key) {
        let val = this.map.get(key);
        let expire_time = this.expire.get(key);
        let now = Date.now();

        //不过期key
        if(!expire_time) {
            return val;
        }
        //未过期key
        if(expire_time >= now) {
            return val;
        }

        this.map.delete(key);
        this.expire.delete(key);

        return undefined;
    }

    /**
     *
     * @param key
     * @param val 只使用字符串
     * @param expire 过期时间按秒计算
     */
    set(key,val,expire) {
        if(typeof val === 'object') {
            val = JSON.stringify(val);
        }
        this.map.set(key,val);
        if(expire !== undefined && expire > 0) {
            let now = Date.now();
            let expire_time = now + expire * 1000;
            this.expire.set(key,expire_time);
        }
        this._clear();

    }

    isValid(val) {
        if(val === undefined || val === null) {
            return false;
        }
        return true;
    }


    /**
     * 清理无效过期数据
     * @private
     */
    _clear() {
        if(this.map.size > 10000) {

        }
    }


}

module.exports = new LocalCache();