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
			if (node.dir == 0) {
				var url = 'file/view/' + node.href.replace(/\\/gi, "/");
				if (node.href.indexOf(".ppt") !== -1 ||
					node.href.indexOf("pptx") !== -1 ||
					node.href.indexOf("doc") !== -1 ||
					node.href.indexOf("xls") !== -1 ||
					node.href.indexOf("xlsx") !== -1 ||
					node.href.indexOf("pdf") !== -1 ||
					node.href.indexOf("docx") !== -1) {
					window.open('file/view/' + node.href.replace(/\\/gi, "/"));
					return true;
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
						if (item.id == 'rightMenuView') {
							FileSystem.addTab(node.text, '', 'file/view/' + node.href.replace(/\\/gi, "/"), {
								refresh: true,
								scroll: true
							});
						} else if (item.id == 'rightMenuTestNew') {
							window.open('file/view/' + node.href.replace(/\\/gi, "/"));
						} else if (item.id === "rightMenuDownload") {
							window.open("file/download?path=" + encodeURIComponent(node.href));
						}
					}
				});
				// 右击菜单第一次点击
				$rightMenu.menu('appendItem', { id: "rightMenuDownload", text: "下载", iconCls: "icon-file-download", disabled: true });
				$rightMenu.menu('appendItem', { id: 'rightMenuView', text: '预览', iconCls: 'icon icon-file-view', disabled: true });
				$rightMenu.menu('appendItem', { id: 'rightMenuTestNew', text: '新窗口测试', iconCls: 'icon icon-file-test', disabled: true });
			} else {
				$rightMenu.menu('disableItem', '#rightMenuView');
				$rightMenu.menu('disableItem', '#rightMenuTestNew');
				$rightMenu.menu('disableItem', '#rightMenuDownload');
			}
			// 针对不同的node点击，使能不同的功能
			if (node.dir == 1) {
				$rightMenu.menu('enableItem', '#rightMenuDownload');
			} else if (node.dir == 0) {
				$rightMenu.menu('enableItem', '#rightMenuDownload');
				if (node.text.indexOf('.html') != -1 
					|| node.text.indexOf('.md') != -1) {
					$rightMenu.menu('enableItem', '#rightMenuTestNew');
					$rightMenu.menu('enableItem', '#rightMenuView');
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
							var tab = $tabs.tabs("getTab", index);
							var frame = tab.find("iframe");
							if (frame && frame.length > 0) {
								frame.get(0).contentWindow.location.reload(true);
							}
						} else if (item.id == "tabMenuClose") {
							$tabs.tabs("close", index);
						} else if (item.id == "tabMenuCloseAll") {
							var tabs = $tabs.tabs("tabs");
							for (var i = tabs.length - 1; i >= 0; i--) {
								$tabs.tabs("close", i);
							}
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
		}
	});

	function onHandleTab(title, icon, url, options) {
		var $tabs = $("#divFileTab");
		var _url = url;
		if(typeof _url === "string"){
			if(_url.indexOf("?") === -1){
				_url += "?";
			}
			else{
				_url += "&";
			}
			_url += ("t=" + (+new Date()));
		}
		if ($tabs.tabs('getTab', title)) {
			$tabs.tabs('select', title);
		} else {
			$tabs.tabs('add', {
				title: title,
				iconCls: 'tree-file ' + icon,
				content: "<iframe height='98%' width='100%' border ='0' frameBorder='0' scrolling='yes' src='{url}' ></iframe>".replace("{url}", _url),
				selected: true,
				closable: true,
				fit: true
			});
		}
	}
	onHandleTree();
});



(function(w) {
	w.FileSystem = {
		refreshTab: function(title) {
			var $tabs = $("#divFileTab");
			var index = title;
			if (!title) {
				index = $tabs.tabs("getSelected");
			}
			var tab = $tabs.tabs("getTab", index);
			var frame = tab.find("iframe");
			if (frame && frame.length > 0) {
				frame.get(0).contentWindow.location.reload(true);
			}
		},
		addTab: function(title, icon, url, options) {
			var $tabs = $("#divFileTab");
			var op = options || {};
			if ($tabs.tabs('getTab', title)) {
				$tabs.tabs('select', title);
				if (op.refresh) {
					this.refreshTab(title);
				}
			} else {
				$tabs.tabs('add', {
					title: title,
					iconCls: 'tree-file ' + icon,
					content: "<iframe height='100%' width='100%' border ='0' frameBorder='0' scrolling='{scroll}' src='{url}' ></iframe>".replace("{url}", url).replace("{scroll}", op.scroll ? "yes" : "no"),
					selected: true,
					closable: true,
					fit: true
				});
			}
		},
		closeTab: function(title) {
			var $tabs = $("#divFileTab");
			var index = title,
				obj;
			if (!title) {
				obj = $tabs.tabs('getSelected');
				index = $tabs.tabs('getTabIndex', obj);
			}
			$tabs.tabs("close", index);
		},
		closeAllTab: function() {
			var $tabs = $("#divFileTab");
			var tabs = $tabs.tabs("tabs");
			for (var i = tabs.length - 1; i >= 0; i--) {
				$tabs.tabs("close", i);
			}
		}
	}
})(window);