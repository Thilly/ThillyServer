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
		codeSubmission : function(data, socket, exception){codeSubmission(data, socket, exception);}
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
	logging.log.trace('in getProblems');
	//mongo query {'challenge',{}, {projection:{_id:0, problemNames:1}}}
	socket.emit('getProblems', ['name1', 'name2', 'name3']);
}

function getProblem(data, socket, exception){
	logging.log.trace('in getProblems');
	//mongoQuery {'challenge'}, {problemName:data.name}, {projection:{_id:0, problemText:1}}
	socket.emit('getProblem', {problemText:'Not hooked up yet, still working on the content management so I can easily manage the problems'})

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







