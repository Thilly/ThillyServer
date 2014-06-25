/** */
var crypto = require('crypto');

/** */
module.exports = {
	createHash : createHash
};

/** */
function createHash(toHash){

	var hashed = crypto.createHash('sha256');
	hashed.write(toHash, 'utf8');
	return hashed.digest('base64');
}