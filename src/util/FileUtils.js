var path = require("path");
var pathExtra = require("node-path-extras");
var grunt = require("grunt");
var fs = require("fs");
var mime = require("mime");


class FileUtils {
    init(root) {
        var finalPath = root;
        if (!path.isAbsolute(root)) {
            finalPath = path.join(process.cwd(), root);
        }
        this.root = root;
        return this;
    }
    getPath() {
        var tempPath = this.root;
        var i, item;
        if (arguments.length > 0) {
            for (i = 0; i < arguments.length; i++) {
                item = arguments[i];
                if (typeof(item) === "string") {
                    if (item === ".") {
                        continue;
                    }
                    tempPath = path.join(tempPath, item);
                }
            }
        }
        if (tempPath !== this.root &&
            !pathExtra.contains(this.root, tempPath)) {
            return this.root;
        }
        return tempPath;
    }
    getFileEncoding(filePath) {
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
    getFileContent(filePath, encoding) {
        return grunt.file.read(filePath, {
            encoding: encoding
        });
    }
    getLastModifiedTime(filePath) {
        var obj = fs.statSync(filePath)
        if (obj && obj.mtime) {
            return obj.mtime.getTime();
        }
        return 0;
    }
    writeFileContent(filePath, content, encoding) {
        return grunt.file.write(filePath, content, { 'encoding': encoding });
    }
    getFileMimeType(filePath) {
        if (!path.isAbsolute(filePath)) {
            return mime.lookup(this.getPath(filePath));
        } else {
            return mime.lookup(filePath);
        }
    }
    removeFile(filePath) {
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