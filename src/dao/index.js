const fs = require('fs');
const model = require('../model')


const files = fs.readdirSync(__dirname);
let map = {};
map.sequelize = model.sequelize;

for (let file of files) {
    if (file !== 'index.js' && file !== 'BaseDao.js') {
        let path = __dirname + '/' + file;
        let obj = require(path);
        map[obj.table] = obj;
    }
}
module.exports = map;