var path = require("path");
var pathExtra = require("node-path-extras");
var grunt = require("grunt");
var fs = require("fs");

class FileUtils {
    init(root){
        var finalPath = root;
        if(!path.isAbsolute(root)){
            finalPath = path.join(process.cwd(), root);
        }
        this.root = root;
        return this;
    }
    getPath(){
        var tempPath = this.root,
            childPath;
        var i, item;
        if (arguments.length > 0) {
            if (arguments.length > 1) {
                childPath = path.join.apply(path, arguments);
            } else {
                childPath = arguments[0];
            }
            tempPath = path.join(tempPath, childPath);
        }
        if(tempPath !== this.root 
            && !pathExtra.contains(this.root, tempPath)){
            return this.root;
        }
        return tempPath;
    }
    getFileEncoding(filePath){
        var obj = {
            'xml': 'GBK',
            'xsl': 'GBK'
        }
        var arr = filePath.split('.')
        var ret = obj[arr[arr.length - 1]]
        if (ret) {
            return ret
        } else {
            return 'UTF-8'
        }
    }
    getFileContent(filePath, encoding){
        return grunt.file.read(filePath, {
            encoding: encoding
        });
    }
    getLastModifiedTime(filePath){
        var obj = fs.statSync(filePath)
        if (obj && obj.mtime) {
            return obj.mtime.getTime();
        }
        return 0;
    }
    writeFileContent(filePath, content, encoding){
        return grunt.file.write(filePath, content, { 'encoding': encoding });
    }
    getFileMimeType(filePath){

    }
    removeFile(filePath){
        var me = this;
        var pp = filePath;
        if (fs.statSync(pp).isDirectory()) {
            var files = fs.readdirSync(pp);
            for (var i = 0; i < files.length; i++) {
                var item = files[i],
                    pp2 = path.join(filePath, item);
                me.removeFile(pp2);
            }
            fs.rmdirSync(pp);
        } else {
            fs.unlinkSync(pp);
        }
    }
}

module.exports = exports = new FileUtils();