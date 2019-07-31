var fs = require('fs')
var fse = require('fs-extra')
var path = require('path')
var JSZip = require('jszip')

var systemConfig = require('../config.js').getConfig()
var BaseRouter = require('./BaseRouter.js')
var RouterUtils = require('../util/RouterUtils.js')
var FileUtils = require("../util/FileUtils.js").init(systemConfig.workspace.path, true)

class MyRouter extends BaseRouter {
    init() {
        var me = this
        this.json('/file/add', function (req, res) {
            var newFileName = FileUtils.getPath(req.query.path, req.query.fileName)
            var isDir = req.query.isDir == '1'
            var method = isDir ? 'ensureDir' : 'ensureFile'
            fse[method].call(fse, newFileName, function (err) {
                if (err) {
                    RouterUtils.fail(res)
                } else {
                    RouterUtils.success(res)
                }
            })
        }).json('/file/rename', function (req, res) {
            var oldFilePath = FileUtils.getPath(req.query.path)
            var newFilePath = FileUtils.getPath(req.query.path, '..', req.query.fileName)
            if (fs.existsSync(newFilePath)) {
                RouterUtils.fail(res, '新的文件夹或目录已存在')
            } else {
                fs.rename(oldFilePath, newFilePath, function (err) {
                    if (err) {
                        RouterUtils.fail(res)
                    } else {
                        RouterUtils.success(res)
                    }
                })
            }
        }).html('/file/edit', function (req, res) {
            var obj = req.query
            if (req.query.path) {
                var currentPath = FileUtils.getPath(req.query.path)
                if (fs.existsSync(currentPath)) {
                    var encoding = req.query.encoding || FileUtils.getFileEncoding(currentPath)
                    var content = FileUtils.getFileContent(currentPath, encoding)
                    if (FileUtils.isXML(currentPath)) {
                        let newEncoding = FileUtils.getFileEncodingWithContent(content, encoding);
                        if (newEncoding !== content) {
                            // eocoding 发生变化
                            content = FileUtils.getFileContent(currentPath, newEncoding);
                            encoding = newEncoding;
                        }
                    }
                    var ext = path.extname(currentPath)
                    if (ext) {
                        ext = ext.substring(1)
                    }
                    obj.mtime = FileUtils.getLastModifiedTime(currentPath)
                    obj.encoding = encoding
                    obj.ext = ext
                    obj.content = content
                    obj.pp = obj.path.replace(/\\/g, '\\\\')
                    res.render('file/edit', obj)
                } else {
                    RouterUtils.error(res, '获取文件失败！')
                }
            } else {
                RouterUtils.error(res, '参数异常！')
            }
        }).html('/file/content', function (req, res) {
            var obj = req.query
            if (req.query.path) {
                var currentPath = FileUtils.getPath(req.query.path)
                if (fs.existsSync(currentPath)) {
                    var encoding = req.query.encoding || FileUtils.getFileEncoding(currentPath);
                    var content = FileUtils.getFileContent(currentPath, encoding);
                    if (FileUtils.isXML(currentPath)) {
                        let newEncoding = FileUtils.getFileEncodingWithContent(content, encoding);
                        if (newEncoding !== content) {
                            // eocoding 发生变化
                            content = FileUtils.getFileContent(currentPath, newEncoding);
                            encoding = newEncoding;
                        }
                    }
                    var ext = path.extname(currentPath)
                    if (ext) {
                        ext = ext.substring(1)
                    }
                    obj.mtime = FileUtils.getLastModifiedTime(currentPath)
                    obj.encoding = encoding
                    obj.ext = ext
                    obj.content = content
                    obj.pp = obj.path.replace(/\\/g, '\\\\')
                    RouterUtils.success(res, undefined, {
                        data: obj
                    })
                } else {
                    RouterUtils.fail(res, '获取文件失败！')
                }
            } else {
                RouterUtils.fail(res, '参数异常！')
            }
        }).json('/file/save', 'post', function (req, res) {
            var obj = {
                code: -1,
                message: '保存失败，请稍后再试～～'
            }
            if (req.body && req.body.path) {
                var currentName = FileUtils.getPath(req.body.path)
                var currentTime = FileUtils.getLastModifiedTime(currentName)
                var oldTime = req.body.mtime
                if (oldTime != currentTime) {
                    obj.code == -1
                    obj.message = '保存失败！当前文档已过期，请刷新页面～～'
                } else {
                    var encoding = req.body.encoding || FileUtils.getFileEncoding(currentName);
                    if (FileUtils.isXML(currentName)) {
                        encoding = FileUtils.getFileEncodingWithContent(req.body.content, encoding);
                    }
                    FileUtils.writeFileContent(currentName, req.body.content, encoding);
                    obj.code = 1
                    obj.message = 'success'
                    obj.mtime = FileUtils.getLastModifiedTime(currentName)
                }
                res.json(obj)
            } else {
                res.json(obj)
            }
        }).json('/file/delete', function (req, res) {
            var ret = {
                    code: 0
                },
                obj = req.query,
                currentName = FileUtils.getPath(obj.path)
            if (!fs.existsSync(currentName)) {
                ret.code = -1
                ret.message = '无法找到对应文件或目录'
            } else {
                try {
                    FileUtils.removeFile(currentName)
                    ret.code = 1
                } catch (e) {
                    ret.code = -2
                }
            }
            res.json(ret)
        }).html('/file/view', function (req, res) {
            var obj = req.query
            var currentName = FileUtils.getPath(obj.path)
            var buffer = fs.readFileSync(currentName)
            if (buffer) {
                res.writeHead(200, {
                    'Content-Type': FileUtils.getFileMimeType(obj.path)
                })
                res.end(buffer, 'binary')
            } else {
                RouterUtils.error(res, "获取文件失败！");
            }
        }).json('/file/upload', 'post', function (req, res) {
            var pp = req.query.path
            var currentName = FileUtils.getPath(pp)
            if (req.files && req.files.Filedata) {
                var oldName = path.join(currentName, req.files.Filedata.name)
                var newName = path.join(currentName, req.files.Filedata.originalname)
                fse.copySync(req.files.Filedata.path, path.join(currentName, req.files.Filedata.originalname))
            }
            RouterUtils.success(res);
        }).html('/file/download', function (req, res) {
            var obj = req.query;
            if (obj && obj.path) {
                FileUtils.download(obj.path, res);
            } else {
                RouterUtils.error(res, "下载文件失败！")
            }
        }).json('/file/tree', function (req, res) {
            var filePath = req.query.path;
            var isAll = req.query.all === "1";
            if (!filePath) {
                filePath = '.'
            }
            RouterUtils.success(res, null, {
                data: [{
                    text: path.basename(FileUtils.getPath(filePath)),
                    state: 'open',
                    href: filePath,
                    dir: 1,
                    children: getFileTree(filePath, isAll)
                }]
            })
        }).json('/file/extract', function (req, res) {
            var filePath = req.query.path;
            if (filePath && filePath.indexOf(".zip") != -1) {
                if (FileUtils.exists(filePath)) {
                    var dist = filePath.replace(/\.zip$/gi, "");
                    if (FileUtils.exists(dist)) {
                        RouterUtils.fail(res, "目标文件夹已存在！");
                    } else {
                        FileUtils.unzip(filePath, dist, function (err) {
                            if (err) {
                                RouterUtils.fail(res, "解压失败！");
                            } else {
                                RouterUtils.success(res, null, {
                                    data: {
                                        from: filePath,
                                        to: dist
                                    }
                                });
                            }
                        });
                    }
                } else {
                    RouterUtils.fail(res, "解压的文件不存在！");
                }
            } else {
                RouterUtils.fail(res, "目前只支持zip文件解压！");
            }
        });
    }
}

function getFileTree(newPath, isAll) {
    var tree = []
    var pp = FileUtils.getPath(newPath)
    if (fs.existsSync(pp)) {
        var files = fs.readdirSync(pp)
        for (var i = 0; i < files.length; i++) {
            var item = files[i],
                pp1 = path.join(pp, item),
                pp2 = path.join(newPath, item),
                st = fs.statSync(pp1),
                obj = {
                    'text': item,
                    'href': pp2,
                    'dir': '0'
                }
            if (!isAll && item && item.startsWith(".")) {
                continue;
            }
            if (st.isDirectory()) {
                obj.children = getFileTree(pp2, isAll);
                obj.state = 'closed';
                obj.dir = '1';
            }
            tree.push(obj)
        }
        tree.sort(function (value1, value2) {
            if (value1.dir != value2.dir) {
                return value2.dir - value1.dir
            } else {
                return value1.text > value2.text ? 1 : -1
            }
        })
    }
    return tree
}

module.exports = exports = function (map) {
    return (new MyRouter()).load(map)
}