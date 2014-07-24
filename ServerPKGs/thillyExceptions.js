
/** */
var logging = {};

/** */
function utilityException(msg){
	logging.log.trace('In UtilityException');
	this.message = msg;
	this.name = 'Utility Exception';
	logging.log.errors(msg);
}

/** */
function errorCallBack(error, data, callBack){
	logging.log.trace('in ErrorCallBack');	
	if(error)
	{
		logging.log.errors(error)
	}
	else
		callBack(data);
}

/** */
module.exports = function(logObject){
	logging = logObject;

	return{
		utilityException : utilityException,
		errorHandle	: errorCallBack
	};
};//end of module.export