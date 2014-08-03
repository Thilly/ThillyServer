/** */
var logging, files, mongo;

/** */
module.exports = function(deps){
	
	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
		
	return {
		getContest : function(data, socket, exception){getContest(data, socket, exception);}
	};
};


function getContest(data, socket, exception){
	logging.log.trace('in getContest');
	
	var response = {};
	
	files.readFile('./client/' + logging.environment + '/challenge/index.html', function(error, result){
		if(error)
			logging.log.errors('error in getContest: ' + error.errmsg);
		else{
			response.login = result.toString();
			files.readFile('./client/' + logging.environment + '/challenge/changeLog.txt',function(error, result){
				if(error)
					logging.log.errors('error in getContest: ' + error.errmsg);
				else{
					response.change = result.toString();
					socket.emit('getContest', response);
				}
			});
		}
	});
}