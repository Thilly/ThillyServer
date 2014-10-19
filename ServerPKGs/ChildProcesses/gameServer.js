var gameServiceMap = {
	'toGame': toGame,
	'toPlayer' : toPlayer,
	'toAll' : toAll,
	'toAllPlayers' : toAllPlayers,
	'introduce'	: introduce
};

console.log('GameServer starting on port ' + process.argv[2]);
/** */
var server = require('http').createServer(general).listen(process.argv[2]);
var sockets = require('socket.io')(server);
	sockets.set('transports', ['websocket', 'polling']);
	process.send({msg:'start'});

var host;
var players;	
	
/** */
sockets.on('connection', function(socket){
	socket.sendCommand = sendCommand;
	
	socket.on('disconnect', function(){
		console.log('socket left ' + JSON.stringify(this.player));
		host.sendCommand('leaving', this.player);
	});
	
	/** */
	socket.on('command', function(data){			
		actionCommand(data, socket, gameServiceMap);
	});
});
	
function general(req, res){
	res.writeHead(200);
	res.end('hello');
}

/** */
function sendCommand(command, dataObject, callBack){//general send command function
	var commandObject = {'command':command, 'value':dataObject};
	try{
		if(typeof(callBack) == 'function')
			this.emit('command', commandObject, callBack);
		else
			this.emit('command', commandObject);
	}
	catch(error){
		console.log('Socket has not been instantiated yet, cannot sendCommand');
	}
}

/** */
function actionCommand(data, socket, functionMap){//general recieve command function
	try{
		data.value.command = ''+data.command;
		data.command = data.command.replace(/\d+/.exec(data.command)[0], '');
		functionMap[data.command](data.value, socket);
	}
	catch(error){
		console.log('exception when trying to call ' + data.command + ' : ' + error);
	}
}

function introduce(command, socket){
	console.log('introduce: ' + command);
	if(command.host){
		host = socket;
		console.log('host introduced');
	}
	else{
		console.log('introducing player: ' + command.name);
		socket.player = command;
		host.sendCommand('introduce', command);
	}
}

function toGame(command, socket){
	console.log('toGame: ' + command);
	host.sendCommand('control', command);
}

function toPlayer(command, socket){
	console.log('toPlayer: ' + command);
}

function toAll(command, socket){
	console.log('toAll: ' + command);
}

function toAllPlayers(command, socket){
	console.log('toAllPlayers: ' + command);
}