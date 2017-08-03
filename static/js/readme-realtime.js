$(function () {
    marked.setOptions($.extend(true, {
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    }, window.nfile.marked));


    var $cotent = $(".readme-body");
    var renderer = new marked.Renderer();
    renderer.table = function (header, body) {
        return '<table class="table table-striped">' + header + body + '</table>'
    };
    $cotent.on("click", function(e){
        e.preventDefault();
        e.stopPropagation();    
    });

    window.setValue = function (value) {
        try {
            var value = marked(value, {
                renderer: renderer
            });
            $cotent.html(value);
        }
        catch (e) {
            $cotent.html("<p>解释失败！</p>");
        }
    }
});