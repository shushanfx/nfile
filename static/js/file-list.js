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


$(function(){
	var backToTopTimer = null;
	var elTop = document.querySelector("#back-to-top");
	var isElShow = false;
	function checkScroll(isFirst){
		var top = getScrollY();
		if(top > 200){
			elTop && (elTop.className = "back-top-show") ;  
			isElShow = true;
		}
		else{
			if(isElShow){
				elTop && (elTop.className = "back-top-hide"); 
				isElShow = false;
			}
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
	window.addEventListener("scroll", throttle(function(){
		checkScroll();
	}, 10), false);
	checkScroll(true);
});

$(function(){
	// aside 吸顶
	var $el = document.getElementById("asideRight");
	var offsetTop = 0;
	var isFixed = false;
	var getOffsetTopByBody = function (el) {
		let offsetTop = 0
		while (el && el.tagName !== 'BODY') {
		  offsetTop += el.offsetTop
		  el = el.offsetParent
		}
		return offsetTop
	}
	var checkScroll = function () {
		var top = getScrollY();
		if (isFixed) {
			if(top <= offsetTop - 10) {
				$el.style.position = '';
				$el.style.top = '';
				$el.style.left = '';
				$el.style.width = '';
				isFixed = false;
			}
		}
		else{
			var rect = $el.getBoundingClientRect();
			if(rect.top <= 10){
				isFixed = true;		
				offsetTop = getOffsetTopByBody($el);	

				$el.style.position = 'fixed';
				$el.style.top = '10px';
				$el.style.left = rect.left + 'px';
				$el.style.width = rect.width + 'px';
			}
		}
	}
	window.addEventListener("scroll", throttle(function(){
		checkScroll();
	}, 10), false);
	checkScroll();
});