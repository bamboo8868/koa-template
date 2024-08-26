const redis = require('../connections/RedisConnection');
const dao = require('../dao');


async function preload() {
    console.log(1111);
    process.on('error', err => {
        console.log(err);
    })

}


module.exports = preload;
