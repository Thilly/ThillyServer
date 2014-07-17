
/** */
var logging = require('./thillyLogging.js');

/** */
function UtilityException(msg){
	if(logging.trace)
		logging.log('In UtilityException');
	this.message = msg;
	this.name = 'Utility Exception';
	if(logging.errors)
		logging.log(msg);
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