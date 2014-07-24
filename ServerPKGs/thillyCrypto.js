/** */
var crypto = require('crypto');
var logging = {};

/** */
module.exports = function(logObject){
	logging = logObject;

	return{
		createHash : createHash
	};
};//end of module.export

/** */
function createHash(toHash){
	logging.log.trace('in createHash');
	var hashed = crypto.createHash('sha256');
	hashed.write(toHash, 'utf8');
	return hashed.digest('base64');
}