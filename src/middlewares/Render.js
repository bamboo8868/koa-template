const path = require('path');
const views =require('koa-views')

let dir = path.dirname(__dirname);
dir = path.join(dir,'views');
// console.log(dir);
let f = views(dir, { extension: 'ejs' });


module.exports = f;
