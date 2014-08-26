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
		'coll': data.path.split('.')[0]
	};
	
	var selection = {};
	
	mongo.select(path, {path:data.path}, {}, function(error, result){
		if(error)
			socket.sendCommand(data.command, false);
		else
			socket.sendCommand(data.command, result[0] || {});
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
			socket.sendCommand(data.command, false);
		else
			socket.sendCommand(data.command, true);
	});
}

function getDBs(data, socket, exception){
	logging.log.trace('in getDBs');
	
	var response = mongo.getDBNames();
	socket.sendCommand(data.command, response);
};

function getCollections(data, socket, exception){
	logging.log.trace('in getCollections: ' + data.db);
	
	var response = mongo.getCollectionNames(data.db);
	socket.sendCommand(data.command, response);
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
		socket.sendCommand(data.command, result[0]);
	});
}