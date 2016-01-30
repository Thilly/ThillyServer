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
	var leftBar = document.getElementById('leftBar');
	
	/** */
	var content = document.getElementById('content');
	
	/** */
	var stickyBar = document.getElementById('navBar');

	/** */
	this.addArticle = function(data){
		if(debug.trace)
			 debug.log('in addArticle: ' + data.tabs[0].title);
		var bottomSpacer = leftBar.removeChild(document.getElementById('bottomSpacer'));
		leftBar.appendChild(newBox(bodyArray.length, data.tabs[0].title, data.thumb));
		leftBar.appendChild(bottomSpacer);
		content.appendChild(new newArticle(bodyArray.length, data));
		reScale();
	};
		
	/** */
	this.popArticles = function(){

		var buttons = leftBar.children;
		var articles = content.children;
		
		if(articles.length > 0)
		{
			content.removeChild(articles[0]);
			leftBar.removeChild(buttons[2]);
			reScale();
			thillyIndex.articleList.shift();
			return true;
		}
		return false;
			
		
	}
	
	/** */
	this.reScale = reScale;
	
	/** */
	this.toTop = function(){scrollToArticle('aBox0');};
	
	/** */
	this.init = function(){
		stickyBar = document.getElementById('navBar');
		leftBar = document.getElementById('leftBar');
		content = document.getElementById('content');
		
		if(debug.trace)
			 debug.log('in init');
			
		leftBar.appendChild(newSpacer('topSpacer'));//allow for extra space on top and bottom
		leftBar.appendChild(newSpacer('bottomSpacer'));

		leftBar.onmousedown = function(event){
			if(debug.trace)
				 debug.log('in leftBar.onmousedown');
			mouseObj.wasClick = true;
			mouseObj.down = true;
			mouseObj.x = event.clientX;
			mouseObj.y = event.clientY;
			
			setTimeout(function(){
				mouseObj.wasClick = false;
			}, 200);
			
			window.onmousemove = function(event){
				if(debug.trace)
					 debug.log('in window.onmousemove' + event.clientX + ':' + event.clientY);
				var scrollDist = event.clientY  - mouseObj.y;
				mouseObj.y = event.clientY;
				mouseObj.x = event.clientX;
				normalizeArticlesToMiniMap(leftBar.scrollTop - scrollDist);
			}
			
			window.onmouseup = function(){//only use the mouse events for their duration
				if(debug.trace)
					 debug.log('in window.onmouseup');
				window.onmousemove = null;
				window.onmouseup = null;
				mouseObj.down = false;
			};
			
			return false;
		};
		
		window.onscroll = function(){
			if(debug.trace)
				 debug.log('in window.onscroll');
			if(document.getElementById('content').children.length > 0)
				normalizeMiniMapToArticles();
			checkSticky();
		};
		
		window.onpopstate = function(event){
			if(debug.trace)
				 debug.log('in onpopstate');
			if(window.location.thillyHistory > 0)
				history.go(-window.location.thillyHistory);
		};
		
		window.onresize = reScale;
	}
	
	/** */
	function newSpacer(newID){
		if(debug.trace)
			 debug.log('in newSpacer: ' + newID);
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
			 debug.log('in newBox: ' + title);
		var aBox = document.createElement('div');
		aBox.className = 'aBox';
		aBox.id = 'aBox' + boxIndex;
		aBox.title = title;
		
		if(typeof(img) == 'string'){
			if(img.match(/url\(.*/))
				aBox.style.backgroundImage = img;
			else
				aBox.style.backgroundImage = 'url(/images/' + img + ')';//have default pic eventually
		}
		aBox.innerHTML = title;//remove text title eventually
	
		aBox.onclick = function(){
			if(debug.trace)
				 debug.log('in aBox.onclick');
			if(mouseObj.wasClick)
			{
				if(this.id.indexOf('Bottom') < 0)
				{
					scrollToArticle(this.id);
					leftBar.scrollTop = this.offsetTop - window.innerHeight/2;
				}
				else
				{	
					var useState = thillyState.checkState();
					if(useState == 'template')
						useState = 'home';
						
					var requestObj = {
						article : thillyIndex.articleList,
						state: useState
					};
					if(this.innerHTML != 'No older articles')
						thillyUtil.sendReceive(thillyIndex.mainSocket, 'getPages', requestObj, thillyState.getPages);
				}
			}
		};
		return aBox;
	}

	/** */
	function newArticle(articleNum, data){
		if(debug.trace)
			 debug.log('in newArticle: ' + data.tabs[0].title);
		var anArticle = document.createElement('article');
		var articleContent = document.createElement('div');
		var header = document.createElement('h1');
			header.textContent = data.tabs[0].title;
		articleContent.appendChild(header);
		if(typeof(data.content) == 'object')
			articleContent.innerHTML = data.tabs[0].content.innerHTML;
		else
			articleContent.innerHTML = data.tabs[0].content;
		
		var tabs = document.createElement('div');
			tabs.className = 'tabs';
			tabs.id = 'tabsarticle' + articleNum;
			
		anArticle.className = 'article';
		anArticle.id = 'article' + articleNum;
		anArticle.setAttribute('state', data.category || 'home');
		articleContent.className = 'articleContent';
		articleContent.id = 'articleContent' + data.pageID;
		
		var toolBox = document.createElement('div');
			toolBox.className = 'articleTools';
			toolBox.id = 'articleTools' + data.pageID;
		
/*		var toolWrapper = document.createElement('div');
			toolWrapper.className = 'toolWrapper';
			toolWrapper.appendChild(toolBox);
			
	//	how can I keep the tabs attached to green 
	//	while still allowing the comment tools at bottom of page
	//	while still growing the page from the bottom
*/		
		if(data.pageID){
			anArticle.setAttribute('pageID', data.pageID);
			toolBox.appendChild(new thillyComments.commentBox(data.pageID, data.points));//see comments
		}
		
		anArticle.appendChild(tabs);
		anArticle.appendChild(articleContent);
		anArticle.appendChild(toolBox);
		
		for(var i = 0; i < data.tabs.length; i++){
			(function(content, title, func){
				if(func)
					func = eval('false || ' + func);
				addTab(tabs, title, function(){
					articleContent.innerHTML = content;
					if(typeof(func) == 'function')
						func();
					tabs.parentNode.style.minHeight = (tabs.offsetWidth) + 'px';
				});
			})(data.tabs[i].content, data.tabs[i].title, data.tabs[i].functionCall);
		}
		return anArticle;
	}

	/** */
	function addTab(tabWrapper, tabText, func){
		if(debug.trace)
			 debug.log('in addTab: ' + tabText);
		var aTab = document.createElement('span');
		if(tabWrapper.childNodes.length == 0)
			aTab.className = 'tab selected';
		else
			aTab.className = 'tab';
			aTab.innerHTML = tabText;
			aTab.onclick = function(){
				if(this.className == 'tab selected')
					return;
				this.parentNode.querySelector('.tab.selected').className = 'tab';
				this.className = 'tab selected';
				func();
				thillyState.loggedIn();
			};
		tabWrapper.appendChild(aTab);
	}	
	
	/** */
	function scrollToArticle(articleID){
		if(debug.trace)
			 debug.log('in scrollToArticle: ' + articleID);
		var article = document.getElementById('article' + articleID.replace('aBox', ''));
		window.scrollTo(0, article.offsetTop-100);
		if(debug.movement)
			 debug.log(window.pageYOffset);
	}

	/** */
	function checkSticky(){
		if(debug.trace)
			 debug.log('in checkSticky');
		var maxHeight = document.getElementsByClassName('pageTopper')[0].offsetHeight - 32;
		if(window.pageYOffset >= maxHeight)
		{
			stickyBar.className = 'navBar stuck';
		}
		else
			stickyBar.className = 'navBar';
	}

	/** */
	function normalizeArticlesToMiniMap(mapDist){
		if(debug.trace)
			debug.log('in normalizeArticlesToMiniMap: ' + mapDist);
		leftBar.scrollTop = mapDist;
		var aBoxHeight = document.getElementById('aBoxBottom');
		aBoxHeight = aBoxHeight.offsetHeight + getStyle(aBoxHeight, 'margin-bottom');
		var articleNumber = Math.floor(leftBar.scrollTop/aBoxHeight);
		debug.log(articleNumber);
		if(articleNumber < bodyArray.length)
			updateLink(articleNumber);
		var percentThrough = (leftBar.scrollTop%aBoxHeight)/100;
		var articleToRead = document.getElementById('article' + articleNumber);
		if(articleToRead)
		{
			var articlePercent = (articleToRead.offsetHeight * percentThrough);
			window.scrollTo(0, articleToRead.offsetTop + articlePercent - 300);
			if(debug.movement)
				 debug.log(articleToRead.offsetTop + articlePercent - 300);
		}
	}

	/** */
	function normalizeMiniMapToArticles(){
		if(debug.trace)
			 debug.log('in normalizeMiniMapToArticles');
		var topPadding = getStyle(content, 'padding-top') + 1000;//before articles even start (0)
		var scrollHeight = window.pageYOffset + 300;
		var contentMargin = getStyle(document.getElementsByClassName('article')[0], 'margin-bottom');
		if(!mouseObj.down && (scrollHeight > topPadding))
		{
			scrollHeight -= topPadding;
			var elem;
			for(elem = 0; scrollHeight > (bodyArray[elem] + contentMargin); elem++)
				scrollHeight -= (bodyArray[elem] + contentMargin);
			if(debug.movement){	
				 debug.log(bodyArray[elem]);
				 debug.log('reading article: ' + elem);
				 debug.log(scrollHeight);
			}
			if(elem < bodyArray.length){
				updateLink(elem);
				var mapIcon = document.getElementById('aBox' + elem);
				var percent = (scrollHeight/(bodyArray[elem] + contentMargin)) * 100;
				leftBar.scrollTop = (mapIcon.offsetTop - window.innerHeight/2) + percent;
				if(debug.movement)
					debug.log((mapIcon.offsetTop - window.innerHeight/2) + percent);	
			}
		}
	}
	
	/** */
	function updateLink(articleNum){
		if(debug.trace)
			 debug.log('in updateLink');
		var article = document.getElementById('article' + articleNum)
		
		if(article.hasAttribute('pageID'))
		{
			var hash = article.getAttribute('pageID');
			var query = article.getAttribute('state') || thillyState.checkState();
			if(window.location.hash)
				window.history.replaceState({'thillyLink':'aLinkToThilly.net'},'thillyURL', '#' + hash + '?' + query);
			else
				window.history.pushState({'thillyLink':'aLinkToThilly.net'},'thillyURL', '#' + hash + '?' + query);
			window.location.thillyHistory = (window.location.thillyHistory++) || 1;
			if(debug.history)
				 debug.log('trying to update history: ' + hash);
		}
	}
	
	/** */
	function getStyle(element, property){
		if(debug.trace)
			 debug.log('in getStyle: ' + property);
		var style = window.getComputedStyle(element, '');
		style = style.getPropertyValue(property);
		style = style.replace('px','');
		style = parseInt(style);
		return style;
	}
	
	/** */
	function reScale(){
		if(debug.trace)
			 debug.log('in reScale');
		var articles = document.getElementsByClassName('article');
		var memDiv = document.getElementById('memDiv');
		if(memDiv)
			memDiv.width = document.getElementById('articleContent00000001template').offsetWidth;
				
		while(bodyArray.length)
			bodyArray.pop();
			
		for(var i = 0; i < articles.length; i++)
			if(typeof(articles[i]) == 'object')
				bodyArray.push(articles[i].offsetHeight);
	}
	
}).apply(window.thillyInteraction, [window.thillyLogging]);