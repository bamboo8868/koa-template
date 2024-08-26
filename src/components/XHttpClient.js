const axios = require('axios');
const dao = require('../dao');
const helpers = require('../utils/helps');
const MyError = require('../error/MyError');


/**
 * 这个会记录请求日志
 */
class DefaultHttpClient {

    constructor(config = {}, extra = {}) {

        this.log = config.log || true;
        this.code = config.code;
        this.company_id = extra.company_id || 0;

        let timeout = config.timeout || 30000;

        this.client = axios.create({
            timeout: timeout, // request timeout
            headers: {'content-type': 'application/json;charset=UTF-8'}
        })
    }

    async request(data) {
        let start_at = helpers.now();
        try {

            let res = await this.client.request(data);

            /**
             *   data: T;
             status: number;
             statusText: string;
             headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
             config: InternalAxiosRequestConfig<D>;
             request?: any;
             */
            if (this.log) {

                let obj = {
                    type: 1,
                    company_id:this.company_id,
                    code: this.code,
                    method: res.config.method.toUpperCase(),
                    url: res.config.url,
                    data: res.config.data || '',
                    response_status: res.status,
                    response_data: res.data,
                    created_at: start_at,
                    end_at: helpers.now(),
                }
                if (typeof obj.response_data !== 'string') obj.response_data = JSON.stringify(obj.response_data);
                if (obj.response_data.length > 4000) obj.response_data = obj.response_data.slice(0, 4000);
                if (obj.url.length > 255) obj.url = obj.url.slice(0, 250);
                await dao['request_log'].insertOne(obj);
            }

            return res;

        } catch (err) {
            if (this.log) {
                let res = err.response;

                let obj = {
                    type: 1,
                    company_id:this.company_id,
                    code: this.code,
                    method: err.config.method.toUpperCase(),
                    url: err.config.url,
                    data: err.config.data || '',
                    response_status: res ? res.status : 400,
                    response_data: res ? JSON.stringify(res.data) : '',
                    created_at: start_at,
                    end_at: helpers.now()
                }

                if (obj.response_data.length > 4000) obj.response_data = obj.response_data.slice(0, 4000);
                if (obj.data.length > 4000) obj.data = obj.data.slice(0, 4000);
                if (obj.url.length > 255) obj.url = obj.url.slice(0, 250);
                await dao['request_log'].insertOne(obj);
            }

            throw err;
        }

    }

    async get(url, config) {

        return await this.request({
            url: url,
            method: 'GET',
            ...config
        })
    }

    async put(url, data, config) {
        return await this.request({
            url: url,
            data: data,
            method: 'PUT',
            ...config
        })
    }

    async post(url, data, config) {
        return await this.request({
            url: url,
            data: data,
            method: 'POST',
            ...config
        })
    }

}


module.exports = DefaultHttpClient;