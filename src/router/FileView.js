var fs = require('fs')
var fse = require('fs-extra')

var BaseRouter = require('./BaseRouter.js')
var RouterUtils = require('../util/RouterUtils.js')
var FileUtils = require("../util/FileUtils.js");
var MarkdownUtils = require("../util/MarkdownUtils.js");

class MyRouter extends BaseRouter {
    init() {
        var me = this
        me.html('/file/view/**', function(req, res) {
            var obj = req.query;
            var uri = req.path;

            if (uri) {
                uri = uri.replace(/^\/file\/view\//gi, "");
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
            if (ext === "md") {
                MarkdownUtils.parse2Html(currentName, function(err, obj) {
                    if (err) {
                        console.dir(err);
                        RouterUtils.error(res, "获取文件失败！");
                    } else {
                        let isRealtime = req.query.realtime == "1"
                        obj.isRealtime = isRealtime;
                        res.render("readme", obj);
                    }
                });
            } else if (ext === "docx" || ext === "doc" ||
                ext === "ppt" || ext === "pptx") {
                // if it is a word | ppt file, it will use download page.
                FileUtils.download(currentName, res);
            } else {
                var buffer = fs.readFileSync(currentName)
                if (buffer) {
                    res.writeHead(200, { 'Content-Type': FileUtils.getFileMimeType(currentName) })
                    res.end(buffer, 'binary')
                } else {
                    RouterUtils.error(res, "获取文件失败！");
                }
            }
        });
        me.html("/file/list", function(req, res) {
            var list = FileUtils.listFileSync(".", function(obj) {
                if (obj.ext === "md" || obj.ext === "doc" || obj.ext === "docx" ||
                    obj.ext === "ppt" || obj.ext === "pptx" ||
                    obj.ext === "xls" || obj.ext === "xlsx") {
                    if (obj.ext === "md") {
                        obj.tag = ""
                    } else {
                        obj.tag = "下载"
                    }
                    return true;
                }
                return false;
            });

            var index = req.query["index"],
                size = req.query["size"];

            if (Number.isNaN(index) || index <= 0) {
                index = 1;
            }
            if (Number.isNaN(size) || size <= 0) {
                size = 10;
            }
            res.render("file/list", {
                index: index,
                size: size,
                list: list
            });
        })
    }
}

module.exports = exports = function(map) {
    return (new MyRouter()).load(map)
}