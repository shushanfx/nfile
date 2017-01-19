var merge = require("merge");

var codePath = {
    "NOT_LOGIN": {
        code: -100,
        message: "未登录！"
    },
    "WRONG_PASSWORD": {
        code: -101,
        message: "用户名密码错误！"
    },
    "UNCOMPLETED_USERNAME":{
        code: -102,
        message: "请输入完整的用户名/密码！"
    },
    "UNREGISTERED_USERNAME": {
        code: -103,
        message: "当前用户未注册！"
    },
    "NOT_ADMIN" : {
        code : -104,
        message : "没有操作权限，请联系管理员！" 
    },
    "ERROR": {
        code: -512,
        message: "系统发生异常，请稍后再试！"
    },
    "FAIL": {
        code: -1,
        message: "操作失败！"
    },
    "ILLEGAL_ARGUMENT" : {
        code: -2,
        message: "参数异常"
    },
    "TOO_MANY_REQUESTS": {
        code: -3,
        message: "请求太频繁了，请稍后再试！"
    },
    "SUCCESS": {
        code: 1,
        message: "操作成功！"
    },
    "LOGIN_SUCCESS": {
        code: 100,
        message: "登录成功！"
    }
};

class RouterUtils{
    /**
     * 返回一个错误的json串
     * @param res response对象，必填
     * @param message 错误信息，选填
     */
    static fail(res, message){
        var obj = merge(true, codePath["FAIL"]);
        if(message){
            obj.message = message;
        }
        res.json(obj);
    }
    /**
     * 返回一个参数异常的json串
     * @param res response对象，必填
     * @param message 错误信息，选填
     */
    static illegal(res, message){
        var obj = merge(true, codePath["ILLEGAL_ARGUMENT"]);
        if(message){
            obj.message = message;
        }
        res.json(obj);
    }
    /**
     * 返回一个操作成功的json串
     * @param res response对象，必填
     * @param message 提示信息，选填
     * @param data json串的额外信息，一个对象，选填
     */
    static success(res, message, data){
        var obj = merge(true, codePath["SUCCESS"]);
        if(message){
            obj.message = message;
        }
        if(data){
            Object.keys(data).forEach(function(key){
                obj[key] = data[key];
            });
        }
        res.json(obj);
    }
    static error(res, message){
        var obj = merge(true, codePath["ILLEGAL_ARGUMENT"]);
        if(message){
            obj.message = message;
        }
        res.render("error", obj);
    }
}

module.exports = RouterUtils;