var merge = require("merge");
var path = require("path");

var router = {};
var SystemConfig = require("./config.js");
var serverConfig = SystemConfig.getConfig();
var Router = require("express").Router;
/**
 * string : function|object
 * function: see object handler
 * object {
 *      type: html(default) | json,
 *      method: get(default) | post,
 *      handler: function(req, res),
 *      admin : 1 | 0
 *      noNeedLogin : 1 | 0
 * }
 * @type {{/: indexController, /index.html: indexController, detail.html: {handler: detailController}}}
 */
var htmlPath = {
    "/edit": indexController,
    "/home": indexController,
    "/index": indexController,
    "/view": viewController,
};
router.register = function(app) {
    var router = new Router();
    var base = SystemConfig.getBase() === "/" ? "" : SystemConfig.getBase();
    var key, value;
    router.use(function(req, res, next) {
        Object.defineProperty(req, "isIE", {
            get: function() {
                var header = req.header("user-agent");
                if (header && (header.toLowerCase().indexOf("msie") != -1) || header.toLowerCase().indexOf("trident") != -1) {
                    return true;
                }
                return false;
            }
        });
        Object.defineProperty(res, "isIE", {
            get: function() {
                var header = req.header("user-agent");
                if (header && (header.toLowerCase().indexOf("msie") != -1) || header.toLowerCase().indexOf("trident") != -1) {
                    return true;
                }
                return false;
            }
        });
        next();
    });

    require("./router/FileRouter.js")(htmlPath);
    require("./router/FileView.js")(htmlPath);
    require("./router/TagRouter.js")(htmlPath);
    router.use(function(req, res, next) {
        var obj = {
            config: serverConfig,
            base: base
        };
        var date = new Date();
        obj.datetime = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            time: date.getTime()
        };
        obj.param = merge(true, req.query, req.body);
        //  默认cookie与 req.cookie合并，赋给response上
        var setting = {
            theme: "default"
        };
        if (req.cookies) {
            setting = merge(true, setting, getSettingCookie(req.cookies));
            obj.cookies = req.cookies;
        }
        obj.setting = setting;
        if (res.locals) {
            res.locals = merge(res.locals, obj);
        }
        next();
    });
    for (key in htmlPath) {
        value = htmlPath[key];
        if (typeof(value) == "function") {
            router.get(key, value);
        } else if (typeof(value) == "object" && typeof(value.handler)) {
            if (value.method == "post") {
                router.post(key, value.handler);
            } else if (value.method === "all") {
                router.all(key, value.handler);
            } else {
                router.get(key, value.handler);
            }
        }
    }
    router.use(function(err, req, res, next) {
        var type = null;
        if (err && (err instanceof Error)) {
            console.error(err);
            if (type && type.indexOf("json")) {
                res.json({
                    "code": -1,
                    "message": "系统发生未处理的异常！"
                });
            } else {
                res.render("error", { message: "系统发生未处理的异常！" });
            }
        } else {
            next();
        }
    });
    app.use(SystemConfig.getBase(), router);
};

function indexController(req, res) {
    res.render("index");
}
function viewController(req, res){
    res.render("index", {
        view: true
    });
}
// 获得默认的cookie
function getSettingCookie(cookies) {
    var obj = {};
    for (var key in cookies) {
        if (key && key.indexOf("setting.") === 0) {
            obj[key.substring(8)] = decodeURIComponent(cookies[key]);
        }
    }
    return obj;
}

module.exports = router;