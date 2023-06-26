const Router = require('koa-router');
const router = new Router();


const Index = require('../controller/Index');

router.get('/',Index.index);

module.exports = router;