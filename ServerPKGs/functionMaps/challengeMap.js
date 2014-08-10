/** */
var logging, files, mongo;

/** */
module.exports = function(deps){
	
	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
		
	return {
		getChallenge : function(data, socket, exception){getChallenge(data, socket, exception);},
		getProblems : function(data, socket, exception){getProblems(data, socket, exception);},
		getProblem : function(data, socket, exception){getProblem(data, socket, exception);},
		codeSubmission : function(data, socket, exception){codeSubmission(data, socket, exception);},
		getContests : function(data, socket, exception){getContests(data, socket, exception);},
		getContest : function(data, socket, exception){getContest(data, socket, exception);},
		pushChallenge : function(data, socket, exception){pushChallenge(data, socket, exception);}
	};
};


function getChallenge(data, socket, exception){
	logging.log.trace('in getChallenge');
	
	var response = {};
	
	files.readFile('./client/' + logging.environment + '/challenge/challenge.html', function(error, result){
		if(error)
			logging.log.errors('error in getChallenge: ' + error.errmsg);
		else{
			response.page = result.toString();
			files.readFile('./client/' + logging.environment + '/challenge/changeLog.txt',function(error, result){
				if(error)
					logging.log.errors('error in getChallenge: ' + error.errmsg);
				else{
					response.change = result.toString();
					socket.emit('getChallenge', response);
				}
			});
		}
	});
}

function getProblems(data, socket, exception){
	mongo.select('challenge', {live:true}, {projection:{_id: 0, 'problems.name': 1, 'problems.problemDetails':1}}, function(error, result){
		if(error){
			logging.log.errors(error);
			socket.emit('getProblems', error);
		}
		else{
			logging.log.mongo('getProblems successful');
			socket.emit('getProblems', result)
		}
	})
}

function codeSubmission(data, socket, exception){
	logging.log.trace('in codeSubmission');
	console.log('code: '+data.code);
	console.log('language: '+data.language);
	console.log('problem: '+data.problem);
	
	socket.sendCommand('getSubResults', {text: 'nothing is going to happen', tone: 'good'});
	setTimeout(function(){
		socket.sendCommand('getSubResults', {text: 'told ya not hooked up yet', tone: 'error'});
		}, 1000);
	
}

function getContests(data, socket, exception){
	logging.log.trace('in getContests');
	mongo.select('challenge', {}, {projection: {contestName:1}}, function(error, result){
		if(error)
			logging.log.errors(error)
		else if(result.length > 0)
			socket.emit('getContests', result);
		else
			socket.emit('getContests', false);
	});
}

function getContest(data, socket, exception){
	logging.log.trace('in getContest');
	var projection = {};
	if(socket.user.type != 'admin'){
		projection = {_id: 0, live: 1, 'problems.name': 1, 'problems.problemDetails':1};
		console.log('applying projection');
	}
	if(data.contestName){
		console.log('querying');
		mongo.select('challenge', {contestName: data.contestName}, {projection: projection}, function(error, result){
			if(error)
				logging.log.errors(error)
			else if(result.length > 0)
				socket.emit('getContest', result);
			else
				socket.emit('getContest', false);
		});
	}
	else
		socket.emit('getContest', false);
}

function pushChallenge(data, socket, exception){
	if(socket.user.type != 'admin')
		socket.emit('pushChallenge', 'Sorry, only Thilly can submit content at this time');
	else{
		mongo.update('challenge', {contestName: data.contestName}, {live: data.live, problems:data.data}, {upsert: true}, function(error, result, writes){
			if(error){
				logging.log.errors(error);
				socket.emit('pushChallenge', error);
			}
			else{
				logging.log.mongo('pushChallenge successful: ' + result);
				socket.emit('pushChallenge', 'update successful')
			}
		});
	}
}



