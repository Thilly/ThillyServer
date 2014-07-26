/** */

/**options for Logging and rest of the server */
//will come from launcher/process manager eventually
var options = {
	port		:	(process.argv[2] == 'live')?80:8080,
	environment	:	process.argv[2] || 'test', 
	homeDomain	:	'http://174.49.168.70'
};

/** */
var logging = require('./thillylogging.js')(options);

/** */
var exception = require('./thillyexceptions.js')(logging);

/** */
var files = new require('./thillyFiles.js')(logging);

/** */
var mongo = new require('./thillyMongo.js')(logging, function(){
	console.log('MongoDB has started\n');
});

/** */
var crypto = require('./thillyCrypto.js')(logging);

/** */
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** */
var sockets = require('socket.io').listen(server, {log: logging.flags.socketIO});

console.log('WebService has started on port: ' + logging.port + '\n');

/** */
var webServiceMap = {//will be a require to a different file for each 'state'
	updatePage 		:	function(data, socket, exception){ updatePage(data, socket, exception);},
	login			:	function(data, socket, exception){ login(data, socket, exception);},
	register		:	function(data, socket, exception){ register(data, socket, exception);},

//move to mongoFunctionMap	
	commentVote		:	function(data, socket, exception){ constructVote(data, socket, exception);},
	picUpload		:	function(data, socket, exception){ picUpload(data, socket, exception);},
	pushNewArticle	:	function(data, socket, exception){ pushNewArticle(data, socket, exception);},
	pushNewComment	:	function(data, socket, exception){ pushNewComment(data, socket, exception);},
	getComments		:	function(data, socket, exception){ getComments(data, socket, exception);},
	getTemplate		:	function(data, socket, exception){ getTemplate(data, socket, exception);},
	getPages		:	function(data, socket, exception){ getPages(data, socket, exception);},
	getPageIDs		:	function(data, socket, exception){ getPageIDs(data, socket, exception);},
	getPageDetails	:	function(data, socket, exception){ getPageDetails(data, socket, exception);}
};	

/** */
sockets.on('connection', function(socket){
	logging.log.trace('In sockets.on("connection")');
	logging.log.sockets(socket.id + ' connected');
	
	socket.sendCommand = sendCommand;
	
	/** */
	socket.on('command', function(data){
		logging.log.trace('In socket.on("command")');
		logging.log.sockets('Recieved data from socket: ' + JSON.stringify(data));
			
		actionCommand(data, socket, webServiceMap);
	});
	
	/** */

});

/** */
function sendCommand(command, dataObject, callBack)
{//general send command function
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
function actionCommand(data, socket, functionMap)
{//general recieve command function
	logging.log.trace('In actionCommand');
	try{
		functionMap[data.command](data.value, socket, exception.ErrorHandle);
	}
	catch(error){
		new exception.utility('exception when trying to call ' + data.command);
	}
}


/*
	BEGIN webServiceMap definitions
*/

/** */
function updatePage(data, socket, exception){
	logging.log.trace('In updatePage' + data);
	files.readFile('./client/' + data, function(error, returnValue){
		if(error)
		{
			logging.log.error('Error in updatePage: ' + error);
			socket.emit('updatePage', {'error': error});
		}
		else
			socket.emit('updatePage', {'value':returnValue.toString()});
	});
}

/** */
function login(data, socket, exception){

	logging.log.trace('In login: ' + data.userName + ' : ' + data.password + ' : ' + data.userString);
	
	if(data.userString)
		mongo.select('user', {_id:mongo.parse(data.userString)}, {projection:{_id : 1, userID:1, password:1, type:1}}, callBack)
	else
		mongo.select('user', {userID:data.userName}, {projection:{_id : 1, userID:1, password:1, type:1}}, callBack)
		
	function callBack(error, result){
		if(error)
			logging.log.error('error in login: ' + error);
		else if(result.length == 0){
			logging.log.sockets('login failed: no such user');		
			socket.sendCommand('login', {failed:'no such user'});
		}
		else if(data.userString == result[0]._id)
			loginUser(result[0], socket);
		else if(result[0].password == crypto.createHash(data.password)){
			loginUser(result[0], socket);
		}
		else{
			logging.log.sockets('login failed: wrong password');
			socket.sendCommand('login', {failed:'wrong password'});
		}
	}
}

/** */
function loginUser(userData, socket){
	logging.log.trace('In loginUser');
	var userTypeFileName = (userData.type == 'admin')?'admin.js':'standard.js';
	files.readFile('./servedJS/' + userTypeFileName, function(error, data){
		logging.log.sockets('login successful, sending ' + userTypeFileName);
		socket.user = userData;
		socket.sendCommand('login', {success: true, userScript: data.toString(), type:userData.type, name:userData.userID, userString:userData._id});
	});
}

/** */
function register(data, socket, exception){
	logging.log.trace('In register');
	
	var insertObj = {
		userID	:	data.userName,
		userName:	data.userName.toLowerCase(),
		password:	crypto.createHash(data.password),
		points	:	0,
		type	:	'standard'
	};
	
	mongo.select('user', {userName:data.userName.toLowerCase()}, {projection:{userID:1}}, function(error, result){
		if(error)
			logging.log.error('error in register select: ' + error);
		else if(result.length > 0){
			logging.log.sockets('user name: ' + data.userName + ' taken.');
			socket.sendCommand('login', {failed:'user name taken'});
		}
		else{
			mongo.insert('user', insertObj, {w:1}, function(error, result){
				if(error)
					logging.log.error('error in register: ' + error);
				else{
					logging.log.sockets('register completed successfully');
					loginUser(insertObj, socket);
				}
			});
		}
	});
}

/*
	BEGIN mongoMap definitions
*/

/** */
function picUpload(data, socket, exception){
	logging.log.trace('In picUpload: ' + data.name);
	var fileName = 'client/' + logging.log.environment + '/images/' + data.name;
	files.writeFile(fileName, data.file, function(error, file){
		if(error)
			logging.log.error('error in picUpload: ' + error);
		else
		{
			var filePath = file.replace('client/','');
			logging.log.trace('picUploaded: ' + file);
			socket.sendCommand('picUploaded', {name:data.name, path:filePath});
		}
	});

}

/** */
function pushNewComment(data, socket, exception){
	logging.log.trace('In pushNewComment');
	logging.log.mongo('userName: ' + data.userID);
	logging.log.mongo('pageID: ' + data.pageID);
	logging.log.mongo('text: ' + data.commentText);
	logging.log.mongo('replyTo: ' + data.replyTo);
	
	mongo.insert('comment', data, {w:1}, function(error, result){
		var msg = '';
		if(error)
			msg = 'error pushing new comment: ' + error;
		else
			msg = 'New comment pushed: ' + result;
		logging.log.mongo(msg);
	});
}

/** */
function pushNewArticle(data, socket, exception){
	logging.log.trace('In pushNewArticle: ' + data.title);
	logging.log.mongo('title: ' + data.title);
	logging.log.mongo('thumb: ' + data.thumb);
	logging.log.mongo('pageID: ' + data.pageID);
	logging.log.mongo('pictures: ' + data.pictures);
	logging.log.mongo('content: ' + data.content.length + ' bytes');
	logging.log.mongo('category: ' + data.category);

	var selection = {pageID: data.pageID, category: data.category};
	if(socket.user.type == 'admin'){
		mongo.update('content', selection, data, {upsert: true, w:1}, function(error, result){
			var msg = '';
			if(error){
				msg = 'error pushing new article: ' + error;
				socket.sendCommand('articlePushed', {msg:msg});
			}
			else{
				msg = 'New article pushed: ' + data.title;
				socket.sendCommand('articlePushed', {msg:msg});
			}
			logging.log.mongo(msg);
		});		
	}
	else
		socket.sendCommand('articlePushed', {msg:'Sorry, only Thilly can submit new content at this time'});
}

/** */
function constructVote(data, socket, exception){
	logging.log.trace('In constructVote');
	
	var commentObj = {'pID':data.pageID, 'cID':data.commentID};
	var query = {userID:data.userID, '$or':[{'upVotes':{'$elemMatch':commentObj}}, {'downVotes':{'$elemMatch':commentObj}}]};
	var projection = {projection:{_id:0, 'downVotes':1, 'upVotes':1}};
	
	mongo.select('user', query, projection, function(error, result){//see if changing a vote
		if(error)
			logging.log.error(error);
		logging.log.trace('votequery returned: ' + JSON.stringify(result));
		if(result.length > 0){
			result = result[0];
			for(var i in result){
				for(var j in result[i]){
					if(result[i][j].pID == commentObj.pID && result[i][j].cID == commentObj.cID){
						recordVote(commentObj, data, i);//this thing was already voted on				
						return;
					}
				}
			}
		}
		recordVote(commentObj, data);
	});
}

/** */
function recordVote(commentObj, userData, voteExists){
	logging.log.trace('In recordVote');
		
	var update, modify = 1;
	
	if(userData.vote == 1){
		if(voteExists == 'downVotes'){
			modify = 2;
			update = {'$addToSet':{'upVotes':commentObj},'$pull':{'downVotes':commentObj}};
		}
		else if(voteExists == 'upVotes'){
			modify = -1;
			update = {'$pull':{'upVotes':commentObj}};
		}
		else
			update = {'$addToSet':{'upVotes':commentObj}};
	}
	else if(userData.vote == -1){
		if(voteExists == 'upVotes'){
			modify = 2;
			update = {'$addToSet':{'downVotes':commentObj},'$pull':{'upVotes':commentObj}};
		}
		else if(voteExists == 'downVotes'){
			modify = -1;
			update = {'$pull':{'downVotes':commentObj}};
		}
		else
			update = {'$addToSet':{'downVotes':commentObj}};
	}
	
	mongo.update('user',{userID: userData.userID},update,{w:1},function(error, result, second){//record the votes
		if(error)
			logging.log.error(error);
		else{
			logging.log.trace('vote recorded: ' + modify*userData.vote);
			recordPoints(userData, modify);
		}
	});
}

/** */
function recordPoints(userData, modify){
	logging.log.trace('In recordPoints');
	var coll, query, update = {'$inc': {points:(modify*userData.vote)}};
	
	if(userData.commentID > 0){
		coll = 'comment';
		query = {date: userData.commentID, pageID:userData.pageID};
	}
	else{
		coll = 'content';
		query = {pageID:userData.pageID};
	}
	if(userData.commentID > 0)
		mongo.update('user', {userID:userData.commenter}, update, {w:1}, function(error, result){
			if(error)
				logging.log.error(error);
			else
				logging.log.trace(coll + ' points recorded for user: ' + userData.commenter);
		});
		
	mongo.update(coll, query, update, {w:1}, function(error, result){
			if(error)
				logging.log.error(error);
			else
				logging.log.trace(coll + ' points recorded for comment:' + userData.commentID);
	});
}

/** */
function getComments(data, socket, exception){
	logging.log.trace('In getComments: ' + data.pageID + ':' + data.userName);
	if(data.userName)
		getVotes(data, socket, exception);
			
	mongo.select('comment', {pageID:data.pageID}, {projection : {}, sort: {date: 1}}, function(error, result){
		socket.sendCommand('getComments', {value:result, id:data.pageID});
	});
}

/** */
function getVotes(data, socket, exception){
	logging.log.trace('In getVotes: ' + data.pageID + ':' + data.userName);
	mongo.select('user', {userID: data.userName}, {projection : {_id: 0, upVotes: 1, downVotes: 1}}, function(error, result){
		result = result[0];
		var votes = {
			downVotes: [],
			upVotes: []
		}
		for(var i = 0; i < result.downVotes.length; i++){
			if(result.downVotes[i].pID == data.pageID){
				votes.downVotes.push(result.downVotes[i]);
			}
		}		
		for(var j = 0; j < result.upVotes.length; j++){
			if(result.upVotes[j].pID == data.pageID){
				votes.upVotes.push(result.upVotes[j]);	
			}
		}
		socket.sendCommand('getVotes', {value:votes, id:data.pageID});
	});
}

/** */
function getPageDetails(data, socket, exception){
	logging.log.trace('In getPageDetails: ' + JSON.stringify(data));
	
	mongo.select('content', {pageID:data.pageID, category: data.category}, {projection : {}}, function(error, result){
		socket.emit('getPageDetails', result);
	});
}

/** */
function getPageIDs(data, socket, exception){
	logging.log.trace('In getPageIDs');
		
	mongo.select('content', {pageID:{$ne:"00000001template"}}, {projection : {pageID:-1, category: 1}, sort:{pageID: -1}}, function(error, result){
		socket.sendCommand('pageIDs', result);
	});
}

/** */
function getTemplate(data, socket, exception){
	logging.log.trace('In getTemplates');
		
	mongo.select('content', {category:'template'}, {projection : {}, sort:{pageID: -1}}, function(error, result){
		socket.emit('gotTemplate', result);
	});

}

/** */
function getPages(data, socket, exception){
	logging.log.trace('In getPages:' + JSON.stringify(data));
		
	var callBack = function(error, result){
		logging.log.mongo('returned from select: ' + result.length);
		socket.sendCommand('getPages', result);
	};
	
	var query = {
		category: {$ne: 'template'}
	};
	var options = {
		projection: {},
		sort:{pageID: -1},
		limit: 5		
	};

	if(typeof(data.article) == 'object'){
		query.pageID = {$nin: data.article};
	}
	else if(typeof(data.article) == 'string'){
		query.pageID = data.article;
	}
	if(data.state != 'home')
		query.category = data.state;
		
	mongo.select('content', query, options, callBack);	
}

