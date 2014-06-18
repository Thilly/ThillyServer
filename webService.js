/** */
var logging = require('./ServerPKGs/thillyLogging.js');

/** */
var Exception = require('./ServerPKGs/thillyExceptions.js');

/** */
var files = new require('./ServerPKGs/thillyFiles.js')(logging);

/** */
var mongo = new require('./ServerPKGs/thillyMongo.js')(logging, function(){
	console.log('MongoDB has started\n');
});

/** */
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** */
var sockets = require('socket.io').listen(server, {log: logging.socketIO});


console.log('WebService has started on port: ' + logging.port + '\n');

/** */
var webServiceMap = {//will be a require to a different file for each 'state'
	updatePage 		:	function(data, socket, exception){ updatePage(data, socket, exception);},
	
//move to mongoMap	

	getPages		:	function(data, socket, exception){getPages(data, socket, exception);},
	getPageIDs		:	function(data, socket, exception){getPageIDs(data, socket, exception);},
	getPageDetails	:	function(data, socket, exception){getPageDetails(data, socket, exception);}
	
};	

/** */
sockets.on('connection', function(socket){
	if(logging.trace)
		logging.log('In sockets.on("connection")');
	if(logging.sockets)
		logging.log(socket.id + ' connected');
	
	socket.sendCommand = sendCommand;
	
	/** */
	socket.on('command', function(data){
		if(logging.trace)
			logging.log('in socket.on("command"');
		if(logging.sockets)
			logging.log('Recieved data from socket: ' + JSON.stringify(data));
			
		actionCommand(data, socket, webServiceMap);
	});
	
	/** */

});

/** */
function sendCommand(command, dataObject, callBack)
{//general send command function
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

/** */
function actionCommand(data, socket, functionMap)
{//general recieve command function
	if(logging.trace)
		logging.log('In actionCommand');
	functionMap[data.command](data.value, socket, Exception.ErrorHandle);
}


/*
	BEGIN webServiceMap definitions
*/

/** */
function updatePage(data, socket, exception)
{
	if(logging.trace)
		logging.log('In updatePage' + data);
	files.readFile('./client/' + data, function(error, returnValue){
		if(error)
		{
			if(logging.error)
				logging.log('Error in updatePage: ' + error);
			socket.emit('updatePage', {'error': error});
		}
		else
			socket.emit('updatePage', {'value':returnValue.toString()});
	});
}


/*
	BEGIN mongoMap definitions
*/

/** */
function getPageDetails(data, socket, exception){
	if(logging.trace)
		logging.log('in getPageDetails');
	
	mongo.select('content', {pageID:data}, {projection : {}}, function(error, result){
		socket.emit('getPageDetails', result);
	});
}

/** */
function getPageIDs(data, socket, exception){
	if(logging.trace)
		logging.log('in getPageIDs');
		
	mongo.select('content', {}, {projection : {pageID:-1}}, function(error, result){
		socket.sendCommand('pageIDs', result);
	});
}

/** */
function getPages(data, socket, exception){
	if(logging.trace)
		logging.log('in getPages');
		
	var callBack = function(error, result){
		if(logging.mongo)
			logging.log('returned from select: ' + result.length);
		socket.sendCommand('getPages', result);
	};
	
	if(typeof(data) == 'number'){
		console.log('number query ' + data);
		mongo.select('content', {}, {projection: {}, skip:data, limit:5}, callBack);
	}
	else if(typeof(data) == 'object'){
		console.log('objectQuery ' + data);
		mongo.select('content', {pageID: {$in:data}}, {projection:{}}, callBack);
	}
	else if(typeof(data) == 'string'){
		console.log('stringQuery ' + data);
		mongo.select('content', {pageID: data}, {projection:{}}, callBack);	
	}
}