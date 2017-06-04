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
            var uri = getURI(req, "readme");
            var currentName = FileUtils.getPath(uri);;
            var ext = FileUtils.getExtName(currentName);

            if (ext == "md") {
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
            } else {
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
        me.json("/poi-convert", function(req, res) {
            var POI = require("poi-converter-node");
            var src = req.query.src;
            var dst = ".convert/" + src + ".pdf";

            if (FileUtils.exists(src)) {
                if (FileUtils.isNewer(dst, src)) {
                    RouterUtils.success(res, "From Cache.");
                } else {
                    let srcPath = FileUtils.getPath(src);
                    let dstPath = FileUtils.getPath(dst);
                    FileUtils.guaranteeParents(dstPath)
                    POI.to(srcPath, dstPath, function(err, out, result) {
                        if (result && result.success) {
                            RouterUtils.success(res);
                        } else {
                            RouterUtils.fail(res, "转换失败！");
                        }
                    });
                }
            } else {
                RouterUtils.fail(res, "原始文件不存在！");
            }
        });
        me.html("/poi/**", function(req, res) {
            var uri = getURI(req, "poi");
            var view = req.query.view;
            var abPath = FileUtils.getPath(uri);
            var ext = FileUtils.getExtName(uri);
            var dstPath = ".convert/" + uri + ".pdf";
            if ("|pdf|doc|docx|ppt|pptx|".indexOf("|" + ext + "|") >= 0) {
                if (view === "1") {
                    if (FileUtils.exists(dstPath)) {
                        var buffer = fs.readFileSync(FileUtils.getPath(dstPath));
                        if (buffer) {
                            res.writeHead(200, {
                                'Content-Disposition': 'inline',
                                'Content-Type': FileUtils.getFileMimeType(dstPath)
                            });
                            res.end(buffer, 'binary')
                        } else {
                            res.render("home/error", {
                                message: "获取文件失败！"
                            });
                        }
                    } else {
                        res.render("home/error", {
                            message: "文件不存在！"
                        });
                    }
                } else {
                    res.render("poi-loading", {
                        abPath: uri,
                        ext: ext
                    });
                }
            } else {
                res.render("home/error", {
                    message: "Only doc、docx、ppt、pptx is supported."
                });
            }
        });
    }
}

function getURI(req, replace) {
    var uri = req.path;
    if (uri) {
        uri = uri.replace(new RegExp("^\\/" + replace + "\\/", "gi"), "");
    }
    if (!uri) {
        uri = "";
    }
    if (uri) {
        // 对uri进行处理， 将编码url转为中文
        uri = decodeURIComponent(uri);
    }
    return uri;
}

module.exports = exports = function(map) {
    return (new MyRouter()).load(map)
}