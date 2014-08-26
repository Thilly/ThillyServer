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
		stopLogging		:	stopLogging,
		startMemory		:	startMemory,
		stopMemory		:	stopMemory,
		getFlags		:	getFlags,
		updateFlag		:	updateFlag
	};
};

/** */
function startLogging(data, socket, exception){
	logging.log.trace('In startLogging');
	socket.sendCommand(data.command, logging.getLogCache());
	socket.join('logging');
}

/** */
function stopLogging(data, socket, exception){
	logging.log.trace('in stopLogging');
	socket.leave('logging');
	logging.stopLogging();
	socket.sendCommand(data.command, {});
}

/** */
function startMemory(data, socket, exception){
	logging.log.trace('In startMemory: ' + data.command);	
	logging.startMemory(socket, data.command);
	socket.join('memory');
}

/** */
function stopMemory(data, socket, exception){
	logging.log.trace('In stopMemory');		
	socket.leave('memory');
	logging.stopMemory();
	socket.sendCommand(data.command, {});
}

/** */
function getFlags(data, socket, exception){
	logging.log.trace('in getFlags');
	socket.sendCommand(data.command, logging.getFlags());
}

/** */
function updateFlag(data, socket, exception){
	logging.log.trace('In updateFlags: ' + data);	
	logging.setFlags(data);
}


