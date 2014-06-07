/** */
var logging = require('./ServerPKGs/thillyLogging.js');

/** */
var Exception = require('./ServerPKGs/thillyExceptions.js');

/** */
var files = require('./ServerPKGs/thillyFiles.js');
files = new files(logging);

/** */
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** */
var sockets = require('socket.io').listen(server, {log: logging.socketIO});

console.log('Potential web server started on port: ' + logging.port);

/** */
var mainFunctionMap = {//will be a require to a different file for each 'state'
	test : function(data){console.log('test is working');},
	updatePage : function(data, socket, exception){ updatePage(data, socket, exception);}
};

/** */
sockets.on('connection', function(socket){
	if(logging.trace)
		logging.log('In sockets.on("connection")');
	if(logging.sockets)
		logging.log(socket.id + ' connected');
	
	/** */
	socket.on('command', function(data){
		if(logging.trace)
			logging.log('in socket.on("command"');
		if(logging.sockets)
			logging.log('Recieved data from socket: ' + JSON.stringify(data));
			
		actionCommand(data, socket, mainFunctionMap);
	});
	
	/** */
	socket.sendCommand = sendCommand;
});

/** */
function actionCommand(data, socket, functionMap)
{//general recieve command function
	if(logging.trace)
		logging.log('In actionCommand');
	functionMap[data.command](data.value, socket, Exception.ErrorHandle);
}

/** */
function updatePage(data, socket, exception)
{
	console.log('in updatePage');
	files.readFile('./dir/' + data, function(error, returnValue){
		returnValue = returnValue.toString();
		console.log('returning data: ' + returnValue.length);
		socket.emit('updatePage', returnValue);
	});


}



/** */
function sendCommand(command, dataObject, callBack)
{//general send command function
	if(logging.trace)
		logging.log('In sendCommand');
		
	var commandObject = {'command':command, 'value':dataObject};
	try{
		if(typeof(callBack) == 'function')
			this.emit('command', commandObject, callBack);
		else
			this.emit('command', commandObject);
	}
	catch(error){
		throw new Exception('Socket has not been instantiated yet, cannot sendCommand');
	}
}