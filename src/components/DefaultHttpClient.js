const axios = require('axios');

class DefaultHttpClient {

    constructor() {
        this.client = axios.create({
            timeout: 5000, // request timeout
            headers: {'content-type': 'application/json;charset=UTF-8'}
        })
    }

    async get(url, config) {
        return this.client.get(url, config);
    }

    async put(url, data, config) {
        return this.client.put(url, data, config);
    }

    async post(url, data, config) {
        return this.client.post(url, data, config);
    }

}


module.exports = DefaultHttpClient;