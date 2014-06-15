/**
 * logging.js
 *		This file is a list of constants that represent different logging flags within the server
 *	If any are checked true, the messages associated with that category will be logged/displayed accordingly.
 *	@author Nicholas 'Thilly' Evans
 */

/** */
var flags = {
	debug		:	true,//a flag for watching current area of work
	display		:	true,//a flag for dislaying current logging
	errors		:	true,//a flag for watching common errors
	files		:	false,//a flag for watching file i/o
	log			:	log,//a function to place logs into current log file
	logging		:	false,//a flag for writing the log to a file
	mongo		:	true,//a flag for watching any mongo actions
	port		:	80,//the port the server will be listening on
	socketIO 	:	false,//a flag for watching socket.io messages
	sockets		:	true,//a flag for watching socket events
	trace		: 	true//a flag for watching the flow of the program
};  
 
/** */  
module.exports = flags;  
 
/** */ 
var files = require('./thillyFiles.js');
	files = new files(flags);

/** */
var fileName =  './Logging/' + getTimeStamp() + 'serverLog.log';
if(flags.logging)
	files.writeFile(fileName, 'Started Server log: ' + new Date().toString());

/** */  
function log(logString)
{
	if(this.display)
		console.log(logString);
	if(this.logging)
		files.appendLog(fileName, '\n' + getTimeStamp() + '\t' + logString);
}

/** */  
function getTimeStamp()
{
	var dateStamp = new Date();
	var dateString = (dateStamp.getDate() > 8)?(dateStamp.getDate()):('0'+dateStamp.getDate());
	dateString += (dateStamp.getHours() > 9)?(dateStamp.getHours()):('0'+dateStamp.getHours());
	dateString += (dateStamp.getMinutes() > 9)?(dateStamp.getMinutes()):('0'+dateStamp.getMinutes());
	dateString += (dateStamp.getSeconds() > 9)?(dateStamp.getSeconds()):('0'+dateStamp.getSeconds());
	return dateString;
}

