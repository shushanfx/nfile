function initEditor(op) {
    ace.require("ace/ext/language_tools");
    var StatusBar = ace.require("ace/ext/statusbar").StatusBar
    var editor = ace.edit("editor"),
        statusbar;
    editor.setTheme(Theme.getCurrentTheme());
    editor.setOption("highlightActiveLine", true);
    editor.setOption("enableBasicAutocompletion", true);
    editor.setOption("enableSnippets", true);
    editor.setOption("enableLiveAutocompletion", true);

    editor.languageMode = op.ext;
    editor.lastModifiedTime = op.mtime;
    editor.path = op.path;
    editor.isWrapOn = true;
    editor.isChanged = false;
    editor.lastValue = null;

    statusBar = new StatusBar(editor, document.getElementById("statusBar"));
    var ext = op.ext;
    if (ext == 'js')
        editor.getSession().setMode("ace/mode/javascript");
    else if (ext == "json" || ext == "json6")
        editor.getSession().setMode("ace/mode/json");
    else if (ext == "jsx" || ext == "es" || ext == "es6")
        editor.getSession().setMode("ace/mode/jsx");
    else if (ext == 'xml' || ext == "xsl")
        editor.getSession().setMode("ace/mode/xml");
    else if (ext == 'xsd')
        editor.getSession().setMode("ace/mode/scheme");
    else if (ext == "conf")
        editor.getSession().setMode("ace/mode/nix");
    else if (ext == 'css' || ext == "scss")
        editor.getSession().setMode("ace/mode/scss");
    else if (ext == "lua")
        editor.getSession().setMode("ace/mode/lua");
    else if (ext == "sql")
        editor.getSession().setMode("ace/mode/mysql");
    else if (ext == "less")
        editor.getSession().setMode("ace/mode/less");
    else if (ext == 'md')
        editor.getSession().setMode("ace/mode/markdown");
    else if (ext == "html")
        editor.getSession().setMode("ace/mode/html");
    else if (ext == "java")
        editor.getSession().setMode("ace/mode/java");
    else if (ext == "jsp")
        editor.getSession().setMode("ace/mode/jsp");
    else if (ext == "vm")
        editor.getSession().setMode("ace/mode/velocity");
    else if (ext == "ftl")
        editor.getSession().setMode("ace/mode/ftl");
    else if (ext == "go")
        editor.getSession().setMode("ace/mode/golang");
    else if (ext == "py")
        editor.getSession().setMode("ace/mode/python");
    else if (ext == "php" || ext == "php5" || ext == "php6")
        editor.getSession().setMode("ace/mode/php")
    else if (ext == "jade")
        editor.getSession().setMode("ace/mode/jade");
    else if (ext == "ejs")
        editor.getSession().setMode("ace/mode/ejs");
    else if (ext == "sh")
        editor.getSession().setMode("ace/mode/sh");
    else if (ext == "coffee")
        editor.getSession().setMode("ace/mode/coffee");
    else if (ext == "cpp" || ext == "c")
        editor.getSession().setMode("ace/mode/c_cpp");
    else if (ext == "ts")
        editor.getSession().setMode("ace/mode/typescript");
    else
        editor.getSession().setMode("ace/mode/text");

    editor.getSession().setUseWrapMode(true);
    editor.getSession().setWrapLimitRange();
    editor.commands.addCommands([{
        name: "showSettingsMenu",
        bindKey: {
            win: "Ctrl-s",
            mac: "Command-s",
            sender: "editor"
        },
        exec: function (editor) {
            var value = editor.getValue();
            var oldValue = editor.lastValue;
            if (oldValue != value) {
                jQuery.post("save", {
                    content: value,
                    ext: editor.ext,
                    path: editor.path,
                    "mtime": editor.lastModifiedTime
                }, function (result) {
                    Utils.handleResult(result, function () {
                        if (result && result.code == "1") {
                            editor.lastValue = value;
                            editor.lastModifiedTime = result.mtime;
                            editor.isChanged = false;
                            onHandleChanged(editor.isChanged);
                            onHandleNotify("<span style='color: red;'>保存成功～～<span>");
                        } else {
                            onHandleNotify("<span style='color: red;'>" + result.message || "保存失败，请稍后再试～～" + "<span>");
                        }
                    });

                });
            } else {
                onHandleNotify("<span style='color: red;'>保存成功～～<span>");
            }
        },
        readOnly: true
    }]);
    editor.commands.addCommands([{
        name: "toggleUserWrap",
        bindKey: {
            win: "Ctrl-w",
            mac: "Command-w",
            sender: "editor"
        },
        exec: function (editor) {
            var isOn = editor.isWrapOn;
            if (isOn) {
                editor.getSession().setUseWrapMode(false);
                onHandleNotify("<span style='color: red;'>自动换行关闭～～<span>");
            } else {
                editor.getSession().setUseWrapMode(true);
                editor.getSession().setWrapLimitRange();
                onHandleNotify("<span style='color: red;'>自动换行打开～～<span>");
            }
            editor.isWrapOn = !isOn;
        },
        readOnly: false
    }, {
        name: "changeThmeme",
        bindKey: {
            win: "Alt-t",
            mac: "Command-t"
        },
        exec: function (editor) {
            editor.setTheme(Theme.getNextTheme());
            onHandleNotify("<span style='color: red;'>Theme改为：" + Theme.getCurrentThemeName() + "<span>");
        }
    }, {
        name: "bueatifyCode",
        bindKey: {
            win: "Ctrl-b",
            mac: "Command-b"
        },
        exec: function (editor) {
            if (editor.languageMode == "js" || editor.languageMode == "xml"
                || editor.languageMode == "html") {
                var Beautify = ace.require("ace/ext/beautify");
                Beautify.beautify(editor.getSession());
                onHandleNotify("<span style='color: red;'>美化" + editor.languageMode + "代码<span>");
            } else if(editor.languageMode == "json"){
                var value = editor.getValue();
                var newValue = vkbeautify.json(value, 4);
                editor.getSession().doc.setValue(newValue);
                onHandleNotify("<span style='color: red;'>美化" + editor.languageMode + "代码<span>");
            } else if(editor.languageMode == "css"){
                var value = editor.getValue();
                var newValue = vkbeautify.css(value, '. . . .');
                editor.getSession().doc.setValue(newValue);
                onHandleNotify("<span style='color: red;'>美化" + editor.languageMode + "代码<span>");
            } else if(editor.languageMode == "sql"){
                var value = editor.getValue();
                var newValue = vkbeautify.sql(value, '----');
                editor.getSession().doc.setValue(newValue);
                onHandleNotify("<span style='color: red;'>美化" + editor.languageMode + "代码<span>");
            }
            else if (editor.languageMode == "xml" || editor.languageMode == "xsd") {
                var value = editor.getValue();
                var newValue = vkbeautify.xml(value, 4);
                editor.getSession().doc.setValue(newValue);
                onHandleNotify("<span style='color: red;'>美化" + editor.languageMode + "代码<span>");
            } else {
                onHandleNotify("<span style='color: red;'>不支持该格式的美化<span>");
            }
        }
    }]);
    editor.lastValue = editor.getValue();
    editor.on("change", Utils.throttle(function(){
        var currentValue = editor.getValue();
        editor.isChanged = currentValue != editor.lastValue;
        onHandleChanged(editor.isChanged);
    }, 100));
    onHandleChanged(editor.isChanged);
    return editor;
}

function onHandleChanged(isChanged){
    if(top && top.FileSystem && top.FileSystem.setTabStatus){
        top.FileSystem.setTabStatus(undefined, isChanged);
    }
}

function onHandleNotify(str) {
    var dom = $("#notify"),
        el;
    if (dom.length == 0) {
        dom = $("<span id='notify'></span>").appendTo("#statusBar");
    }
    el = dom.get(0);
    if (el.timer) {
        window.clearTimeout(el.timer);
    }
    dom.html(str).show();
    el.timer = window.setTimeout(function () {
        dom.hide();
        el.timer = null;
    }, 1500);
}