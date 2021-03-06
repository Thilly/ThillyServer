/** */
var logging, files, mongo;
var contestTimeout = 3 * 1000;//3 seconds
/** */
module.exports = function(deps){
	
	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
		
	return {
		getChallenge 	: getChallenge,
		getProblems 	: getProblems,
		codeSubmission 	: codeSubmission,
		getContests 	: getContests,
		getContest 		: getContest,
		pushChallenge 	: pushChallenge,
		getProblemHistory : getProblemHistory
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
					socket.sendCommand(data.command, response);
				}
			});
		}
	});
}

function getProblems(data, socket, exception){
	mongo.select({db:'thillyNet', coll:'challenge'}, {live:true}, {projection:{_id: 0, 'problems.name': 1, 'problems.problemDetails':1}}, function(error, result){
		if(error){
			logging.log.errors(error);
			socket.sendCommand(data.command, error);
		}
		else{
			logging.log.mongo('getProblems successful');
			socket.sendCommand(data.command, result)
		}
	})
}

function codeSubmission(data, socket, exception){
	logging.log.trace('in codeSubmission');
	logging.log.contest(socket.user.userID + ' submitted a problem for ' + data.problem + ' using ' + data.language);
	
	mongo.select({db:'thillyNet', coll:'challenge'},
		{'problems.name':data.problem},
		{projection:{'problems':{$elemMatch:{'name':data.problem}}, '_id':0, 'problems.problemDetails':0, 'live':0}},
		function(error, result){
			if(error)
				logging.log.mongo(error);
			else if(result.length){
				result = result[0];
				data.testData = result.problems[0];
				data.testData.contestName = result.contestName;
				startCompiler(data, socket, exception);
			}
			else
				socket.sendCommand(data.command, {text: 'Select a problem to submit', tone: 'error', last: true});
	});
}

function saveSubmission(data, socket){
	logging.log.trace('in saveSubmission');
	
	var toQuery = {
		userID : socket.user.userID,
		problem	: data.problem,
		time	: new Date().getTime()
	};

	var toPush = {
		code	: data.code,
		language : data.language,
		result 	: data.result,
		response : data.response
	};

	mongo.update({db:'thillyNet', coll:'submission'}, toQuery, toPush, {upsert:true});
}

function recordWin(data, socket){
	mongo.update({db:'thillyNet', coll:'user'}, {userID:socket.user.userID}, {$addToSet:{submissions:data.problem}}, {});
}

function getContests(data, socket, exception){
	logging.log.trace('in getContests');
	mongo.select({db:'thillyNet', coll:'challenge'}, {}, {projection: {contestName:1}}, function(error, result){
		if(error)
			logging.log.errors(error)
		else if(result.length > 0)
			socket.sendCommand(data.command, result);
		else
			socket.sendCommand(data.command, false);
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
		mongo.select({db:'thillyNet', coll:'challenge'}, {contestName: data.contestName}, {projection: projection}, function(error, result){
			if(error)
				logging.log.errors(error)
			else if(result.length > 0)
				socket.sendCommand(data.command, result);
			else
				socket.sendCommand(data.command, false);
		});
	}
	else
		socket.sendCommand(data.command, false);
}

function pushChallenge(data, socket, exception){
	logging.log.trace('in pushChallenge');
	
	if(socket.user.type != 'admin')
		socket.sendCommand(data.command, 'Sorry, only Thilly can mess with content at this time');
	else{
		mongo.update({db:'thillyNet', coll:'challenge'}, {contestName: data.contestName}, {live: data.live, problems:data.data}, {upsert: true}, function(error, result, writes){
			if(error){
				logging.log.errors(error);
				socket.sendCommand(data.command, error);
			}
			else{
				logging.log.mongo('pushChallenge successful: ' + result);
				socket.sendCommand(data.command, 'update successful')
			}
		});
	}
}

function startCompiler(data, socket, exception){
	logging.log.trace('in startCompiler');
	var compiler = require('child_process').fork('./ServerPKGs/ChildProcesses/compiler.js');
	var tooLong;
		socket.sendCommand(data.command, {text: 'Compilation beginning...', tone: 'neutral', last: false});
		compiler.send({msg: 'contestData', data:data});
	
	compiler.on('exit', function(code, signal){
		logging.log.contest('Compiler exit signal: ' + signal);
		clearTimeout(tooLong);
		if(signal == 'SIGTERM'){
			socket.sendCommand(data.command, {text: 'Submission took too long', tone: 'error', last: true});
			data.result = 'timeout';
			saveSubmission(data, socket);
		}
	});
	
	compiler.on('message', function(msg){
		if(msg.reason == 'compError'){
			socket.sendCommand(data.command, {text: msg.error, tone: 'error', last: true});
			data.message = msg.error;
			compiler.kill('SIGINT');	
		}
		if(msg.reason == 'running'){
			socket.sendCommand(data.command, {text: 'Compilation Completed, running submission...', tone: 'neutral', last: false});
			tooLong = setTimeout(function(){compiler.kill('SIGTERM');}, contestTimeout);
		}
		if(msg.reason == 'finished'){
			socket.sendCommand(data.command, {text: 'Running Completed, checking response...', tone: 'neutral', last: false});
			compiler.kill('SIGINT');
			data.response = msg.data;
			startDiffer(data, socket, exception);
		}
	});
}

function startDiffer(data, socket, exception){
	logging.log.trace('in startDiffer');
	var differ = require('child_process').fork('./ServerPKGs/ChildProcesses/differ.js');
		differ.send({answer:data.testData.answer, output:data.response});
		differ.on('message', function(msg){
			logging.log.contest(JSON.stringify(msg));	
			differ.kill('SIGINT');
			if(msg.numWrong == 0){
				socket.sendCommand(data.command, {text: 'Checking Completed, Correct Answer', tone: 'good', last: true});
				data.result = 'Correct Answer';
				recordWin(data, socket);
			}
			else{
				socket.sendCommand(data.command, {text: 'Checking Completed, Wrong Answer: ' + msg.numWrong + ' incorrect', tone: 'error', last: true});
				data.result = 'Wrong Answer';
			}
			saveSubmission(data, socket);
		});
}

function getProblemHistory(data, socket, exception){
	if(socket.user){
		mongo.select({db:'thillyNet', coll:'user'}, {userID:socket.user.userID}, {projection:{'submissions' : 1}}, function(error, result){
			if(error)
				logging.log.mongo(error)
			else{
				socket.sendCommand(data.command, result[0].submissions)
			}
		});
	}		
}

function getSubmission(data, socket, exception){
	var query = {
		userID : data.userID,
		problem : data.problemName
	};
	
	var options = {
		limit : 1,
		sort: {time: -1},
		projection: {code: 1, result: 1, response: 1}
	};
	
	mongo.select({db:'thillyNet', coll:'submission'}, query, options, function(error, result){
		if(error)
			logging.log.mongo(error);
		else
			logging.log.mongo(result);
	});
	
}
