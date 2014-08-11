/** */
var logging, files, mongo;

/** */
module.exports = function(deps){

	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
	
	return {
		startLogging	:	startLogging,
		startMemory		:	startMemory,
		getFlags		:	getFlags,
		updateFlag		:	updateFlag
	};
};

function startLogging(data, socket, exception){
	logging.log.trace('In startLogging');
	socket.emit('startLogging', logging.getLogCache());
	socket.join('logging');
};

function startMemory(data, socket, exception){
	logging.log.trace('In startMemory');	
	socket.emit('startMemory', logging.getMemoryCache());
	socket.join('memory');
};

function getFlags(data, socket, exception){
	logging.log.trace('in getFlags');
	socket.emit('getFlags', logging.getFlags());

}

function updateFlag(data, socket, exception){
	logging.log.trace('In updateFlags: ' + data);	
	logging.setFlags(data);
};

