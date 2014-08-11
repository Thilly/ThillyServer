/**
 * logging.js
 *		This file is a list of constants that represent different logging flags within the server
 *	If any are checked true, the messages associated with that category will be logged/displayed accordingly.
 *	@author Nicholas 'Thilly' Evans
 */

/** */ 
var files = {};

/** */
var fileName;

/** */
var cache = [];

/** */
var memoryCache = [];

/** */
var loggingListener = false;

/** */
var logs = {
	debug		:	function(msg){log('debug', msg);},
	//a flag for watching current area of work
	errors		:	function(msg){log('errors', msg);},	
	//a flag for watching common errors
	files		:	function(msg){log('files', msg);},	
	//a flag for watching file i/o
	mongo		:	function(msg){log('mongo', msg);},	
	//a flag for watching any mongo actions
	socketIO 	:	function(msg){log('socketIO', msg);},
	//a flag for watching socket.io messages
	sockets		:	function(msg){log('sockets', msg);},	
	//a flag for watching socket events
	trace		: 	function(msg){log('trace', msg);}
	//a flag for watching the flow of the program
};  

/** */
var flags = {
	debug		:	false,
	//a flag for watching current area of work
	display		:	true,	
	//a flag for displaying current logging
	errors		:	true,	
	//a flag for watching for errors
	files		:	false,	
	//a flag for watching file i/o
	logging		:	false,	
	//a flag for writing the log to a file
	mongo		:	true,	
	//a flag for watching any mongo actions
	memory		:	false,	
	//a flag for logging memory usage
	socketIO 	:	false,	
	//a flag for watching socket.io messages
	sockets		:	true,	
	//a flag for watching socket events
	trace		: 	true	
	//a flag for watching the flow of the program, basically debug flag
};

/** */
var thisObj = {};

/** */  
module.exports = function(options){

	thisObj = {
		log			: logs,
		getFlags	: getFlags,
		getLogCache	: getLogCache,
		getMemoryCache : getMemoryCache,
		setLoggingListener : setLoggingListener,
		setFlags	: setFlags,
		environment	: options.environment || 'test',
		homeDomain 	: options.homeDomain || 'http://174.49.168.70',
		port 		: options.port || 80
	};
	
	files = require('./thillyFiles.js');
	files = new files(thisObj);
	
	fileName =  './Logging/' + thisObj.environment + getTimeStamp() + 'serverLog.log';
	logs.files('Started Server log: ' + new Date().toString());
	
	return thisObj;
};
	
/** */  
function log(flag, logString){
	if(flag == 'memory'){
		logMemory(logString);
		return;
	}			
	if(flags[flag] || flag === true){
		if(flags.display){
			process.stdout.write(((thisObj)?(thisObj.environment + '\t'):'') + logString + '\n');
		}
		if(flags.logging){
			files.appendLog(fileName, '\n' + getTimeStamp() + ':\t' + logString);
		}
		cache.push(logString);
		if(cache.length > 100)
			cache.shift();
		if(loggingListener)
			loggingListener.to('logging').emit('log', logString);
	}
}

/** */
function getFlags(){
	return flags;
}

/** */
function getLogCache(){
	return cache;
}

/** */
function getMemoryCache(){
	return memoryCache;
}

/** */
function setLoggingListener(socketChannel){
	loggingListener = socketChannel;
}

/** */
function setFlags(newFlags){
	for(var eachFlag in newFlags)
		setFlag(eachFlag, newFlags[eachFlag]);
}

/** */
function logMemory(memoryStep){
	if(flags.memory){
		memoryCache.push(memoryStep);
		if(memoryCache.length > 100)
			memoryCache.shift();
		if(loggingListener)
			loggingListener.to('memory').emit('memory', logString);
	}
}

/** */
function setFlag(flag, value){
	if(typeof flags[flag] != 'undefined'){
		log(true, 'setting: ' + flag + ' to ' + value);
		flags[flag] = value;
	}
}

/** */  
function getTimeStamp(){
	var dateStamp = new Date();
	var dateString = (dateStamp.getDate() > 8)?(dateStamp.getDate()):('0'+dateStamp.getDate());
	dateString += (dateStamp.getHours() > 9)?(dateStamp.getHours()):('0'+dateStamp.getHours());
	dateString += (dateStamp.getMinutes() > 9)?(dateStamp.getMinutes()):('0'+dateStamp.getMinutes());
	dateString += (dateStamp.getSeconds() > 9)?(dateStamp.getSeconds()):('0'+dateStamp.getSeconds());
	return dateString;
}






