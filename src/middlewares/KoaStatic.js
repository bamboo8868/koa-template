const koaStatic = require('koa-static');
const path = require('path');

let dir = path.dirname(path.dirname(__dirname))

module.exports = koaStatic(path.join(dir,'public'),{
	index:false,
	hidden:false,
	defer:true
})