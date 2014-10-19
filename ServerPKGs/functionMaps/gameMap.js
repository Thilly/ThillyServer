/** */
var logging, files, mongo;

/** */
var gameNameMap = {};
var controllerMap = {};
var gameList = [];

var activeGameMap = {};//between ports 62300 - 62400

/** */
module.exports = function(deps){

	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
	
	var fileSys = require('fs');
	fileSys.readdir('./servedJS/games', function(error, rawGameList){
		for(var i = 0; i < rawGameList.length; i++){
			var gameName = rawGameList[i].replace('.js','');
			gameList.push(gameName);
			(function(name, idx){
				files.readFile('./servedJS/games/' + rawGameList[idx], function(error, data){
					gameNameMap[name] = data.toString();
				});
				files.readFile('./servedJS/controllers/' + rawGameList[idx], function(error, data){
					controllerMap[name] = data.toString();
				});
			})(gameName, i);
		}
	});
	
	return {
		getGameList	:	getGameList,
		getAGame	:	getAGame,
		playAGame	:	playAGame
	};
};

function getGameList(data, socket, exception){
	logging.log.trace('in getGameList');
	socket.sendCommand(data.command, gameList);
}

function getAGame(data, socket, exception){
	logging.log.trace('in getAGame : ' + data.gameName);
	var portNum = 62300 + Math.floor(Math.random() * 100);
	var child = require('child_process');
		child = child.fork('./ServerPKGs/ChildProcesses/gameServer.js', [portNum]);
		child.on('message', function(childData){
			if(childData.msg === 'end'){
				child.kill('SIGTERM');
				console.log('closing gameserver: ' + portNum);
				delete activeGameMap[portNum];
			}
			if(childData.msg === 'start'){
				socket.sendCommand(data.command, {js:gameNameMap[data.gameName], port:portNum});
			}
		});
}

function playAGame(data, socket, exception){
	logging.log.trace('in playAGame : ' + data.gameName);	
	socket.sendCommand(data.command, {js:controllerMap[data.gameName], port: data.port});
}