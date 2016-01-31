/**
*/
var loggingFlags = {
	files: false,
	errors: false,
	trace: false,
	server: false,
};
/**
*/
var logging = {
	trace: function(message){ logMessage('trace', message)},
	error: function(message){ logMessage('error', message)},
	files: function(message){ logMessage('files', message)},
	server: function(message){ logMessage('server', message)}
};

/**
*/
function logMessage(flag, message){
	if(loggingFlags[flag]) {
		console.log(message)
	}
}

/** */
module.exports = function(loggingFlag) {
    if (loggingFlag) {
        loggingFlags.errors = loggingFlag & 1;
        loggingFlags.files  = loggingFlag & 2;
        loggingFlags.trace  = loggingFlag & 4;
        loggingFlags.server  = loggingFlag & 8;
    }
	return logging;
};//end of module.export