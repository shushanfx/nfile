var RouterUtils = require("../util/RouterUtils.js");

/**
 * BaseRouter 新增类
 */
class BaseRouter{
    load(map){
        this.map = map;
        this.init();
        return this;
    }
    /**
     * 初始化函数可以在函数内部调用this.json/this.html
     */
    init(){

    }
    /**
     * 注册一个路劲映射
     * @param {String} path 路径地址，如/index.html
     * @param {Function|Object} obj 该路径的处理逻辑，可以是一个函数，也可以是一个对象，函数格式为function(req, res)，对象格式为
     * {
     *      method: {String} "get|post|head"等
     *      handler: {Function} function(req, res){}
     *      type: {String} "json|html(default)"
     * }    
     */
    register(path, obj){
        this.map[path] = obj;
        return this;
    }
    /**
     * 注册一个返回json字符串的路由
     * @param {String} path 路径地址，如/index.html
     * @param {Function} callback 处理函数，格式为function(req, res){}
     * @param {String} [method=get] method http请求方法，get（默认）、post等；
     */
    json(path, method, callback){
        if(typeof method === "function"){
            return this.json(path, "get", method);
        }
        var obj = {
            method: method ? method : "get",
            handler: callback,
            type: "json"
        };
        return this.register(path, obj);
    }
    /**
     * 注册一个返回html的路由
     * @param {String} path 路径地址，如/index.html
     * @param {Function} callback 处理函数，格式为function(req, res){}
     * @param {String} [method=get] method http请求方法，get（默认）、post等；
     */
    html(path, method, callback){
        if(typeof method === "function"){
            return this.html(path, "get", method);
        }
        var obj = {
            method: method ? method : "get",
            handler: callback
        };
        return this.register(path, obj);
    }
    /**
     * 返回状态码为success的json串。
     * @param {Object} res Express返回对象
     * @param {String} [message=操作成功] message 返回操作成功字符串
     * @param {Object} [data=undefined] data 返回对象 
     */
    success(res, message, data){
        RouterUtils.success(res, message, data);
        return this;
    }
    /**
     * 返回一个状态码为fail的json串
     * @param {Object} res Express的响应对象
     * @param {String} [message=操作失败] message 返回信息，默认“操作失败”
     */
    fail(res, message){
        RouterUtils.fail(res, message);
        return this;
    }
    /**
     * 返回一个状态码为参数异常的json串
     * @param {Object} res Express的响应对象
     * @param {String} [message=参数异常] message 返回信息，默认“参数异常”
     */
    illegal(res, message, isHtml){
        RouterUtils.illegal(res, message);
        return this;
    }
    /**
     * 返回一个状态码为参数异常的html页面
     * @param {Object} res Express的响应对象
     * @param {String} [message=参数异常] message 返回信息，默认“参数异常”
     */
    error(res, message){
        RouterUtils.error(res, message);
        return this;
    }
}

module.exports = BaseRouter