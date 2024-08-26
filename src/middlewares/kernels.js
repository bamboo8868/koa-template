const koaStatic = require('./KoaStatic');
const router = require('./Router')


module.exports = {

	middleware:[
		koaStatic,
		router,
	]

}