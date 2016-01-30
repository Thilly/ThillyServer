/**
 *
 */
/** */
window.thillyIndex = {}; 

/** */
(function(debug){ 
 
	/** */
	this.mainSocket = {};

	/** */
	this.user = {};

	/** */
	this.browser = {};

	/** */
	this.toTop = false;

	/** */
	this.articleList = [];
	
	/** */
	window.onload = init;

	/** */
	this.goToState = function(element, requestObj){
		if(debug.trace)
			debug.log('in goToState');
			
		var link = element.getAttribute('data-link');
		thillyState.switchState(link, requestObj);
		breadCrumb(element);
	}

	
	/** */
	function init(){
		if(debug.trace)
			debug.log('in init');
			
		thillyIndex.browser = checkVersion();
		thillyIndex.mainSocket = io.connect(document.URL);
		var fileHash = window.location.hash.replace('#','');
		var query = fileHash.split('?')[1] || 'home';
			fileHash = fileHash.split('?')[0];
		thillyIndex.mainSocket.sendCommand = thillyUtil.sendCommand;
		thillyIndex.mainSocket.on('command', thillyUtil.actionCommand);
		thillyInteraction.init();
		thillyIndex.mainSocket.on('connect',function(){
			var requestObj = {
				article: thillyIndex.articleList,
				state: query
			};
			if(fileHash){
				requestObj.article = fileHash;
			}
			thillyIndex.goToState(document.getElementById(query+'Nav'), requestObj);
		});
		checkCache();
	}
	
	/** */
	function breadCrumb(element){
		if(debug.trace)
			debug.log('in breadCrumb');
			
		var parent = element.parentNode;
		for(var i = 0; i < parent.childNodes.length; i++)
		{
			if(parent.childNodes[i].className)
				parent.childNodes[i].className = parent.childNodes[i].className.replace(' current','');
		}
		element.className = element.className + ' current';
	}

	/** */
	function checkCache(){
		if(debug.trace)
			debug.log('in checkCache');
			
		if(typeof(Storage) !== 'undefined'){
			thillyIndex.user.string = localStorage.getItem('userString');
			if(thillyIndex.user.string){
				thillyUtil.login(false, thillyIndex.user.string);
			}
		}
	}

	/*
		Browser Stuff
	*/

	/** */
	function checkVersion(){
		var response = false;
		var version = navigator.userAgent;
		if(version.indexOf('Chrome') >= 0){
			return{'Chrome': version.match(/Chrome\/(\d{1,2})/)[1]};
		}
		else if(version.indexOf('Firefox') >= 0){
			return{'FireFox': version.match(/Firefox\/(\d{1,2})/)[1]};
		}
		else if(version.indexOf('MSIE') >= 0){
			addBrokenStuff();
			return{'IE': version.match(/MSIE (\d{1,2})/)[1]};
		} 
		else if(version.indexOf('Mobile') >= 0){
			return findMobile(version);
		}
		else if(version.indexOf('Like Geko') >= 0){
			addBrokenStuff();
			return{'IE': 11};
		}
		else{
			addBrokenStuff();
			return{'Unknown' : 0};
		}
	}

	/** */
	function findMobile(version){
	
		if(version.indexOf('CriOS') >= 0){
			return{'Chrome iOS': version.match(/CriOS\/(\d*)/)[1]};
		}
		else if(version.indexOf('Safari') >= 0){
			return{'Safari iOS': version.match(/Safari\/(\d*)/)[1]};
		}
		else
			return{'Unknown Mobile' : 0};
	
	}
	
	/** */
	function cleanForMobile(){
		//get different CSS and stuff
	}
	
	/** */
	function addBrokenStuff(){
		document.getElementsByClassName = function(className){
			var elements = [];
			var regex = new RegExp('(^| )' + className + '( |$)');
			var all = document.getElementsByTagName('*');
			for(var i = 0; i < all.length; i++)
			{
				if(regex.test(all[i].className))
					elements.push(all[i]);
			}
			return elements;
		};

	}

}).apply(window.thillyIndex, [window.thillyLogging]);