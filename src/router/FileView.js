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
            if (obj.path) {
                uri = FileUtils.getPath(uri, obj.path);
            } else {
                uri = FileUtils.getPath(uri);
            }
            var currentName = uri;
            var ext = FileUtils.getExtName(currentName);
            if(ext === "md"){
                MarkdownUtils.parse2Html(currentName, function(err, obj){
                    if(err){
                        RouterUtils.error(res, "获取文件失败！");    
                    }
                    else{
                        res.render("readme", obj);
                    }
                });  
            }
            else{
                var buffer = fs.readFileSync(currentName)
                if (buffer) {
                    res.writeHead(200, { 'Content-Type': FileUtils.getFileMimeType(currentName) })
                    res.end(buffer, 'binary')
                } else {
                    RouterUtils.error(res, "获取文件失败！");
                }
            }
        });
    }
}

module.exports = exports = function(map) {
    return (new MyRouter()).load(map)
}