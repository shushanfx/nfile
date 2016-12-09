var fs = require("fs");
var fse = require("fs-extra");
var grunt = require("grunt");
var path = require("path")

var systemConfig = require("../config.js").getConfig();
var BaseRouter = require("./BaseRouter.js");
var RouterUtils = require("../util/RouterUtils.js");

class MyRouter extends BaseRouter {
    init() {
        var me = this;

        this.json("/file/add", function(req, res){
            var newFileName = getWorkspacePath(req.query.path, req.query.fileName);
            var isDir = req.query.isDir == "1";
            var method = isDir ? "ensureDir" : "ensureFile";
            fse[method].call(fse, newFileName, function(err){
                if(err){
                    RouterUtils.fail(res);
                }
                else{
                    RouterUtils.success(res);
                }
            });
        }).json("/file/rename", function(req, res){
            var oldFilePath = getWorkspacePath(req.query.path);
            var newFilePath = getWorkspacePath(req.query.path, "..", req.query.fileName);
            if(fs.existsSync(newFilePath)){
                RouterUtils.fail(res, "新的文件夹或目录已存在");
            }
            else {
                fs.rename(oldFilePath, newFilePath, function(err){
                    if(err){
                        RouterUtils.fail(res);
                    }
                    else{
                        RouterUtils.success(res);
                    }
                });
            }
        }).html("/file/edit", function(req, res){
            var obj = req.query;
            if(req.query.path){
                var currentPath = getWorkspacePath(req.query.path);
                if(fs.existsSync(currentPath)){
                    var encoding = getFileEncoding(currentPath);
                    var content = getFileContent(currentPath, encoding);
                    var ext = path.extname(currentPath);
                    if(ext){
                        ext = ext.substring(1);
                    }
                    obj.mtime = getLastModifiedTime(currentPath);
                    obj.encoding = encoding;                    
                    obj.ext = ext;
                    obj.content = content;
                    obj.pp = obj.path.replace(/\\/g, "\\\\");
                    res.render("file/edit", obj)
                }   
                else{
                    RouterUtils.error(res, "获取文件失败！");
                } 
            }   
            else{
                RouterUtils.error(res, "参数异常！");
            }

        }).html("/file/content", function(req, res){

        }).json("/file/save", "post", function(req, res){

        }).json("/file/delete", function(req, res){

        }).html("/file/view", function(req, res){

        }).json("/file/upload", "post", function(req, res){

        }).html("/file/download", function(req, res){

        })
    }
}

function getWorkspacePath(){
    var tempPath = systemConfig.workspace.path, childPath;
    if(arguments.length > 0){
        if(arguments.length > 1){
            childPath = path.join.apply(path, arguments);
        }
        else{
            childPath = arguments[0];
        }
        tempPath = path.join(tempPath, childPath);
    }
    return tempPath;    
}

function getFileEncoding(path){
    var obj = {
        "xml" : "GBK",
        "xsl" : "GBK"
    };
    var arr = path.split(".");
    var ret = obj[arr[arr.length - 1]];
    if(ret){
        return ret;
    }
    else{
        return "UTF-8";
    }
}

function getFileContent(path, encoding){
    return grunt.file.read(path, {
        encoding: encoding    
    });
}

function getLastModifiedTime(path){
    var obj = fs.statSync(path);
    if(obj && obj.mtime){
        return obj.mtime.getTime();
    }
    return 0;
}

module.exports = exports = function(map){
    return (new MyRouter()).load(map);
}