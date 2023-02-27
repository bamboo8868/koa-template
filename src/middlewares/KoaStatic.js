const koaStatic = require('koa-static');

module.exports = koaStatic(path.join(__dirname+'/static'),{
	index:false,
	hidden:false,
	defer:true;
})