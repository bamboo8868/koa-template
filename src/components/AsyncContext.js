const {AsyncLocalStorage} = require('node:async_hooks');

class AsyncContext {
    constructor() {
        this.localStorage = new AsyncLocalStorage();
    }


    getLocalStorage() {
        return this.localStorage;
    }

    async run(val,next) {
        await this.localStorage.run(val,next);
    }

    getStore() {
        return this.localStorage.getStore();
    }


}

module.exports = new AsyncContext();