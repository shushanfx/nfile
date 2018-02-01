(function(w) {
    var d = w.document;

    var throttle = function(fn, delay){
        var timer = null,
            registerTime = 0;
        return function(){
            var context = this, args = arguments;
            if(registerTime > 0){
                return ;
            }
            registerTime = + new Date();
            timer = setTimeout(function(){
                fn.apply(context, args);
                registerTime = 0;
            }, delay);
        };
    };

    function getCookie(name, defaultValue) {
        var value = "; " + d.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
        return defaultValue;
    }

    function setCookie(name, value, expires, domain, path) {
        var arr = [];
        arr.push(name + "=" + value);
        if (expires) {
            var date = new Date();
            date.setTime(date.getTime() + expires);
            arr.push("expires=" + date.toGMTString());
        }
        if (domain) {
            arr.push("domain=" + domain);
        }
        if (path) {
            arr.push("path=" + path)
        } else {
            arr.push("path=/");
        }
        d.cookie = arr.join(";");
    }

    w.Utils = {
        setCookie: setCookie,
        getCookie: getCookie,
        handleResult: function(result, callback) {
            var ret = true;
            if (callback) {
                ret = callback(result);
            }
            if (typeof(ret) === "boolean" && ret === false) {
                return false;
            }
            if (result && result.code == -100) {
                $.messager.alert("提示", result.message || "请先登录！");
            } else if (result && result.code == -1) {
                $.messager.alert("提示", result.message || "操作失败，稍后再试！");
            } else if (result && result.code === -104) {
                $.messager.alert("提示", result.message || "操作失败，无操作权限！");
            } else if (result && result.code !== 1) {
                $.messager.alert("提示", result.message || "操作失败！");
            }
        },
        throttle: throttle
    }
    w.Theme = {
        defaultTheme: {
            "Chrome": "ace/theme/chrome",
            "Dreamweaver": "ace/theme/dreamweaver",
            "Eclipse": "ace/theme/eclipse",
            "GitHub": "ace/theme/github",
            "Chaos": "ace/theme/chaos",
            "Cloud": "ace/theme/clouds",
            "Ambiance": "ace/theme/ambiance",
            "Monokai": "ace/theme/monokai",
            "Twilight": "ace/theme/twilight",
            "Xcode": "ace/theme/xcode",
            "IdleFingers": "ace/theme/idle_fingers",
            "Terminal": "ace/theme/terminal",
            "Tomorrow": "ace/theme/tomorrow",
            "TomorrowNight": "ace/theme/tomorrow_night",
            "TomorrowNightBlue": "ace/theme/tomorrow_night_blue",
            "TomorrowNightBright": "ace/theme/tomorrow_night_bright",
            "TomorrowNightEighties": "ace/theme/tomorrow_night_eighties"
        },
        getCurrentThemeName: function() {
            return getCookie("setting.ace_theme_name", "Eclipse");
        },
        getCurrentTheme: function() {
            return this.defaultTheme[this.getCurrentThemeName()];
        },
        getNextTheme: function() {
            var name = this.getCurrentThemeName(),
                isFind = false,
                newName = "",
                iCount = 0;
            for (var key in this.defaultTheme) {
                iCount++;
                if (iCount == 1) {
                    newName = key;
                }
                if (isFind) {
                    newName = key;
                    break;
                }
                if (key == name) {
                    isFind = true;
                }
            }
            setCookie("setting.ace_theme_name", newName);
            return this.defaultTheme[newName];
        }
    }

})(window);