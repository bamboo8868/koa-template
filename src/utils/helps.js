const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const path = require('path');
const httpClient = require('../components/DefaultHttpClient')
const dayjs = require('dayjs');
const qr = require('qrcode');
const Searcher = require('./Ip2Address');


class Helps {

    ipUtil;


    constructor() {
        let filePath = __dirname+path.sep+'res'+path.sep+'ip2region.xdb';
        const buffer = Searcher.loadContentFromFile(filePath)
        this.ipUtil = Searcher.newWithBuffer(buffer)
    }

    sha256(password) {
        //var obj=crypto.createHash('md5');
        var obj = crypto.createHash("sha256");
        obj.update(password);

        return obj.digest("hex"); //hex是十六进制
    }

    createJwtToken(obj) {
        const jwt_secret = config.auth.jwt_secret;
        return jwt.sign(obj, jwt_secret, {expiresIn: 86400 * 7});
    }

    jwtVerify(token) {
        const jwt_secret = config.auth.jwt_secret;
        try {
            let res = jwt.verify(token, jwt_secret);
            return res;
        } catch (err) {
            return false;
        }
    }

    trans(key, lang) {
        if (!lang) lang = 'zh';
        let filePath = path.join(path.dirname(__dirname), `lang/${lang}.json`);
        let langArr = require(filePath);
        return langArr[key] || '';
    }

    rand(start, end) {
        let r = Math.random();
        return Math.floor(r * (end - start + 1)) + start;
    }

    trimObj(obj) {
        if (typeof obj === 'object') {
            let fields = Object.keys(obj);
            for (let field of fields) {
                if (typeof obj[field] === 'string') {
                    obj[field] = obj[field].trim();
                }
            }
        }
        return obj;
    }

    randStr(len) {
        let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let str_len = str.length;
        let output = '';

        for (let i = 0; i < len; i++) {
            let rand_num = this.rand(0, str_len - 1);
            output += str[rand_num];
        }

        return output;
    }

    real_empty(obj) {
        if (obj === undefined || obj === null) return true;
        return false;
    }

    createPassword(password) {
        password = `${password}${config.auth.salt}`;
        return this.sha256(password);
    }


    transferWhere(filter) {
        let where = [];
        const {Op} = require('sequelize');

        let typeMap = {
            '=': Op.eq,
            '>': Op.gt,
            '>=': Op.gte,
            '<': Op.lt,
            '<=': Op.lte,
            '!=': Op.ne,
            'like': Op.like
        }


        //过滤有效数据
        let filter_arr = [];
        for(let obj of filter) {
            let field, type, val;
            if (Array.isArray(obj) && (obj.length === 3 || obj.length === 2)) {
                field = obj[0];
                if (obj.length === 3) {
                    type = obj[1];
                    val = obj[2];
                }
                if (obj.length === 2) {
                    type = '=';
                    val = obj[1];
                }
            } else {
                field = obj.field;
                type = obj.type;
                val = obj.val;
                if (this.real_empty(val) && !this.real_empty(obj.value)) {
                    val = obj.value;
                }
            }
            if (type === 'like') val = `${val}%`;

            if(typeMap[type] && field && type && !this.real_empty(val)) {
                if(field.includes('.')) {
                    field = `$${field}$`;
                }
                filter_arr.push({
                    field:field,
                    type:type,
                    val:val,
                })
            }
        }

        let map = {};
        let flag = false;
        //使用数组模式还是对象 取决于有没有字段重复查询
        for(let val of filter_arr) {
            let field = val.field;
            if(!this.real_empty(map[field])) {
                flag = true;
                break;
            }
            map[field] = 1;
        }

        //走数组对象模式
        if(flag) {
            for (let obj of filter_arr) {
                let field = obj.field;
                let type = obj.type;
                let val = obj.val;
                if(typeof val === 'string') {
                    val = val.trim();
                }
                if (field && type && !this.real_empty(val)) {
                    if(type === '=') {
                        where.push({
                            [field]: val
                        })
                    }else {
                        let key = typeMap[type];
                        where.push({
                            [field]: {
                                [key]: val
                            }
                        })
                    }
                }
            }
        }else {
            //走对象模式
            where = {}
            for (let obj of filter_arr) {
                let field = obj.field;
                let type = obj.type;
                let val = obj.val;
                if(typeof val === 'string') {
                    val = val.trim();
                }
                if (field && type && !this.real_empty(val)) {
                    if(type === '=') {
                        where[field] = val;
                    }else {
                        let key = typeMap[type];
                        where[field] = {[key]:val}
                    }
                }
            }
        }

        return where;
    }


    /**
     * kg 转换 bang
     */
    kg2bang(amount) {
        let coe = 2.20462;
        return amount * coe;
    }

    bang2kg(amount) {
        return amount / 2.20462;
    }


    /**
     * 厘米转英寸
     * @param num
     * @returns {number}
     */
    cm2inch(num) {
        return 2.54 * num;

    }

    /**
     * 英寸转厘米
     * @param num
     * @returns {number}
     */
    inch2cm(num) {
        return num / 2.54;
    }

    getRequestData(ctx) {
        let params = ctx.request.body || {};
        let table = params.table || '';
        let data = params.data || {};
        let fields = params.fields || []
        let batchUpdate = params.batchUpdate || [];

        return {
            table: table,
            query: ctx.query,
            data: data,
            filter: params.filter || [],
            page: params.page || 1,
            pageSize: params.pageSize || 50,
            sort: params.sort || 'id',
            sort_type: params.sort_type || 'desc',
            update: params.update || [],
            id: params.id || 0,
            fields: fields,
            validate: !!params.validate,
            batchUpdate: batchUpdate,
        }
    }

    now() {
        let now = Date.now();
        return Math.floor(now / 1000);
    }

    round(num, len = 2) {
        num = Number(num);
        num = num.toFixed(len);

        return Number(num);
    }

    /**
     * 进位
     * @param num
     * @param carry_num 1=> 按0.5进位 2=> 按1进位
     */
    carry(num, carry_num) {
        return Math.ceil(num / carry_num) * carry_num;
    }

    add(num1, num2) {
        num1 = +num1;
        num2 = +num2;
        return num1 + num2;
    }

    async getContent(file) {
        if (file.includes('http')) {
            const http = new httpClient();
            let res = await http.get(file, {responseType: 'arraybuffer'});
            return res.data;
        } else {
            const fs = require('fs');
            return fs.readFileSync(file);
        }
    }

    baseDir() {
        let path = require('path');
        return path.dirname(path.dirname(__dirname));
    }

    /**
     * 创建条形码
     * @param text
     * @param height
     * @param barcode_type
     */
    async createBarCode(text, height, barcode_type = 'code128') {
        const bwipjs = require('bwip-js');

        return await bwipjs.toBuffer({
            bcid: barcode_type,       // Barcode type
            text: text,    // Text to encode
            scale: 3,               // 3x scaling factor
            height: height,              // Bar height, in millimeters
            includetext: true,            // Show human-readable text
            textxalign: 'center',
        })
    }

    async createQrcode(text) {
        const imgData = await qr.toDataURL(text);
        const base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = new Buffer.from(base64Data, 'base64');
        return buffer;
    }

    /**
     * 创建子单号 一个票件最多9999个子单
     */
    createSubOrder(prefix, suffix, sys_no, serial) {
        serial = String(serial);
        let arr = ['000', '00', '0'];
        if (serial.length < 4) serial = `${arr[serial.length - 1]}${serial}`;

        let matches = sys_no.match(/\d+/g);
        sys_no = matches[0];
        let no = `${prefix}${sys_no}${serial}${suffix}`
        return no;
    }

    padding(num, len) {
        let s = String(num);
        if (s.length >= len) return s;

        let finalStr = '';
        for (let i = 0; i < len - s.length; i++) {
            finalStr += '0';
        }

        finalStr += s;
        return finalStr;
    }

    base64_encode(str) {
        let buf = Buffer.from(str);
        return buf.toString('base64');
    }


    md5(str) {
        const crypto = require('crypto');

        let h = crypto.createHash('md5');
        return h.update(str).digest('hex');
    }

    format(time,template = 'YYYY-MM-DD HH:mm:ss') {
        if (time > 0) {
            return dayjs(time).format(template);
        }
        return '-';
    }

    unix(t) {
        if (typeof t === 'string') {
            return dayjs(t).unix();
        }
        if (typeof t === 'number') return t;
    }


    sleep(time) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        })
    }

    getSort(sort, sort_type) {
        let order = [[sort, sort_type]];
        if (Array.isArray(sort) && Array.isArray(sort_type)) {
            order = [];
            let len = sort.length;
            for (let i = 0; i < len; i++) {
                order.push([sort[i], sort_type[i]]);
            }
        }
        return order;
    }


    /**
     * 计算密度
     * @param high CM
     * @param wide CM
     * @param long CM
     * @param weight CM
     */
    density(high, wide, long, weight) {
        if (high && wide && long && weight) {
            return weight * 1000000 / (high * wide * long)
        }
        return 0;
    }


    /**
     * 计算体积(单位立方米)
     */
    getVolume(long, high, wide) {
        long = +long;
        high = +high;
        wide = +wide;

        return long * high * wide / 1000000;

    }

    /**
     * 计算计费重
     * @param weight
     * @param weight_type 0=> 不进位 1=>按0.5进位 2=>按1进位
     */
    getWeight(weight, weight_type) {
        weight_type = +weight_type;

        let return_weight = weight;
        if (weight_type === 0) {
            return_weight = weight;
        }
        if (weight_type === 1) {
            return_weight = this.carry(weight, 0.5);
        }

        if (weight_type === 2) {
            return_weight = this.carry(weight, 1);
        }
        return this.round(return_weight, 3);
    }

    country_mark_transfer(country_code) {
        if (country_code.length > 2) {
            return country_code.slice(0, 2);
        }
        return country_code;
    }

    transferMap(list, key, field = '') {
        let map = {};

        for (let item of list) {
            if (Array.isArray(field)) {
                let tmp = {};
                for (let f of field) {
                    tmp[f] = item[f];
                }
                map[item[key]] = tmp;
            } else if (field === '') {
                map[item[key]] = item;
            } else {
                map[item[key]] = item[field] || '';
            }
        }
        return map;
    }

    pluck(list, field, allow_repeat = false) {
        if (Array.isArray(field)) {
            let map = {};
            for (let f of field) {
                map[f] = [];
            }
            for (let val of list) {
                for (let f of field) {
                    map[f].push(val[f]);
                }
            }
            let arr = [];

            for (let f of field) {
                let set = new Set(map[f]);
                arr.push(Array.from(set));
            }
            return arr;
        } else {
            let arr = [];
            for (let val of list) {
                arr.push(val[field])
            }
            if (allow_repeat) return arr;

            let set = new Set(arr);
            return Array.from(set);
        }
    }

    translate(field, lang = 'zh') {
        let file_path = path.join(path.dirname(__dirname), `/lang/${lang}.json`);
        let langArr = require(file_path);
        if (langArr[field]) return langArr[field];

        let field_path = path.join(path.dirname(__dirname), `/lang/fields/${lang}.json`);
        let fieldLangArr = require(field_path);
        if (fieldLangArr[field]) return fieldLangArr[field];

        return field;
    }

    matchTable(url) {
        let regex = /api\/([\S]+)\//

        let match = url.match(regex);
        if(match) {
            return match[1];
        }
    }

    async getIpAddress(ip) {
        try {
            let data = await this.ipUtil.search(ip);
            if(typeof data === 'string') {
                data = JSON.parse(data);
            }

            let address = data.region || '';
            if(address) {
                if(address.includes('内网IP')) return '内网IP';

                let addressInfo = address.split('|');
                if(addressInfo[0] === '中国') {
                    return `${addressInfo[2]} ${addressInfo[3]}`;
                }
                return `${addressInfo[0]}`;
            }

            return '未知IP';
            // data: {region:'中国|0|江苏省|苏州市|电信', ioCount: 0, took: 0.063833}
        } catch(e) {
            return '未知IP';
        }
    }
}

module.exports = new Helps();
