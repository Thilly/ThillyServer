/** */
var logging = require('./ServerPKGs/thillyLogging.js');

/** */
var Exception = require('./ServerPKGs/thillyExceptions.js');

/** */
var files = new require('./ServerPKGs/thillyFiles.js')(logging);

/** */
var mongo = new require('./ServerPKGs/thillyMongo.js')(logging, function(){
	console.log('MongoDB has started');
});

/** */
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** */
var sockets = require('socket.io').listen(server, {log: logging.socketIO});


console.log('WebService has started on port: ' + logging.port);

/** */
var webServiceFunctionMap = {//will be a require to a different file for each 'state'
	test 			:	function(data){console.log('test is working');},
	
	addArticle 		:	function(data, socket, exception){addArticle(data, socket, exception);},
	addUser 		:	function(data, socket, exception){addUser(data, socket, exception);},
	addComment		:	function(data, socket, exception){addComment(data, socket, exception);},
	
	getUserVotes	:	function(data, socket, exception){getUserVotes(data, socket, exception);},
	getUserComments	:	function(data, socket, exception){getUserComments(data, socket, exception);},
	getPageComments	:	function(data, socket, exception){getPageComments(data, socket, exception);},
	getUser			:	function(data, socket, exception){getUser(data, socket, exception);},
	getPages		:	function(data, socket, exception){getPages(data, socket, exception);},
	
	updatePage 		:	function(data, socket, exception){ updatePage(data, socket, exception);}
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
			
		actionCommand(data, socket, webServiceFunctionMap);
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
	BEGIN webServiceFunctionMap definitions
*/

/** */
function updatePage(data, socket, exception)
{
	if(logging.trace)
		logging.log('In updatePage');
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




function getUserVotes(data, socket, exception){
}
function getUserComments(data, socket, exception){
}
function getPageComments(data, socket, exception){
}
function getUser(data, socket, exception){
}
function getPages(data, socket, exception){
	mongo.getPages(0, 5, function(err, result){
		if(err)
			console.log(err)
		else
		{
			socket.sendCommand('getPages', result);
			console.log('sent command getPages');
		}
	});
}


/** */
function addArticle(data, socket, exception){
	if(logging.trace)
		logging.log('In addArticle');
	mongo.addArticle(data.content, data.pictures, function(error, result){
		if(error)
		{
			if(logging.error)
				logging.log('Error in addArticle: ' + error);
			socket.emit('addArticle', {'error': error});
		}
		else
			socket.sendCommand('addArticle', {'value':result.toString()});
	});

}

/** */
function addUser(data, socket, exception){
	if(logging.trace)
		logging.log('In addUser');
	mongo.addUser(data, function(error, result){
		if(error)
		{
			if(logging.error)
				logging.log('Error in addUser: ' + error);
			socket.emit('addUser', {'error': error});
		}
		else
			socket.sendCommand('addUser', {'value':result.toString()});	
	});
}

/** */
function addComment(data, socket, exception){
	if(logging.trace)
		logging.log('In addComment');
	mongo.addComment(data, function(error, result){
		if(error)
		{
			if(logging.error)
				logging.log('Error in addComment: ' + error);
			socket.emit('addComment', {'error': error});
		}
		else
			socket.sendCommand('addComment', {'value':result.toString()});	
	});
}


