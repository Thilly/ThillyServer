/** thillyServer.js
	this module is launched for each instance of the webserver application
*/

/** options
	options are created from the CLI arguments for Logging and determining the environment the server will run on
*/
var options = {
	port		:	(process.argv[2] == 'live')?80:8080,
	environment	:	process.argv[2] || 'test', 
	homeDomain	:	(process.argv[2] == 'live')?'http://thilly.net/':'http://192.168.1.50:8080/'
};

/** logging
	logging is for handling all server side messages for debugging and data performance metrics. logging is built from the thillyLogging module by passing the CLI options
 */
var logging = require('./thillylogging.js')(options);

/** mongo
	mongo is an abstraction of the node-mongo interface to help generalize queries for my specific implementations. it is built from the thillyMongo module by passing the logging module
*/
var mongo = new require('./thillyMongo.js')(logging, function(){
	logging.log.mongo('MongoDB has started');
	var threeDays = 3*24*60*60*1000;
	setInterval(mongo.backup, threeDays);
	logging.log.mongo('MongoDB backup schedule begun');
	
});

/** exception
	exception is a centralized place to catch and handle thrown exceptions, it has dependencies within logging
*/
var exception = require('./thillyexceptions.js')(logging);

/** files
	files is an abstraction around the node file system module, it acts as a generalized interface for the functionality I need. It has a dependency on logging.
*/
var files = new require('./thillyFiles.js')(logging);

/** server
	server is the actual webservice that will listen for and serve http requests
*/
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** sockets
	sockets is the community library socket.io and it controls streaming data to and from the server
*/
var sockets = require('socket.io').listen(server, {log: logging.getFlags().socketIO});
	logging.setLoggingListener(sockets);
	logging.log.sockets('WebService has started on port: ' + logging.port);
	
/** webServiceMap
	webServiceMap is created dynamically from the different function maps previously written. It becomes a centralized pipe for most requests and interaction with the server.
*/
var webServiceMap = {};

buildWebServiceMap({'logging': logging,
					'files': files,
					'mongo': mongo
					}, webServiceMap);	

sockets.on('connection', function(socket){
	socketConnect(socket, 'sockets');
});

/** socketConnect: socket, channel
	socketConnect is fired when a new socket first connects to the server. It takes a socket to link up the generalized handlers and a channel to connect with other sockets.
 */
function socketConnect(socket, channel){
	logging.log.trace('In ' + channel + '.on("connection")');
	logging.log.sockets(socket.id + ' connected');
	socket.sendCommand = sendCommand;
	
	/** */
	socket.on('command', function(data){
		logging.log.trace('In ' + channel + '.on("command")');
		if(!data.command.match(/login\d*/))//dont log the login info
			logging.log.sockets('Received data from socket: ' + JSON.stringify(data));
			
		actionCommand(data, socket, webServiceMap);
	});
};

/** sendCommand
	sendCommand is the generalized handler for sending information back to the client using the serialized JSON
*/
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

/** actionCommand
	actionCommand is the generalized handler for requests. It takes the data, socket and particular function map and runs that particular function while wrapped with exception handling.
	
*/
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

/** buildWebServiceMap : dependencies, serviceMap
	buildWebServiceMap takes the general dependencies the different function maps may need and instantiates all of the different generalized modules into the service map with the dependencies.
*/
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














