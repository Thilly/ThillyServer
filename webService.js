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
var crypto = require('./ServerPKGs/thillyCrypto.js');

/** */
var server = require('http').createServer(files.fileHandler).listen(logging.port);

/** */
var sockets = require('socket.io').listen(server, {log: logging.socketIO});

console.log('WebService has started on port: ' + logging.port + '\n');

/** */
var webServiceMap = {//will be a require to a different file for each 'state'
	updatePage 		:	function(data, socket, exception){ updatePage(data, socket, exception);},
	login			:	function(data, socket, exception){ login(data, socket, exception);},
	register		:	function(data, socket, exception){ register(data, socket, exception);},

//move to mongoMap	
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
	if(logging.trace)
		logging.log('In sockets.on("connection")');
	if(logging.sockets)
		logging.log(socket.id + ' connected');
	
	socket.sendCommand = sendCommand;
	
	/** */
	socket.on('command', function(data){
		if(logging.trace)
			logging.log('In socket.on("command")');
		if(logging.sockets)
			logging.log('Recieved data from socket: ' + JSON.stringify(data));
			
		actionCommand(data, socket, webServiceMap);
	});
	
	/** */

});

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
		new Exception.Utility('Socket has not been instantiated yet, cannot sendCommand');
	}
}

/** */
function actionCommand(data, socket, functionMap)
{//general recieve command function
	if(logging.trace)
		logging.log('In actionCommand');
	try{
		functionMap[data.command](data.value, socket, Exception.ErrorHandle);
	}
	catch(error){
		new Exception.Utility('Exception when trying to call ' + data.command);
	}
}


/*
	BEGIN webServiceMap definitions
*/

/** */
function updatePage(data, socket, exception){
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

/** */
function login(data, socket, exception){

	if(logging.trace)
		logging.log('In login: ' + data.userName + ' : ' + data.password + ' : ' + data.userString);
	
	if(data.userString)
		mongo.select('user', {_id:mongo.parse(data.userString)}, {projection:{_id : 1, userID:1, password:1, type:1}}, callBack)
	else
		mongo.select('user', {userID:data.userName}, {projection:{_id : 1, userID:1, password:1, type:1}}, callBack)
		
	function callBack(error, result){
		if(error)
			logging.log('error in login: ' + error);
		else if(result.length == 0){
			if(logging.sockets)
				logging.log('login failed: no such user');		
			socket.sendCommand('login', {failed:'no such user'});
		}
		else if(data.userString == result[0]._id)
			loginUser(result[0], socket);
		else if(result[0].password == crypto.createHash(data.password)){
			loginUser(result[0], socket);
		}
		else{
			if(logging.sockets)
				logging.log('login failed: wrong password');
			socket.sendCommand('login', {failed:'wrong password'});
		}
	}
}

/** */
function loginUser(userData, socket){
	var userTypeFileName = (userData.type == 'admin')?'admin.js':'standard.js';
	files.readFile('./servedJS/' + userTypeFileName, function(error, data){
		if(logging.sockets)
			logging.log('login successful, sending ' + userTypeFileName);
		socket.user = userData;
		socket.sendCommand('login', {success: true, userScript: data.toString(), type:userData.type, name:userData.userID, userString:userData._id});
	});
}

/** */
function register(data, socket, exception){
	if(logging.trace)
		logging.log('In register');
	
	var insertObj = {
		userID	:	data.userName,
		userName:	data.userName.toLowerCase(),
		password:	crypto.createHash(data.password),
		points	:	0,
		type	:	'standard'
	};
	
	mongo.select('user', {userName:data.userName.toLowerCase()}, {projection:{userID:1}}, function(error, result){
		if(error)
			logging.log('error in register select: ' + error);
		else if(result.length > 0){
			if(logging.sockets)
				logging.log('user name: ' + data.userName + ' taken.');
			socket.sendCommand('login', {failed:'user name taken'});
		}
		else{
			mongo.insert('user', insertObj, {w:1}, function(error, result){
				if(error)
					logging.log('error in register: ' + error);
				else{
					if(logging.sockets)
						logging.log('register completed successfully');
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
	if(logging.trace)
		logging.log('In picUpload: ' + data.name);
	console.log('pic trying to be loaded: ' + data);
	var fileName = 'client/content/images/' + data.name;
	files.writeFile(fileName, data.file, function(error, file){
		if(error)
			logging.log('error in picUpload: ' + error);
		else
		{
			var filePath = file.replace('client/','');
			if(logging.trace)
				logging.log('picUploaded: ' + file);
			socket.sendCommand('picUploaded', {name:data.name, path:filePath});
		}
	});

}

/** */
function pushNewComment(data, socket, exception){
	if(logging.trace)
		logging.log('In pushNewComment');
	if(logging.mongo){
		logging.log('userName: ' + data.userID);
		logging.log('pageID: ' + data.pageID);
		logging.log('text: ' + data.commentText);
		logging.log('replyTo: ' + data.replyTo);
	}
	
	mongo.insert('comment', data, {w:1}, function(error, result){
		var msg = '';
		if(error){
			msg = 'error pushing new comment: ' + error;
			socket.sendCommand('commentPushed', {msg:msg});
		}
		else{
			msg = 'New comment pushed: ' + result;
		}
		if(logging.mongo)
			logging.log(msg);
	});
}

/** */
function pushNewArticle(data, socket, exception){
	if(logging.trace)
		logging.log('In pushNewArticle: ' + data.title);
	if(logging.mongo){
		logging.log('title: ' + data.title);
		logging.log('thumb: ' + data.thumb);
		logging.log('pageID: ' + data.pageID);
		logging.log('pictures: ' + data.pictures);
		logging.log('content: ' + data.content);
		logging.log('category: ' + data.category);
	}
	var selection = {pageID: data.pageID, category: data.category};
	if(socket.user.type == 'admin')
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
			if(logging.mongo)
				logging.log(msg);
		});		
	else
		socket.sendCommand('articlePushed', {msg:'Sorry, only Thilly can submit new content at this time'});
}

/** */
function constructVote(data, socket, exception){
	if(logging.trace)
		logging.log('In constructVote');
	
	var commentObj = {'pID':data.pageID, 'cID':data.commentID};
	var query = {userID:data.userID, '$or':[{'upVotes':{'$elemMatch':commentObj}}, {'downVotes':{'$elemMatch':commentObj}}]};
	var projection = {projection:{_id:0, 'downVotes':1, 'upVotes':1}};
	
	mongo.select('user', query, projection, function(error, result){//see if changing a vote
		if(error)
			logging.log(error);
		if(logging.trace)
			logging.log('votequery returned: ' + JSON.stringify(result));
		if(result.length > 0){
			result = result[0];
			console.log(result);
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
	if(logging.trace)
		logging.log('In recordVote');
		
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
			logging.log(error);
		if(logging.trace)
			logging.log('vote recorded: ' + modify*userData.vote);
		
		recordPoints(userData, modify);
			
	});
}

/** */
function recordPoints(userData, modify){

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
				logging.log(error);
			if(logging.trace)
				logging.log(coll + ' points recorded for user: ' + userData.commenter);
		
		});
		
	mongo.update(coll, query, update, {w:1}, function(error, result){
			if(error)
				logging.log(error);
			if(logging.trace)
				logging.log(coll + ' points recorded for comment:' + userData.commentID);
	});
}

/** */
function getComments(data, socket, exception){
	if(logging.trace)
		logging.log('In getComments: ' + data.pageID + ':' + data.userName);
	if(data.userName)
		getVotes(data, socket, exception);

			
	mongo.select('comment', {pageID:data.pageID}, {projection : {}}, function(error, result){
		socket.sendCommand('getComments', {value:result, id:data.pageID});
	});
}

/** */
function getVotes(data, socket, exception){
	if(logging.trace)
		logging.log('In getVotes: ' + data.pageID + ':' + data.userName);
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
	if(logging.trace)
		logging.log('In getPageDetails: ' + JSON.stringify(data));
	
	mongo.select('content', {pageID:data.pageID, category: data.category}, {projection : {}}, function(error, result){
		socket.emit('getPageDetails', result);
	});
}

/** */
function getPageIDs(data, socket, exception){
	if(logging.trace)
		logging.log('In getPageIDs');
		
	mongo.select('content', {pageID:{$ne:"00000001template"}}, {projection : {pageID:-1, category: 1}, sort:{pageID: -1}}, function(error, result){
		socket.sendCommand('pageIDs', result);
	});
}

/** */
function getTemplate(data, socket, exception){
	if(logging.trace)
		logging.log('In getTemplates');
		
	mongo.select('content', {category:'template'}, {projection : {}, sort:{pageID: -1}}, function(error, result){
		socket.emit('gotTemplate', result);
	});

}

/** */
function getPages(data, socket, exception){
	if(logging.trace)
		logging.log('In getPages:' + JSON.stringify(data));
		
	var callBack = function(error, result){
		if(logging.mongo)
			logging.log('returned from select: ' + result.length);
		socket.sendCommand('getPages', result);
	};
	
	var query = {};
	var options = {
		projection: {},
		sort:{pageID: -1}
	};

	if(typeof(data.article) == 'object'){
		query.pageID = {$nin: data.article};
		query.category = {$ne:'template'}
	}
	else if(typeof(data.article) == 'string'){
		query.pageID = data.article;
	}
	if(data.state != 'home')
		query.category = data.state;
		
		mongo.select('content', query, options, callBack);	
}

