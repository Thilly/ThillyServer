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
		'getOneDocument' : getOneDocument,
		'pushSchema' :	pushSchema,
		'getSchema' :	getSchema
	};
};

function getSchema(data, socket, exception){
	var path = {
		'db': 'schema',
		'coll': data.split('.')[0]
	};
	
	var selection = {};
	
	mongo.select(path, {path:data}, {}, function(error, result){
		if(error)
			socket.emit('getSchema', false);
		else
			socket.emit('getSchema', result[0] || {});
	});
}

function pushSchema(data, socket, exception){

	var path = {
		'db': 'schema',
		'coll': data.path.split('.')[0]
	};
	
	var selection = {
		'path': data.path
	};
	
	var query = {
		'pattern': data.pattern,
		'description':data.description,
		'value' : data.value,
		'readonly': data.readonly
	};
	
	var options = {upsert: true};

	mongo.update(path, selection, query, options, function(error, result){
		if(error)
			socket.emit('pushSchema', false);
		else
			socket.emit('pushSchema', true);
	});
}

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
	var path = {
		'db': data.db,
		'coll':data.coll
	};
	
	var queryData = {};
	var options = {
		projection: {},
		limit: 1
	};

	mongo.select(path, queryData, options, function(error, result){
		console.log(result);
		socket.emit('getOneDocument', result[0]);
	});
}