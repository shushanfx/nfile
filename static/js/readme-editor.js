$(function(){
    var $iframe = $("#editViewer");
    var pos = {
        down: false,
        x: 0,
        y: 0,
        left: 0,
        top: 0
    };
    var postObject = {
        canPost : false,
        lastPostTime : 0,
        postDelay: 1000
    }
    var $float = $(".float-frame");
    $iframe.attr("src", "/file/view/" + editor.path.replace(/\\/gi, "/") + "?realtime=1");
    $iframe.on("load", function(){
        $iframe.css("display", "");
        postObject.canPost = true;
    })

    function now(){
        return Date.now ? Date.now() : (+ new Date());
    }
    function postMessage(message){    
        if(typeof message === "string"){
            postObject.message = message;
        }
        if(!postObject.canPost){
            return ;
        }
        var time = now();
        if(postObject.timer){
            clearTimeout(postObject.timer);
            postObject.timer = null;
        }
        if(time - postObject.lastPostTime <= postObject.postDelay){
            postObject.timer = setTimeout(function(){
                postMessage();
            }, postObject.postDelay);
            return ;
        }

        if($iframe && $iframe.length > 0){
            var content = $iframe[0].contentWindow;
            if(content && content.setValue){
                content.setValue(postObject.message);
            }
            else{
                window.postMessage(postObject.message, "*");
            }
            postObject.lastPostTime = now();
        }
    }
    editor.getSession().on("change", function(obj){
        var value = editor.getSession().getValue();
        postMessage(value);
    });
    $(".float-frame-title").on("mousedown", function(e){
        pos.down = true;
        pos.x = e.clientX;
        pos.y = e.clientY;
        pos.top = $float.offset().top;
        pos.left = $float.offset().left;
    }).on("mouseup", function(){
        pos.down = false;
    }).on("mousemove", function(e){
        if(pos.down){
            $float.css({
                top: (pos.top + e.clientY - pos.y) + "px",
                left: (pos.left + e.clientX - pos.x) + "px"
            });
        }
    });
    
});