var marked = require("marked");
var fs = require("fs");
var obj = {};

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

//增加的代码，用于个性化输出table
var renderer = new marked.Renderer();
renderer.table = function (header, body) {
    return '<table class="table table-striped">'+header+body+'</table>'
};

function readTitle(str){
    var reg = /^\s*\#\s*(.*)$/gm;
    if(str){
        var arr = reg.exec(str);
        if(arr && arr[1]){
            return arr[1];
        }
    }
    return "MD文档";
}

obj.parse2Html = function(filePath, callback){
    fs.readFile(filePath, "utf-8", function(err, data){
        var title = readTitle(data);
        if(err){
            callback(err);
        }
        else{
            try{
                callback(null, {
                    title: title,
                    content: marked(data, {renderer: renderer})
                });
            }
            catch(e){
                callback(e);
            }
        }
    });
};

module.exports = obj;