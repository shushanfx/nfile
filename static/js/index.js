    function onHandleTree() {
        $.getJSON("file/tree", {
            path: window.param.path,
            all: window.param.all
        }, function(result) {
            if (result && result.code === 1) {
                $("#divFileTree").tree("loadData", result.data);
            }
        });
    }

    $(function() {
        $.ajaxSetup({
            cache: false
        })
        $("#divFileTree").tree({
            onClick: function(node) {
                if (node.dir == -1) {
                    onHandleTab(node.text, node.iconCls || "", node.href);
                } else if (node.dir == 0) {
                    var url = "file/edit?path=" + window.encodeURIComponent(node.href);
                    if (node.href.indexOf(".exe") !== -1 ||
                        node.href.indexOf(".zip") !== -1 || 
                        node.href.indexOf(".tar") !== -1 ||
                        node.href.indexOf(".apk") !== -1 ||
                        node.href.indexOf(".xz") !== -1 ||
                        node.href.indexOf(".war") !== -1 ||
                        node.href.indexOf(".gz") !== -1 ||
                        node.href.indexOf(".app") !== -1 ||
                        node.href.indexOf(".dll") !== -1 ||
                        node.href.indexOf(".so") !== -1){
                        // do nothing.
                        return true;
                    }
                    if (node.href.indexOf(".ppt") !== -1 ||
                        node.href.indexOf("pptx") !== -1 ||
                        node.href.indexOf("doc") !== -1 ||
                        node.href.indexOf("xls") !== -1 ||
                        node.href.indexOf("xlsx") !== -1 ||
                        node.href.indexOf("docx") !== -1) {
                        window.open('file/view/' + node.href.replace(/\\/gi, "/"));
                        return true;
                    }
                    if (node.href.indexOf(".gif") !== -1 ||
                        node.href.indexOf(".png") !== -1 ||
                        node.href.indexOf(".jpeg") !== -1 ||
                        node.href.indexOf(".jpg") !== -1 ||
                        node.href.indexOf(".ico") !== -1 ||
                        node.href.indexOf(".tiff") !== -1 ||
                        node.href.indexOf("pdf") !== -1 ||
                        node.href.indexOf(".tff") !== -1 ||
                        node.href.indexOf(".mp3") !== -1 ||
                        node.href.indexOf(".wav") !== -1 ||
                        node.href.indexOf(".bmp") !== -1 ||
                        node.href.indexOf(".mvb") !== -1 ||
                        node.href.indexOf(".swf") !== -1) {
                        url = "file/view?path=" + window.encodeURIComponent(node.href)
                    }
                    onHandleTab(node.text, node.iconCls || "", url);
                }
            },
            onContextMenu: function(e, node) {
                var $rightMenu = $("#rightMenuWapVr");
                if ($rightMenu.length == 0) {
                    $rightMenu = $('<div id="rightMenuWapVr" style="width:120px;"></div>').appendTo("body").menu({
                        onClick: function(item) {
                            var trees = $("#divFileTree");
                            var node = trees.tree("getSelected");
                            if (item.id == "rightMenuAddFile" || item.id == 'rightMenuAddDir') {
                                var isDir = (item.id == 'rightMenuAddFile' ? 0 : 1);
                                var tips = (isDir ? '请输入新的文件夹名' : '请输入新的文件名');
                                var getNewPath = function(old, newName) {
                                    if (old === "." || !old) {
                                        return newName;
                                    }
                                    return old + "/" + newName;
                                }

                                $.messager.prompt('新增', tips, function(r) {
                                    if ($.trim(r)) {
                                        $.getJSON("file/add", { path: node.href, fileName: r, isDir: isDir }, function(result) {
                                            Utils.handleResult(result, function() {
                                                if (result && result.code == 1) {
                                                    var obj = {
                                                        parent: node.target,
                                                        data: [{
                                                            text: $.trim(r),
                                                            href: getNewPath(node.href, $.trim(r)),
                                                            dir: isDir
                                                        }]
                                                    }
                                                    if (isDir) {
                                                        obj.data[0].state = 'closed';
                                                        obj.data[0].children = [];
                                                    }
                                                    trees.tree('append', obj);
                                                    return false;
                                                }
                                            });
                                        });
                                    }
                                });
                            } else if (item.id == "rightMenuRefactor") {
                                $.messager.prompt('重命名', '重命名【' + node.text + '】：', function(r) {
                                    if ($.trim(r) && $.trim(r) != node.text) {
                                        var value = $.trim(r);
                                        $.getJSON("file/rename", {
                                            path: node.href,
                                            fileName: value
                                        }, function(result) {
                                            Utils.handleResult(result, function() {
                                                if (result && result.code == 1) {
                                                    // 关闭原来名字打开的tab内容
                                                    onHandleTabDelete(node.text);
                                                    var oldLinkArr = node.href.split('\\');
                                                    oldLinkArr.splice(oldLinkArr.length - 1, 1, r);
                                                    trees.tree('update', {
                                                        target: node.target,
                                                        text: $.trim(r),
                                                        href: oldLinkArr.join('\\')
                                                    });
                                                    return false;
                                                }
                                            });
                                        });
                                    }
                                });
                            } else if (item.id == "rightMenuRemove") {
                                $.messager.confirm("删除", '你确认要删除文件【' + node.text + '】？', function(r) {
                                    if (r) {
                                        $.getJSON("file/delete", {
                                            path: node.href,
                                            "_": +new Date()
                                        }, function(result) {
                                            Utils.handleResult(result, function() {
                                                if (result && result.code == 1) {
                                                    onHandleTabDelete(node.text);
                                                    trees.tree('remove', node.target);
                                                    return false;
                                                }
                                            })
                                        });
                                    }
                                })
                            } else if (item.id == 'rightMenuView') {
                                FileSystem.addTab("view-" + node.text, '', 'file/view/' + node.href.replace(/\\/gi, "/"), {
                                    refresh: true,
                                    scroll: true
                                })
                            } else if (item.id == 'rightMenuTestNew') {
                                window.open('file/view/' + node.href.replace(/\\/gi, "/"));
                            } else if (item.id === "rightMenuUpload") {
                                onHandleFileUpload(node.href);
                            } else if (item.id === "rightMenuDownload") {
                                window.open("file/download?path=" + encodeURIComponent(node.href));
                            } else if (item.id === "rightMenuExtract") {
                                onHandleFileExtract(node.href);
                            }
                        }
                    });
                    // 右击菜单第一次点击
                    $rightMenu.menu("appendItem", { id: "rightMenuAddFile", text: "新建文件", iconCls: "icon icon-add-file", disabled: true });
                    $rightMenu.menu("appendItem", { id: "rightMenuAddDir", text: "新建文件夹", iconCls: "icon icon-add-directory", disabled: true });
                    $rightMenu.menu('appendItem', { id: "rightMenuRefactor", text: "重命名", iconCls: "icon icon-file-rename", disabled: true });
                    $rightMenu.menu('appendItem', { id: "rightMenuRemove", text: "删除", iconCls: "icon-remove", disabled: true });
                    $rightMenu.menu('appendItem', { separator: true });
                    $rightMenu.menu('appendItem', { id: "rightMenuUpload", text: "上传文件", iconCls: "icon icon-file-upload", disabled: true });
                    $rightMenu.menu('appendItem', { id: "rightMenuDownload", text: "下载", iconCls: "icon-file-download", disabled: true });
                    $rightMenu.menu('appendItem', { id: "rightMenuExtract", text: "解压", iconCls: "icon-file-extract", disabled: true });
                    $rightMenu.menu('appendItem', { separator: true });
                    $rightMenu.menu('appendItem', { id: 'rightMenuView', text: '预览', iconCls: 'icon icon-file-view', disabled: true });
                    $rightMenu.menu('appendItem', { id: 'rightMenuTestNew', text: '新窗口测试', iconCls: 'icon icon-file-test', disabled: true });
                } else {
                    $rightMenu.menu('disableItem', '#rightMenuAddFile');
                    $rightMenu.menu('disableItem', '#rightMenuAddDir');
                    $rightMenu.menu('disableItem', '#rightMenuRefactor');
                    $rightMenu.menu('disableItem', '#rightMenuRemove');
                    $rightMenu.menu('disableItem', '#rightMenuView');
                    $rightMenu.menu('disableItem', '#rightMenuTestNew');
                    $rightMenu.menu('disableItem', '#rightMenuUpload');
                    $rightMenu.menu('disableItem', '#rightMenuDownload');
                    $rightMenu.menu('disableItem', '#rightMenuExtract');
                }
                // 针对不同的node点击，使能不同的功能
                if (node.text == '配置信息' || node.text == '执行命令') {

                } else if (node.dir == 1) {
                    if (node.text === "文件系统") {
                        $rightMenu.menu('enableItem', '#rightMenuSvnInfo');
                    }
                    $rightMenu.menu('enableItem', '#rightMenuAddFile');
                    $rightMenu.menu('enableItem', '#rightMenuAddDir');
                    $rightMenu.menu('enableItem', '#rightMenuRefactor');
                    $rightMenu.menu('enableItem', '#rightMenuRemove');
                    $rightMenu.menu('enableItem', '#rightMenuUpload');
                    $rightMenu.menu('enableItem', '#rightMenuDownload');
                } else if (node.dir == 0) {
                    $rightMenu.menu('enableItem', '#rightMenuRefactor');
                    $rightMenu.menu('enableItem', '#rightMenuRemove');
                    $rightMenu.menu('enableItem', '#rightMenuDownload');
                    if (node.text.indexOf('.html') != -1) {
                        $rightMenu.menu('enableItem', '#rightMenuTestNew');
                        $rightMenu.menu('enableItem', '#rightMenuRefactor');
                    } else if (node.text.indexOf('.md') != -1) {
                        $rightMenu.menu('enableItem', '#rightMenuTestNew');
                        $rightMenu.menu('enableItem', '#rightMenuView');
                    } else if (node.text.indexOf(".zip") != -1){
                        $rightMenu.menu('enableItem', '#rightMenuExtract');
                    }
                }
                $rightMenu.menu("show", {
                    left: e.pageX,
                    top: e.pageY
                });
                $(this).tree('select', node.target);
                e.preventDefault();
            }
        });

        $("#divFileTab").tabs({
            onContextMenu: function(e, title, index) {
                var $tabMenu = $("#tabMenu");
                if ($tabMenu.length == 0) {
                    $tabMenu = $('<div id="tabMenu" style="width:120px;"></div>').appendTo("body").menu({
                        onClick: function(item) {
                            var $tabs = $("#divFileTab");
                            var obj = $tabs.tabs('getSelected');
                            var index = $tabs.tabs('getTabIndex', obj);
                            if (item.id == "tabMenuRefresh") {
                                FileSystem.refreshTab(index);
                            } else if (item.id == "tabMenuClose") {
                                FileSystem.closeTab(index);
                            } else if (item.id == "tabMenuCloseAll") {
                                FileSystem.closeAllTab();
                            }
                        }
                    });
                    $tabMenu.menu("appendItem", { id: "tabMenuRefresh", text: "刷新", iconCls: "icon-reload" });
                    $tabMenu.menu('appendItem', { separator: true });
                    $tabMenu.menu('appendItem', { id: "tabMenuClose", text: "关闭", iconCls: "icon-clear" });
                    $tabMenu.menu('appendItem', { id: "tabMenuCloseAll", text: "关闭全部", iconCls: "icon-clear" });
                }
                $tabMenu.menu("show", {
                    left: e.pageX,
                    top: e.pageY
                });
                $("#configTabs-wap").tabs('select', index);
                e.preventDefault();
            },
            onBeforeClose: function(title, index){
                var canClose = FileSystem.canTabClose(index);
                if(!canClose){
                    FileSystem.closeTab(index);
                }
                return canClose;
            }
        });

        function onHandleTab(title, icon, url, options) {
            var $tabs = $("#divFileTab");
            if ($tabs.tabs('getTab', title)) {
                $tabs.tabs('select', title);
            } else {
                $tabs.tabs('add', {
                    title: title,
                    iconCls: 'tree-file ' + icon,
                    content: "<iframe height='100%' width='100%' border ='0' frameBorder='0' scrolling='no' src='{url}' ></iframe>".replace("{url}", url + "&t=" + (+new Date())),
                    selected: true,
                    closable: true,
                    fit: true
                });
            }
        }

        function onHandleTabDelete(title) {
            var $tabs = $("#divFileTab");
            if ($tabs.tabs('getTab', title)) {
                $tabs.tabs("close", title);
            }
        }

        function onHandleFileUpload(path) {
            var $win = $("#winFileUpload"),
                $btn = $("#btnFileUploadSubmit"),
                $file = $("#txtFileUpload"),
                $layout = $("#divFileUpload");
            if ($win.length == 0) {
                $win = $('<div id="winFileUpload" title="文件上传">' +
                    '<div id="divFileUpload">' +
                    '<div data-options="region:\'south\',split:false" style="padding: 2px;height:35px; text-align: center;">' +
                    '<a id="btnFileUploadSubmit" iconCls="icon-ok">确定</a>' +
                    '</div>' +
                    '<div data-options="region:\'center\'" style="padding:5px">' +
                    '<input id="txtFileUpload" type="file" multiple="multiple" name="fileUpload" />' +
                    '<div id="divFileUploadQueue" style="min-height: 230px; border: solid black 1px; margin-top: 3px;"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');
                $win.append("body");
                $win.window({
                    width: 600,
                    height: 350,
                    modal: true,
                    closed: true
                });
                $layout = $("#divFileUpload");
                $layout.layout({
                    fit: true
                });
                $btn = $("#btnFileUploadSubmit").linkbutton({

                }).click(function(e) {
                    $win.window("close");
                    onHandleTree();
                    e.preventDefault();
                });
                $file = $("#txtFileUpload").uploadifive({
                    'auto': true,
                    'buttonText': "选择文件",
                    "queueID": "divFileUploadQueue",
                    "uploadScript": "file/upload?path=" + encodeURIComponent(path)
                });
            } else {
                $file.uploadifive({
                    'auto': true,
                    'buttonText': "选择文件",
                    "queueID": "divFileUploadQueue",
                    "uploadScript": "file/upload?path=" + encodeURIComponent(path)
                });
            }
            $win.window("setTitle", ["文件上传【", path, "】"].join(""));
            $win.window("open");
        }

        function onHandleFileExtract(path) {
            $.ajax({
                url: "file/extract",
                dataType: "json",
                data: { path: path },
                timeout: 300000,
                success: function(result) {
                    if (result && result.code == 1) {
                        onHandleTree();
                    } else if(result && result.message){
                        top.$.messager.alert("提示", result.message);
                    }
                    else {
                        top.$.messager.alert("提示", "操作失败！");
                    }
                }
            });
        }

        onHandleTree();
    });



    (function(w) {
        w.FileSystem = {
            /**
             * 获取tab状态，true表示修改状态，false表示未修改
             */
            getTabStatus: function(title){
                var frame = this.getTabFrame(title),
                    editor;
                if(frame){
                    editor = frame.contentWindow.editor;
                    return editor && editor.isChanged;
                }
                return false;
            },
            getTabFrame: function(title){
                var tab = this.getTab(title);
                var iframe = tab.find("iframe");
                if(iframe && iframe.length > 0){
                    return iframe.get(0);
                }
                return null;
            },
            getTab: function(title){
                var $tabs = $("#divFileTab");
                var index = title, tab;
                if (!title) {
                    return $tabs.tabs("getSelected");
                }
                if(isNaN(title)){
                    tab = $tabs.tabs("getTab", index);
                    if(tab && tab.length > 0){
                        return tab;
                    }
                    index = title + " *";
                }
                return $tabs.tabs("getTab", index);
            },
            setTabStatus: function(title, isChanged){
                var tabs = $("#divFileTab");
                var tab = this.getTab(title);
                var index = tabs.tabs("getTabIndex", tab);
                var options = tab.panel("options");
                if(options){
                    var newTitle = options.title;
                    newTitle = !!isChanged ? (newTitle + " *") : newTitle;
                    tabs.find(".tabs-title").eq(index).html(newTitle);
                }
            },
            refreshTab: function(title) {
                var frame = this.getTabFrame(title);
                var editor = null;
                if(frame){
                    if(this.getTabStatus(title)){
                        $.messager.confirm("确认", "当前文档未保存，你确定要刷新？", function(r){
                            if(r){
                                frame.contentWindow.location.reload(true);
                            }
                        });
                    }
                    else{
                        frame.contentWindow.location.reload(true);
                    }
                }
            },
            addTab: function(title, icon, url, options) {
                var $tabs = $("#divFileTab");
                var op = options || {};
                var tab = this.getTab(title);
                if (tab && tab.length > 0) {
                    $tabs.tabs('select', $tabs.tabs("getTabIndex", tab));
                    if (op.refresh) {
                        this.refreshTab(title);
                    }
                } else {
                    $tabs.tabs('add', {
                        title: title,
                        oldTitle: title,
                        iconCls: 'tree-file ' + icon,
                        content: "<iframe height='98%' width='100%' border ='0' frameBorder='0' scrolling='{scroll}' src='{url}' ></iframe>".replace("{url}", url).replace("{scroll}", op.scroll ? "yes" : "no"),
                        selected: true,
                        closable: true,
                        fit: true
                    });
                }
            },
            forceClose: false,
            canTabClose: function(title){
                return this.forceClose || !this.getTabStatus(title);
            },
            closeTab: function(title) {
                var $tabs = $("#divFileTab");
                var tab = this.getTab(title);
                var index = $tabs.tabs("getTabIndex", tab);
                var me = this;
                if(!this.canTabClose(index)){
                    $.messager.confirm("确认", "当前文档未保存，你确定要关闭？", function(r){
                        if(r){
                            me.forceClose = true;
                            $tabs.tabs("close", index);
                            me.forceClose = false;
                        }
                    });
                }
                else{
                    $tabs.tabs("close", index);
                }
            },
            closeAllTab: function() {
                var $tabs = $("#divFileTab");
                var tabs = $tabs.tabs("tabs");
                var notClosedCount = 0;
                for (var i = tabs.length - 1; i >= 0; i--) {
                    if(this.getTabStatus(i)){
                        notClosedCount ++;
                    }
                    else{
                        $tabs.tabs("close", i);
                    }
                }
                if(notClosedCount){
                    $.messager.alert("警告", "由于文档未保存，还有" + notClosedCount + "个窗口未关闭！");
                }
            }
        };
        window.onbeforeunload = function(){
            var $tabs = $("#divFileTab");
            var tabs = $tabs.tabs("tabs");
            var notClosedCount = 0;
            for (var i = tabs.length - 1; i >= 0; i--) {
                if(FileSystem.getTabStatus(i)){
                    notClosedCount ++;
                }
            }
            if(notClosedCount){
                return false;
            }
        }
    })(window);