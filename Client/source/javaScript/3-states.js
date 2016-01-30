/** State module for client
 *	the transitional stuff between states home -> template, template -> bio, loggedOut -> loggedIn, etc.
 */
 
/** Worked*/ 
window.thillyState = {};

/** */
(function(debug){
	
	/** */
	var state = 'home';
	
	/** */
	var loggedFlag = false;
	
	/** */
	var stateMap = {
		home 		: generalState,		//thilly.net
		template	: templateState,	//template button clicked
		bio			: generalState,		//about button clicked
		challenge	: challengeState,	//challenge button clicked
		games		: gameState,		//game button clicked
		neural		: neuralState		//neuralNet button clicked
	};
	
	/** */
	this.leaveState = function(){};
	
	/** */
	this.checkLogged = function(){
		return loggedFlag;
	}
	
	/** */
	this.checkState = function(){
		if(debug.trace)
			debug.log('in checkState: ' + state);
		return state;
	};
	
	/** */
	this.switchState = function(toState, requestObj){
		if(debug.trace)
			debug.log('in switchState: ' + toState);
		if(typeof(stateMap[toState]) == 'function')
		{
			if(typeof this.leaveState == 'function')
				this.leaveState();
			this.leaveState = function(){};
			
			while(thillyInteraction.popArticles()){};
			document.getElementById('topContent').innerHTML = '';
			articleCount = 0;
			state = toState;
			stateMap[toState](state, requestObj, function(){logged();});
			thillyIndex.toTop = true;
				
				var hash = '';
				var query = thillyState.checkState();
				window.history.pushState({'thillyLink':'aLinkToThilly.net'},'thillyURL', '#' + hash + '?' + query);
				window.location.thillyHistory = (++window.location.thillyHistory) || 1;
				if(debug.history)
					debug.log('trying to update history: ' + query);
			
			var bottomBox = document.getElementById('aBoxBottom');
				bottomBox.innerHTML = bottomBox.title = 'Click to add more articles';
		}
		else	
			if(debug.error)
				debug.log('unknown state in switch state: ' + toState);
	};

	/** */
	this.loggedIn = function(boolLogged, callBack){
		if(debug.trace)
			debug.log('in loggedIn: ' + boolLogged);
		loggedFlag = (typeof boolLogged != 'undefined')?boolLogged:loggedFlag;
		logged(loggedFlag, callBack);
		thillyInteraction.reScale();
	}

	/** */
	this.getPages = function(data, socket){
		if(debug.trace)
			debug.log('in getPages: ' + data);
			
		for(var i in data)
		{
			if(document.getElementById('articleContent'+data[i].pageID)){//if came from link and requested more news
				if(debug.trace)
					debug.log('duplicate article found and not placed');
			}
			else{
				thillyInteraction.addArticle(data[i]);
				thillyIndex.articleList.push(data[i].pageID);
			}
		}
		if(data.length == 0)
		{
			var bottomBox = document.getElementById('aBoxBottom');
			bottomBox.innerHTML = bottomBox.title = 'No older articles';
			return;
		}
		if(thillyIndex.toTop){
			thillyIndex.toTop = false;
			thillyInteraction.toTop();
		}
	}	
	
	/** */
	function logged(){//if logging in (out->in), select out and make them in
		if(debug.trace)
			debug.log('in logged');
		
		var from = (loggedFlag)?'loggedOut':'loggedIn';
		var to = (loggedFlag)?'loggedIn':'loggedOut';
			
		thillyUtil.replaceClasses(from, to);	
	}

	/** */
	function generalState(toPage, requestObj, callBack){
		if(debug.trace)
			debug.log('in generalState: ' + toPage);
		if(window.location.hash)
		{
			window.history.pushState({'thillyLink':'aLinkToThilly.net'}, document.title, window.location.pathname);
			window.location.thillyHistory++;
		}
		var defaultObj = {
			article: articleCount,
			state: toPage
		};
		thillyUtil.sendReceive(thillyIndex.mainSocket,'getPages', (requestObj || defaultObj), thillyState.getPages);
		callBack();	
	}

	function challengeState(toPage, requestObj, callBack){
		if(debug.trace)
			debug.log('in challengeState');
		generalState(toPage, requestObj, thillyChallenge.init);
		callBack();
	}
	
	/** */
	function templateState(toPage, requestObj, callBack){
		if(debug.trace)
			debug.log('in templateState');
			 
		thillyUtil.sendReceive(thillyIndex.mainSocket,'getTemplate', {}, function(data){
			thillyInteraction.addArticle(data[1]);
			thillyInteraction.addArticle(data[0]);
			articleCount = 0;
			thillyTemplate.init();
			thillyInteraction.toTop();
			callBack();
		});
	}
	
	/** */
	function neuralState(toPage, requestObj, callBack){
		if(debug.trace)
			debug.log('in neuralState');
		
		generalState(toPage, requestObj, thillyNeural.init);
		callBack();		
	}
	
	function gameState(toPage, requestObj, callBack){
		if(debug.trace)
			debug.log('in gameState');
		generalState(toPage, requestObj, thillyGame.init);
		callBack();
	}



}).apply(window.thillyState,[window.thillyLogging]);