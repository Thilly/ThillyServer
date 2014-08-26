/** */

/**options for Logging and rest of the server */
var options = {
	port		:	(process.argv[2] == 'live')?80:8080,
	environment	:	process.argv[2] || 'test', 
	homeDomain	:	(process.argv[2] == 'live')?'http://thilly.net/':'http://192.168.1.50:8080/'
};

/** */
var logging = require('./thillylogging.js')(options);

/** */
var mongo = new require('./thillyMongo.js')(logging, function(){
	logging.log.mongo('MongoDB has started\n');
});

/** */
var exception = require('./thillyexceptions.js')(logging);

/** */
var files = new require('./thillyFiles.js')(logging);

/** */
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** */
var sockets = require('socket.io').listen(server, {log: logging.getFlags().socketIO});
	logging.setLoggingListener(sockets);
	logging.log.sockets('WebService has started on port: ' + logging.port);
	
/** */
var webServiceMap = {};

buildWebServiceMap({'logging': logging,
					'files': files,
					'mongo': mongo
					}, webServiceMap);	

/** */
sockets.on('connection', function(socket){
	socketConnect(socket, 'sockets');
});

/** */
function socketConnect(socket, channel){
	logging.log.trace('In ' + channel + '.on("connection")');
	logging.log.sockets(socket.id + ' connected');
	socket.sendCommand = sendCommand;
	
	/** */
	socket.on('command', function(data){
		logging.log.trace('In ' + channel + '.on("command")');
		if(data.command != 'login')
			logging.log.sockets('Recieved data from socket: ' + JSON.stringify(data));
			
		actionCommand(data, socket, webServiceMap);
	});
};

/** */
function sendCommand(command, dataObject, callBack){//general send command function
	logging.log.trace('In sendCommand');
	var commandObject = {'command':command, 'value':dataObject};
	try{
		if(typeof(callBack) == 'function')
			this.emit('command', commandObject, callBack);
		else
			this.emit('command', commandObject);
	}
	catch(error){
		new exception.utility('Socket has not been instantiated yet, cannot sendCommand');
	}
}

/** */
function actionCommand(data, socket, functionMap){//general recieve command function
	logging.log.trace('In actionCommand');
	try{
		data.value.command = ''+data.command;
		data.command = data.command.replace(/\d+/.exec(data.command)[0], '');
		functionMap[data.command](data.value, socket, exception.ErrorHandle);
	}
	catch(error){
		new exception.utilityException('exception when trying to call ' + data.command + ' : ' + error);
	}
}

/** */
function buildWebServiceMap(dependencies, serviceMap){
	
	var fs = require('fs');
	
	fs.readdir('./ServerPKGs/functionMaps', function(error, files){
		if(error)
			logging.log.errors(error);
		else{
			for(var i = 0; i < files.length; i++){
			
				var tempFunctionMap = require('./functionMaps/'+files[i])(dependencies);
				for(var func in tempFunctionMap){
					if(typeof serviceMap[func] == 'function')
						logging.log.errors('ERROR WHILE BUILDING SERVICE MAP:: ' + func + ' already in use');
					else{
						serviceMap[func] = tempFunctionMap[func];
						logging.log.trace('adding : ' + func + ' to webServiceMap');
					}
				}
			}
			logging.log.trace('webservice map constructed for ' + options.environment);
		}
	});
};














