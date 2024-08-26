const Router = require('koa-router');
const router = new Router();
const fs = require("fs");
const path = require('path')

function loadControllers() {

    let dir_path =  path.dirname(__dirname) + "/controller"
    const dirs = fs.readdirSync(path.dirname(__dirname) + "/controller");
    let controllers = {};

    for(let file of dirs){
        let splitArr = file.split(".");


        if (file !== "index.js" && file.includes("js")) {
            let obj = require(path.join(dir_path, file));
            if (splitArr.length === 2 && splitArr[0]) {
                controllers[splitArr[0]] = obj;
            }
        }
    };

    return controllers;
}

let controller = loadControllers();
router.get('/', controller.Index.index);

module.exports = router;