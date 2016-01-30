/** */
window.thillyGame = {};

/** */
(function(debug){

	var canvas;
	var topContent;
	
	this.currentPort = '';
	this.gameSocket = {};
	
	this.init = function(){
		if(debug.trace)
			debug.log('in thillyGame.init');
			topContent = document.getElementById('topContent');
			topContent.innerHTML = '';
			
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getGameList', {}, function(gameList){
			var docFrag = new DocumentFragment();
			for(var i = 0; i < gameList.length; i++){
				var hostTile = document.createElement('span');
					hostTile.className = 'hostTile';
					hostTile.innerHTML = 'Host';
				var playTile = document.createElement('span');
					playTile.className = 'playTile';
					playTile.innerHTML = 'Play';
				var aGameTile = document.createElement('div');
				aGameTile.className = 'gameTile';
				aGameTile.id = gameList[i];
				aGameTile.innerHTML = gameList[i];
				
				aGameTile.onclick = function(){
					if(this.id == 'controllerTest')
						thillyUtil.sendReceive(thillyIndex.mainSocket, 'playAGame', {gameName: this.id}, loadGame);
					else{
						if(aGameTile.className === 'gameTile')
							aGameTile.className += ' selected';
						else
							aGameTile.className = 'gameTile';
					}
				};
				
				playTile.onclick = function(){
					var portNum = prompt('Enter session number of game');
					thillyUtil.sendReceive(thillyIndex.mainSocket, 'playAGame', {port: portNum, gameName: aGameTile.id}, loadGame);
				};
				
				hostTile.onclick = function(){
					thillyUtil.sendReceive(thillyIndex.mainSocket, 'getAGame', {gameName: aGameTile.id}, loadGame);
				};
				
				aGameTile.appendChild(hostTile);
				aGameTile.appendChild(playTile);
				docFrag.appendChild(aGameTile);
			}
			thillyUtil.createLoginWall('', docFrag, function(wall){
				topContent.appendChild(wall);
				var login = topContent.getElementsByClassName('inlineButton')[0];
				login.style.marginLeft = '20%';
				login.style.marginTop = '20%';
			});
		});
	}
	
	function startNewGame(){
		canvas = document.createElement('canvas');
		canvas.id = 'gameCanvas';
		topContent.innerHTML = '';
		topContent.appendChild(canvas);
		canvas.width = topContent.offsetWidth;
		canvas.height = topContent.offsetHeight;
		thillyRender.start(canvas, currentGame.frameRate);
	}
	
	function loadGame(gameData){
		if(debug.trace)
			debug.log('in loadGame');
		var newSocketURL;
		if(document.URL.indexOf('8080') > 0)
			newSocketURL = document.location.origin.replace('8080',gameData.port);
		else
			newSocketURL = document.location.origin + ':' + gameData.port;
			
		thillyGame.currentPort = gameData.port;
		thillyGame.gameSocket = io.connect(newSocketURL);
		thillyGame.gameSocket.sendCommand = thillyUtil.sendCommand;
		eval(gameData.js);
		startNewGame();
	}
	
}).apply(window.thillyGame, [window.thillyLogging]);


