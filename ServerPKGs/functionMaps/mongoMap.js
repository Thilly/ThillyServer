/** */
var logging, files, mongo;

/** */
module.exports = function(deps){

	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
	
	/** */
	return {
		'getDBs' : getDBs,
		'getCollections' : getCollections,
		'getOneDocument' : getOneDocument
	};
};


function getDBs(data, socket, exception){
	logging.log.trace('in getDBs');
	
	var response = mongo.getDBNames();
	socket.emit('getDBs', response);
};

function getCollections(data, socket, exception){
	logging.log.trace('in getCollections: ' + data);
	
	var response = mongo.getCollectionNames(data);
	socket.emit('getCollections', response);
};

function getOneDocument(data, socket, exception){
	logging.log.trace('in getOneDocument: ' + data.db + ':' + data.coll);
	mongo.genericAction('find', data.db, data.coll, {}, {limit: 1}, function(error, result){
		console.log(result);
		socket.emit('getOneDocument', result[0]);
	});


}