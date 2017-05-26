$(function(){
	var backToTopTimer = null;
	var elTop = document.querySelector("#back-to-top");
	function getScrollY(){
        var scrollTop=0;
        if(window.scrollY > 0){
            scrollTop = window.scrollY;
        }
        if(document.documentElement && document.documentElement.scrollTop){
            scrollTop= document.documentElement.scrollTop;
        }
        else if(document.body) {
            scrollTop= document.body.scrollTop;
        }
        return scrollTop;
    }
	function checkScroll(){
		var top = getScrollY();
		if(top > 100){
			elTop && (elTop.className = "back-top-show") ;  
		}
		else{
			elTop && (elTop.className = "back-top-hide"); 
		}
	}
	elTop.addEventListener("click", function(){
		var totalTop = getScrollY(); // 获取总共滚动的距离。
		var step = 100, leftY = totalTop; // 每个定时器期间移动距离，以及剩余距离
		if(backToTopTimer){
			clearInterval(backToTopTimer);
			backToTopTimer = null;
		}
		backToTopTimer = setInterval(function(){
			step = Math.ceil(leftY / 5);
			leftY -= step;
			if(leftY <= 0){
				// 关闭定时器
				clearInterval(backToTopTimer);
				window.scrollTo(0, 0);
				backToTopTimer = null;
			}
			window.scrollTo(0, leftY);
		}, 10);
	}, false);
	window.addEventListener("scroll", function(){
		checkScroll();
	}, false);
	checkScroll();
});