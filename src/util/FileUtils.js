var path = require("path");
var pathExtra = require("node-path-extras");
var grunt = require("grunt");
var fs = require("fs");
var fse = require("fs-extra");
var mime = require("mime");
var JSZip = require('jszip');
var glob = require("glob");


var RouterUtils = require("./RouterUtils")


class FileUtils {
    /**
     * Init a file system.
     * @param {*} root the root directory of file system.
     */
    init(root) {
        var finalPath = root;
        if (!path.isAbsolute(root)) {
            finalPath = path.join(process.cwd(), root);
        }
        this.root = root;
        if(!this.exists()){
            console.info(`Root directory [${this.root}] is not existed, try to create it.`);
            this.guaranteeSelf();
        }
        else{
            console.info(`Root directory [${this.root}]. `)
        }
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
                    } else if (path.isAbsolute(item)) {
                        tempPath = item;
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
    getExtName(filePath) {
        var ext = "",
            temp;
        var url = filePath;
        if (filePath) {
            if (url.indexOf("?") !== -1) {
                temp = url.split("?");
                url = temp[0];
            }
            if (url) {
                temp = url.split(".");
                ext = temp[temp.length - 1];
            }
        }
        return ext;
    }
    guaranteeParents(filePath) {
        var parent = path.join(this.getPath(filePath), "..");
        if (!fse.existsSync(parent)) {
            fse.mkdirpSync(parent);
        }
        return this;
    }
    guaranteeSelf(filePath){
        let p = this.getPath(filePath);
        if(!fse.existsSync(p)){
            fse.mkdirpSync(p)
        }
        return this;
    }
    download(filePath, res) {
            var ext = "",
                tmp = null;
            if (filePath) {
                var currentName = this.getPath(filePath);
                var listFolder = function(dir, basename, zip) {
                    var list = fs.readdirSync(dir)
                    list.forEach(function(item) {
                        var newPath = path.join(dir, item)
                        var newBaseName = path.join(basename, item)
                        var st = fs.statSync(newPath)
                        if (st.isFile()) {
                            zip.file(newBaseName, fs.readFileSync(newPath))
                        } else if (st.isDirectory()) {
                            listFolder(newPath, newBaseName, zip)
                        }
                    })
                }
                fs.stat(currentName, function(err, stats) {
                    if (err) {
                        RouterUtils.error(res, '获取文件失败！')
                    } else {
                        if (stats.isDirectory()) {
                            var basename = path.basename(currentName)
                            res.attachment(basename + '.zip')
                            var zip = new JSZip()
                            zip.folder(basename)
                            listFolder(currentName, basename, zip)
                            zip.generateNodeStream({ streamFile: true })
                                .pipe(res)
                                .on('finish', function() {
                                    res.end();
                                });
                        } else if (stats.isFile()) {
                            res.download(currentName)
                        } else {
                            RouterUtils.error(res, '不支持的文件格式！')
                        }
                    }
                });
            }
        }
        /**
         * Get a list for file system.
         * @param {*} filePath A file path, dot(.) stands for root directory.
         * @param {* Function} filter a file path, if it is null, return all file. 
         *  function(obj)
         *  only return true can take the file into consideration.
         * @param {*} callback, An object array. The object is like
         *  {
         *      name: "the file name",
         *      ext: "the ext of the file"
         *      fsPath: "the filepath in file system."
         *      abPath: "the absolute path of the file"
         *      stats: "the stats object of the file."
         *  }
         */
    listFileSync(filePath, filter) {
        var me = this;
        var list = [];
        var readDir = function(obj) {
            var files = fs.readdirSync(obj.abPath);
            files && files.length > 0 && files.forEach(item => {
                var goodPath = path.join(obj.abPath, item);
                var fsPath = path.join(obj.fsPath, item);
                var fileObject = {
                    name: item,
                    abPath: goodPath,
                    fsPath: fsPath
                };
                if (item && item.startsWith(".")) {
                    return true;
                }
                var stats = fs.statSync(goodPath);
                if (stats.isDirectory()) {
                    var myList = readDir(fileObject);
                    if (myList && myList.length > 0) {
                        Array.prototype.push.apply(list, myList);
                    }
                } else {
                    fileObject.stats = stats;
                    fileObject.ext = me.getExtName(fileObject.fsPath);

                    if (typeof filter === "function") {
                        filter.call(me, fileObject) && list.push(fileObject);
                    } else {
                        list.push(fileObject);
                    }
                }
            });
        }
        readDir({
            abPath: this.getPath(filePath),
            fsPath: filePath
        });

        return list;
    }
    
    getDirectoryList(filePath){
        var _path = this.getPath(filePath);
        var list = glob.sync("*", {
            cwd: _path,
            mark: true
        });
        return list;
    }
    exists(filePath) {
        return fse.existsSync(this.getPath(filePath));
    }
    isNewer(filePath1, filePath2) {
        if (this.exists(filePath1) && this.exists(filePath2)) {
            let stats1 = fs.statSync(this.getPath(filePath1));
            let stats2 = fs.statSync(this.getPath(filePath2));

            return stats1.mtime.getTime() > stats2.mtime.getTime();
        }

        return false;
    }
    toFriendlySize(byteSize) {
        if (!Number.isNaN(byteSize)) {
            if (byteSize < 1024) {
                return byteSize + "b";
            } else if (byteSize < 1024 * 1024) {
                return (byteSize / 1024).toFixed(1) + "k";
            } else if (byteSize < 1024 * 1024 * 1024) {
                return (byteSize / 1024 / 1024).toFixed(1) + "M";
            } else {
                return (byteSize / 1024 / 1024 / 1024).toFixed(1) + "G";
            }
        }
        return "EMPTY";
    }
    rel(){
        var nowPath = this.getPath.apply(this, arguments);
        var basePath = this.getPath(".");
        if(pathExtra.contains(basePath, nowPath)){
            return path.relative(basePath, nowPath);
        }
        return "."
    }
}

module.exports = exports = new FileUtils();