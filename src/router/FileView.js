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
        me.html(["/list", "/file/list", "/"], function(req, res) {
            var filePath = req.query.path;
            var list = null, directoryList;
            var index = req.query["index"],
                size = req.query["size"];
            var minValue = 0;
            var total = 0;
            var pageTotal = 0;
            var topList;

            if(!filePath){
                filePath = "."
            }
            list = FileUtils.listFileSync(filePath, function(obj) {
                if (obj.ext === "md" || obj.ext === "html" ||
                    obj.ext === "doc" || obj.ext === "docx" ||
                    obj.ext === "ppt" || obj.ext === "pptx" ||
                    obj.ext === "pdf" ||
                    obj.ext === "xls" || obj.ext === "xlsx") {
                    if (obj.ext === "md" 
                        || obj.ext === "html"
                        || obj.ext === "pdf") {
                        obj.tag = ""
                    } else {
                        obj.tag = "下载"
                    }
                    obj.ftime = DateUtils.getFriendlyTime(obj.stats.mtime);
                    obj.isNew = DateUtils.inNDays(obj.stats.mtime, 5);
                    obj.mtime = DateUtils.format(obj.stats.mtime);
                    obj.ctime = DateUtils.format(obj.stats.ctime); 
                    obj.size = FileUtils.toFriendlySize(obj.stats.size);

                    return true;
                }
                return false;
            });
            directoryList = FileUtils.getDirectoryList(filePath);


            if (!index || Number.isNaN(index) || index <= 0) {
                index = 1;
            }
            if (!size || Number.isNaN(size) || size <= 0) {
                size = 10;
            }

            if (list && list.length > 0) {
                total = list.length;
                list.sort((a, b) => {
                    // 降序
                    return b.stats.mtime.getTime() - a.stats.mtime.getTime();
                });
                minValue = Math.min(size * index, total);
                topList = list.slice(0, 3);
                list = list.slice(size * (index - 1), minValue);
            }
            if(directoryList && Array.isArray(directoryList)){
                directoryList.splice(0, 0, {name:"..", path: FileUtils.rel(filePath, "..")});
            }


            res.render("file/list", {
                pageIndex: index,
                pageSize: size,
                pageTotal: size > 0 ? Math.ceil(total / size) : 1,
                path: filePath,
                total: total,
                list: list,
                directory: directoryList,
                topList: topList
            });
        });
    }
}

module.exports = exports = function(map) {
    return (new MyRouter()).load(map)
}