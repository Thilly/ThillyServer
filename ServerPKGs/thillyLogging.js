/**
 * logging.js
 *		This file is a list of constants that represent different logging flags within the server
 *	If any are checked true, the messages associated with that category will be logged/displayed accordingly.
 *	@author Nicholas 'Thilly' Evans
 */

/** */ 
var files = {};

/** */
var cache = [];

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
	debug		:	true,
	//a flag for watching current area of work
	display		:	true,	
	//a flag for displaying current logging
	errors		:	true,	
	//a flag for watching common errors
	files		:	true,	
	//a flag for watching file i/o
	logging		:	false,	
	//a flag for writing the log to a file
	mongo		:	true,	
	//a flag for watching any mongo actions
	socketIO 	:	true,	
	//a flag for watching socket.io messages
	sockets		:	true,	
	//a flag for watching socket events
	trace		: 	true	
	//a flag for watching the flow of the program
};

/** */  
module.exports = function(options){

	var thisObj = {
		log			: logs,
		set 		: setFlag,
		flags		: flags,
		environment	: options.environment || 'test',
		homeDomain 	: options.homeDomain || 'http://174.49.168.70',
		port 		: options.port || 80
	};
	
	files = require('./thillyFiles.js');
	files = new files(thisObj);
	
	return thisObj;
};
	

/** */
var fileName =  './Logging/' + getTimeStamp() + 'serverLog.log';
logs.files('Started Server log: ' + new Date().toString());

/** */  
function log(flag, logString){
	if(flags[flag]){
		if(flags.display)
			process.stdout.write(logString + '\n');
		if(flags.logging)
			files.appendLog(fileName, '\n' + getTimeStamp() + '\t' + logString);
		cache.push(logString);
		if(cache.length > 100)
			cache.shift();
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

/** */
function setFlag(flag, value){
	if(flag)
		if(!constFlags[flag]){
			log('setting: ' + flag + ' to ' + value);
			flags[flag] = value;
		}
}