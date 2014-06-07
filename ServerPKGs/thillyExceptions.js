
/** */
var logging = require('./thillyLogging.js');

/** */
function UtilityException(msg){
	if(logging.trace)
		logging.log('in UtilityException');
	this.message = msg;
	this.name = 'Utility Exception';
}

/** */
function ErrorCallBack(error, data, callBack){
	if(logging.trace)
		logging.log('in ErrorCallBack');	
	if(error)
	{
		if(logging.errors)
			logging.log(error)
	}
	else
		callBack(data);
}

/** */
module.exports = {
	Utility : UtilityException,
	ErrorHandle	: ErrorCallBack
};