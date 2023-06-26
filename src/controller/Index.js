class Index {
    async index(ctx) {
        ctx.body = "hello world";
    }
}

module.exports = new Index