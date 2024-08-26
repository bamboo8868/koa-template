class Index {

	async index(ctx) {
		ctx.json({
			code:0
		})
	}

}

module.exports = new Index()