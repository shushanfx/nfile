var fs = require('fs')
var fse = require('fs-extra')


var BaseRouter = require('./BaseRouter.js')
var RouterUtils = require('../util/RouterUtils.js')
var FileUtils = require("../util/FileUtils.js");
var MarkdownUtils = require("../util/MarkdownUtils.js");
var DateUtils = require("../util/DateUtils.js");

class MyRouter extends BaseRouter {
    init() {
        var me = this
        me.html('/readme/**', function(req, res) {
            var obj = req.query;
            var uri = req.path;
            if (uri) {
                uri = uri.replace(/^\/readme\//gi, "");
            }
            if (!uri) {
                uri = "";
            }
            if (uri) {
                // 对uri进行处理， 将编码url转为中文
                uri = decodeURIComponent(uri);
            }
            if (obj.path) {
                uri = FileUtils.getPath(uri, obj.path);
            } else {
                uri = FileUtils.getPath(uri);
            }
            var currentName = uri;
            var ext = FileUtils.getExtName(currentName);

            if(ext == "md"){
                MarkdownUtils.parse2Html(currentName, function(err, obj) {
                    if (err) {
                        console.dir(err);
                        res.render("home/error", {
                            message: "获取文件失败！" 
                        });
                    } else {
                        res.render("readme-new", obj);
                    }
                });
            }
            else{
                var buffer = fs.readFileSync(currentName)
                if (buffer) {
                    res.writeHead(200, { 'Content-Disposition': 'inline', 'Content-Type': FileUtils.getFileMimeType(currentName) })
                    res.end(buffer, 'binary')
                } else {
                    res.render("home/error", {
                        message: "获取文件失败！" 
                    });
                }
            }
        });
        me.html("/tag/*", function(req, res) {
            res.render("tag/tag");
        });
        me.html("/tag-cloud", function(req, res) {
            res.render("tag/tag")
        });
    }
}

module.exports = exports = function(map) {
    return (new MyRouter()).load(map)
}