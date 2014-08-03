

/** */
var logging, files, mongo;

/** */
module.exports = function(deps){
	
	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
		
	return {
		updatePage 		:	function(data, socket, exception){ updatePage(data, socket, exception);},
		commentVote		:	function(data, socket, exception){ commentVote(data, socket, exception);},
		picUpload		:	function(data, socket, exception){ picUpload(data, socket, exception);},
		pushNewArticle	:	function(data, socket, exception){ pushNewArticle(data, socket, exception);},
		pushNewComment	:	function(data, socket, exception){ pushNewComment(data, socket, exception);},
		getComments		:	function(data, socket, exception){ getComments(data, socket, exception);},
		getTemplate		:	function(data, socket, exception){ getTemplate(data, socket, exception);},
		getPages		:	function(data, socket, exception){ getPages(data, socket, exception);},
		getPageIDs		:	function(data, socket, exception){ getPageIDs(data, socket, exception);},
		getPageDetails	:	function(data, socket, exception){ getPageDetails(data, socket, exception);}	
	};
};

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
function picUpload(data, socket, exception){
	logging.log.trace('In picUpload: ' + data.name);
	var fileName = 'client/source/images/' + data.name;
	files.writeFile(fileName, data.file, function(error, file){
		if(error)
			logging.log.errors('error in picUpload: ' + error);
		else
		{
			var filePath = file.replace('client/source/','');
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
function commentVote(data, socket, exception){
	logging.log.trace('In commentVote');
	
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
