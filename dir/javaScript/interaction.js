/**
 *
 */

/** */
window.thillyInteraction = {};
 
/** */
(function(debug){

	/** */
	var mouseObj = {
		x: 0,
		y: 0,
		wasClick: false,
		down: false
	};

	/** */
	var bodyArray = [];
	
	/** */
	var articleTimeout = true;
	
	/** */
	var leftBar = document.getElementById('leftBar');
	
	/** */
	var content = document.getElementById('content');
	
	/** */
	var stickyBar = document.getElementById('navBar');		

	/** */
	this.addArticle = function(title, img, contents){
		if(debug.trace)
			console.log('in addArticle: ' + title);
		var bottomSpacer = leftBar.removeChild(document.getElementById('bottomSpacer'));
		leftBar.appendChild(newBox(bodyArray.length, title, img));
		leftBar.appendChild(bottomSpacer);
		content.appendChild(newArticle(bodyArray.length, title, contents));
		reScale();
	};
	
	/** */
	function init(){
		if(debug.trace)
			console.log('in init IIFE');
			
		leftBar.appendChild(newSpacer('topSpacer'));//allow for extra space on top and bottom
		leftBar.appendChild(newSpacer('bottomSpacer'));

		leftBar.onmousedown = function(event){
			if(debug.trace)
				console.log('in leftBar.onmousedown');
			mouseObj.wasClick = true;
			mouseObj.down = true;
			mouseObj.x = event.x;
			mouseObj.y = event.y;
			
			setTimeout(function(){
				mouseObj.wasClick = false;
			}, 200);
			
			window.onmousemove = function(event){
				if(debug.trace)
					console.log('in window.onmousemove');
				var scrollDist = event.y - mouseObj.y;
				mouseObj.y = event.y;
				mouseObj.x = event.x;
				normalizeArticlesToMiniMap(leftBar.scrollTop - scrollDist);
			}
			
			window.onmouseup = function(){//only use the mouse events for their duration
				if(debug.trace)
					console.log('in window.onmouseup');
				window.onmousemove = null;
				window.onmouseup = null;
				mouseObj.down = false;
			};
			
			return false;
		};
		
		window.onscroll = function(){
			if(debug.trace)
				console.log('in window.onscroll');
			normalizeMiniMapToArticles();
			checkSticky();
		};
		
		window.onresize = reScale;
	}
	
	/** */
	function newSpacer(newID){
		if(debug.trace)
			console.log('in newSpacer: ' + newID);
		var aSpacer = document.createElement('div');
		aSpacer.className = 'spacer';	
		aSpacer.id = newID;
		if(newID == 'bottomSpacer')
			aSpacer.appendChild(newBox('Bottom', 'Click to add more articles'));
			
		return aSpacer;
	}	
	
	/** */
	function newBox(boxIndex, title, img){
		if(debug.trace)
			console.log('in newBox: ' + title);
		var aBox = document.createElement('div');
		aBox.className = 'aBox';
		aBox.id = 'aBox' + boxIndex;
		aBox.title = title;
		aBox.style.backgroundImage = img;
		aBox.innerHTML = title;
		aBox.onclick = function(){
			if(debug.trace)
				console.log('in aBox.onclick');
			if(mouseObj.wasClick)
			{
				if(this.id.indexOf('Bottom') < 0)
				{
					scrollToArticle(this.id);
					leftBar.scrollTop = this.offsetTop - window.innerHeight/2;
				}
				else{
					thillyUtil.getMoreArticles(5);
				}
			}
		};
		return aBox;
	}

	/** */
	function newArticle(articleNum, title, contents){
		if(debug.trace)
			console.log('in newArticle: ' + title);
		var aBox;
		if(typeof(contents) == 'object')
			aBox = contents;
		else
		{
			aBox = document.createElement('div');
			aBox.innerHTML = contents;
		}
			
		aBox.className = 'article';
		aBox.id = 'article' + articleNum;
		
		return aBox;
	}

	/** */
	function scrollToArticle(articleID){
		if(debug.trace)
			console.log('in scrollToArticle: ' + articleID);
		var article = document.getElementById('article' + articleID.replace('aBox', ''));
		window.scrollTo(0, article.offsetTop-100);
		if(debug.movement)
			console.log(window.scrollY);
	}

	/** */
	function checkSticky(){
		if(debug.trace)
			console.log('in checkSticky');
		if(window.pageYOffset >= document.getElementsByClassName('pageTopper')[0].offsetHeight)
			stickyBar.className = 'navBar Stuck';
		else
			stickyBar.className = 'navBar';
	}

	/** */
	function normalizeArticlesToMiniMap(mapDist){
		if(debug.trace)
			console.log('in normalizeArticlesToMiniMap: ' + mapDist);
		leftBar.scrollTop = mapDist;
		var aBoxHeight = document.getElementById('aBoxBottom');
		aBoxHeight = aBoxHeight.offsetHeight + getStyle(aBoxHeight, 'margin-bottom');
		var articleNumber = Math.floor(leftBar.scrollTop/aBoxHeight);
		console.log(articleNumber);
		var percentThrough = (leftBar.scrollTop%aBoxHeight)/100;
		var articleToRead = document.getElementById('article' + articleNumber);
		if(articleToRead)
		{
			var articlePercent = (articleToRead.offsetHeight * percentThrough);
			window.scrollTo(0, articleToRead.offsetTop + articlePercent - 300);
			if(debug.movement)
				console.log(articleToRead.offsetTop + articlePercent - 300);
		}
		else if(articleTimeout)
		{
			articleTimeout = false;
			thillyUtil.getMoreArticles(5, function(){
				setTimeout(function(){articleTimeout=true;},500);
			});
		}
	}

	/** */
	function normalizeMiniMapToArticles(){
		if(debug.trace)
			console.log('in normalizeMiniMapToArticles');
		var topPadding = getStyle(content, 'padding-top') + 1000;//before articles even start (0)
		var scrollHeight = window.scrollY + 300;
		var contentMargin = getStyle(document.getElementsByClassName('article')[0], 'margin-bottom');
		if(!mouseObj.down && (scrollHeight > topPadding))
		{
			scrollHeight -= topPadding;
			var elem;
			for(elem = 0; scrollHeight > (bodyArray[elem] + contentMargin); elem++)
				scrollHeight -= (bodyArray[elem] + contentMargin);
				
			console.log(bodyArray[elem]);
			console.log('reading article: ' + elem);	
			console.log(scrollHeight);
			var mapIcon = document.getElementById('aBox' + elem);
			var percent = (scrollHeight/(bodyArray[elem] + contentMargin)) * 100;
			if(mapIcon)
			{
				leftBar.scrollTop = (mapIcon.offsetTop - window.innerHeight/2) + percent;
				if(debug.movement)
					console.log((mapIcon.offsetTop - window.innerHeight/2) + percent);	
			}
			else
				thillyUtil.getMoreArticles(5);
		}
	}

	/** */
	function getStyle(element, property){
		if(debug.trace)
			console.log('in getStyle: ' + property);
		var style = window.getComputedStyle(element, '').getPropertyValue(property);
		style = style.replace('px','');
		style = parseInt(style);
		return style;
	}
	
	/** */
	function reScale(){
		if(debug.trace)
			console.log('in reScale');
		var articles = document.getElementsByClassName('article');
		for(var i in articles)
			if(i != 'length')
				bodyArray[i] = articles[i].offsetHeight;
	}
	
	init();
	
}).apply(window.thillyInteraction, [window.thillyLogging]);