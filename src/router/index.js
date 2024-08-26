module.exports = function(router,controller) {
    router.get('/',controller.Index.index);//员工列表
}