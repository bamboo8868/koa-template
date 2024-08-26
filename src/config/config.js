module.exports = {

    server: {
        env: 'debug',
        port: 9999,
    },

    //打印标签server
    printServer: {
        env: 'debug',
        port: 9998
    },


    app_domain: "",
    app_secret: '',

    auth: {
        jwt_secret: "SJDKSUFNRLSDFMDFKSHKWYCXMWSUSLAMFDHYWPAMXHG",

        salt: "LQJKDNXJHSosmdjSS"
    },

    mysql: {
        default: {
            host: "127.0.0.1",
            port: "3306",
            username: "test",
            password: "test",
            database: 'test',
        }
    },


    redis: {
        default: {
            host: "127.0.0.1",
            port: "6379",
            auth: true,
            password: "123456",
            database: "0"
        }
    }
}