/** */
var logging, files, mongo;

/** */
var memoryCache = [];

/** */
module.exports = function(deps){

	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
	
	/** */
	return {
		startLogging	:	startLogging,
		startMemory		:	startMemory,
		stopMemory		:	stopMemory,
		getFlags		:	getFlags,
		updateFlag		:	updateFlag
	};
};

/** */
function startLogging(data, socket, exception){
	logging.log.trace('In startLogging');
	socket.emit('startLogging', logging.getLogCache());
	socket.join('logging');
};

/** */
function getFlags(data, socket, exception){
	logging.log.trace('in getFlags');
	socket.emit('getFlags', logging.getFlags());

}

/** */
function updateFlag(data, socket, exception){
	logging.log.trace('In updateFlags: ' + data);	
	logging.setFlags(data);
}

/** */
function stopMemory(data, socket, exception){
	logging.log.trace('In stopMemory: ' + data);		
	socket.leave('memory');
	logging.stopMemory();
}

/** */
function startMemory(data, socket, exception){
	logging.log.trace('In startMemory: ' + data);	
	logging.startMemory(socket);
	socket.join('memory');
}


