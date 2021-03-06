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
var loggingListener = false;

/** */
const KB = 1024;
const MB = 1024*1024;
const memoryInterval = 2000;
var memoryTimer = false;
var memoryCache = [];

/** */
var logs = {
	contest		: 	function(msg){log('contest', msg);},
	//a flag for watching the flow of submissions
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
	contest		:	false,
	//a flag for watching the contest submissions
	debug		:	false,
	//a flag for watching current area of work
	display		:	true,	
	//a flag for displaying current logging
	errors		:	true,	
	//a flag for watching for errors
	files		:	false,
	//a flag for watching file i/o
	logging		:	true,	
	//a flag for writing the log to a file
	mongo		:	true,	
	//a flag for watching any mongo actions
	memory		:	false,	
	//a flag for logging memory usage
	socketIO 	:	false,	
	//a flag for watching socket.io messages
	sockets		:	false,
	//a flag for watching socket events
	trace		: 	false
	//a flag for watching the flow of the program, basically debug flag
};

/** */
var dontLog = {
	trace : true	
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
		startMemory : startMemory,
		stopMemory  : stopMemory,
		stopLogging	: stopLogging,
		environment	: options.environment || 'test',
		homeDomain 	: options.homeDomain || 'http://192.168.1.50',
		port 		: options.port || 80
	};
	
	files = require('./thillyFiles.js');
	files = new files(thisObj);
	
	fileName =  './Logging/' + thisObj.environment + '' + getTimeStamp().replace(/:/g,'') + 'serverLog.log';
	logs.files('Started Server log: ' + new Date().toString());
	
	if(flags.memory)
		startMemory();
	
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
		if(flags.logging && !dontLog[flag]){
			files.appendLog(fileName, '\n' + getTimeStamp() + ':\t' + logString);
		}
		cache.push(logString);
		if(cache.length > 150)
			cache.shift();
		if(loggingListener)
			loggingListener.to('logging').emit('command', {command: 'log0', value:logString});//refactor to proper method
	}
}

/** */
function getFlags(){
	logs.trace('in getFlags');
	return flags;
}

/** */
function getLogCache(){
	logs.trace('in getLogCache');
	return cache;
}

/** */
function getMemoryCache(){
	logs.trace('in getMemoryCache');
	return memoryCache;
}

/** */
function setLoggingListener(socketChannel){
	logs.trace('in setLoggingListener');
	loggingListener = socketChannel;
}

/** */
function setFlags(newFlags){
	logs.trace('in setFlags: ' + newFlags.length);
	for(var eachFlag in newFlags)
		setFlag(eachFlag, newFlags[eachFlag]);
}

/** */
function logMemory(memoryStep, lastMemory){
	logs.trace('in logMemory');
	memoryCache.push(memoryStep);
	if(memoryCache.length > 100)
		memoryCache.shift();
	if(loggingListener)
		loggingListener.to('memory').emit('command', {command: 'memory0', value:memoryStep});//refactor to proper method
		
	if(flags.display)//if want to see the server memory in the log
	{
		var outputMsg = '';
		if(lastMemory.rss == 0)//otherwise it's the first allocation of memory
		{
			outputMsg += 'HU:' + memoryStep.heapUsed/MB + 'MB to start\n';
			outputMsg += 'TH:' + memoryStep.heapTotal/MB + 'MB to start\n';
			outputMsg += 'RS:' + memoryStep.rss/MB + 'MB to start';
		}
		else if(memoryStep.heapUsed - lastMemory.heapUsed < 0)//if memory dropped, garbage collection happened
		{
			outputMsg += 'HU:' + memoryStep.heapUsed/MB + 'MB after GC\n';
			outputMsg += 'TH:' + memoryStep.heapTotal/MB + 'MB after GC\n';
			outputMsg += 'RS:' + memoryStep.rss/MB + 'MB afterGC';
		}
		else//if not first or GC, report as change
		{
			outputMsg += 'HU:' + (memoryStep.heapUsed - lastMemory.heapUsed)/KB + 'KB change\n';
			outputMsg += 'TH:' + (memoryStep.heapTotal - lastMemory.heapTotal)/KB + 'KB change\n';
			outputMsg += 'RS:' + (memoryStep.rss - lastMemory.rss)/KB + 'KB change';
		}
		log(true, outputMsg);
	}
}

/** */
function setFlag(flag, value){
	logs.trace('in setFlag: ' + flag + ':' + value);
	if(typeof flags[flag] != 'undefined'){
		log(true, 'setting: ' + flag + ' to ' + value);
		flags[flag] = value;
	}
}

/** */  
function getTimeStamp(){
	logs.trace('in getTimeStamp');
	var dateStamp = new Date();
	var dateString = '' + ((dateStamp.getDate() > 8)?(dateStamp.getDate()):('0'+dateStamp.getDate()));
	dateString += ':' + ((dateStamp.getHours() > 9)?(dateStamp.getHours()):('0'+dateStamp.getHours()));
	dateString += ':' + ((dateStamp.getMinutes() > 9)?(dateStamp.getMinutes()):('0'+dateStamp.getMinutes()));
	dateString += ':' + ((dateStamp.getSeconds() > 9)?(dateStamp.getSeconds()):('0'+dateStamp.getSeconds()));
	return dateString;
}

/** */
function stopMemory(){
	logs.trace('in stopMemory');
	clearInterval(memoryTimer);
	memoryTimer = false;
}

/** */
function stopLogging(){
	logs.trace('in stopLogging');
	//if anything for cleanup needs to happen
}

/** */
function startMemory(socket, command){
	logs.trace('in startMemory');
	flags.memory = true;
	if(socket)
		socket.sendCommand(command, memoryCache);
	if(memoryTimer == false){	
		var lastMemory = {
					rss: 0,
					heapUsed: 0,
					heapTotal: 0
					};

		memoryTimer = setInterval(function(){
			var myMem = process.memoryUsage();
			if(flags.memory)
				logMemory(myMem, lastMemory);
			lastMemory = myMem;
		}, memoryInterval);
	}
	
}

