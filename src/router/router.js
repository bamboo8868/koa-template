const Router = require("koa-router");
const fs = require("fs");
const path = require("path");

const router = new Router();

function loadController() {
  let dir = path.dirname(__dirname);
  dir = dir + "/controller/";

  let controllers = {};
  fs.readdirSync(dir).forEach((file) => {
    let splitArr = file.split(".");


    if (file !== "index.js" && file.includes("js")) {
      let obj = require(path.join(dir, file));
      if (splitArr.length === 2 && splitArr[0]) {
        controllers[splitArr[0]] = obj;
      }
    }
  });

  return controllers;
}

function loadRoutes() {
  let dir = __dirname;


  let arr = [];
  fs.readdirSync(dir).forEach((file) => {
    let splitArr = file.split(".");


    if (file !== "router.js" && file.includes("js")) {
      let obj = require(path.join(dir, file));
      arr.push(obj);
    }
  });

  return arr;
}

let controller = loadController();

let routes = loadRoutes();

for(let obj of routes) {
  obj(router,controller);
}


module.exports = router;
