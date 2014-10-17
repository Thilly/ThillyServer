/** */
var logging, files, mongo;

/** */
var gameMap = {};
var gameList = [];

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
				gameMap[name] = data.toString();
				});
			})(gameName, i);
		}
	});
	
	return {
		getGameList	:	getGameList,
		getAGame	:	getAGame
	};
};

function getGameList(data, socket, exception){
	logging.log.trace('in getGameList');
	socket.sendCommand(data.command, gameList);
}

function getAGame(data, socket, exception){
	logging.log.trace('in getAGame : ' + data.gameName);	
	socket.sendCommand(data.command, gameMap[data.gameName]);

}