const fs = require('fs');
const redis = require('../connections/RedisConnection').getConnection();
const MyError = require('../error/MyError');
const path = require('path');

class LuaLoader {

    constructor(props) {
        this.map = {}
        this.shaMap = {};
    }


    loadScript() {
        const files = fs.readdirSync(__dirname);
        for (let file of files) {
            if (file !== 'index.js') {
                let filePath = __dirname + path.sep + file;
                let buf = fs.readFileSync(filePath);
                //注册lua脚本
                let ext_arr = file.split('.');
                let ext_name = ext_arr[0];

                this.map[ext_name] = buf;
            }
        }
    }

    async getSha(script) {
        if (this.shaMap[script]) {
            return this.shaMap[script];
        }
        let luaCode = this.map[script];
        if (!luaCode) {
            throw new MyError(`${script} not exists`);
        }
        let sha = await redis.script("LOAD",luaCode);
        this.shaMap[script] = sha;
        return sha;
    }

}

let obj = new LuaLoader();
obj.loadScript();

module.exports = obj;