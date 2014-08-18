/** thillyMongo.js
 * @module thillyMongo
 * @author Nicholas 'Thilly' Evans
 * @description My personal library for eventually managing mongo stuff related to thilly.net
 */

/** */
var mongo;

/** */
var objectID;

/** */
var logging = {};

/** */
var dbMap = {}
/*	DBname : {
		db : dataBase, 
		collectionName1 : collection1,
		collectionName2 : collection2,
		...
		}
*/

var hiddenDB = {
	'schema' : true,
	'admin' : true,
	'local' : true
};

/** */
var toExport = {
	'select'	:	select,
	'insert'	:	insert,
	'update'	:	update,
	'parse'		:	parse,
	'getDBNames':	getDBNames,
	'getCollectionNames': getCollectionNames
};

/** */
module.exports = function(logObject, callBack){
	mongo = require('mongodb');
	objectID = mongo.ObjectID;
	logging = logObject;
	init(callBack);
	return toExport;
};

/*
	Public
*/

/** */
function parse(objectString){
	return new objectID(objectString);
}

/** */
function select(path, query, options, callBack){
	logging.log.trace('in select: ' + path.db + ':' + path.coll);
	if(assertMapping(path.db, path.coll)){
		if(!options.projection)
			options.projection = {};
		var coll = dbMap[path.db][path.coll];
		coll.find(query, options.projection, function(error, cursor){
			if(options.skip)
				cursor = cursor.skip(options.skip);
			if(options.limit)
				cursor = cursor.limit(options.limit);
			if(options.sort)
				cursor = cursor.sort(options.sort);
				
			cursor.toArray(function(error, result){
				if(error){
					logging.log.errors('error in select: ' + error);
					new DBException(error, callBack);
				}
				else{
					logging.log.mongo('select completed: ' + result.length);
					callBack(error, result);	
				}
			});
		});
	}
	else
		DBException('unable to assert mapping of: ' + path.db + ':' + path.coll, callBack);
}

/** */
function insert(path, query, options, callBack){
	logging.log.trace('in insert: ' + path.coll);
	if(assertMapping(path.db, path.coll)){
		var coll = dbMap[path.db][path.coll];
		coll.insert(query, options, function(error, result){
			if(error){
				logging.log.errors('error in insert: ' + error);
				new DBException(error, callBack);
			}
			else{
				logging.log.mongo('insert completed: ' + result.length);
				callBack(error, result);	
			}
		});
	}
	else
		DBException('unable to assert mapping of: ' + path.db + ':' + path.coll, callBack);
}

/** */
function update(path, selection, query, options, callBack){
	logging.log.trace('in update: ' + path.coll);
	var localQuery = {
		$set: query
	};
	if(query['$addToSet'] || query['$pull'] || query['$inc'])//if query has set breaking options
		localQuery = query;
		
	options.multi = true;
	if(assertMapping(path.db, path.coll)){
		var coll = dbMap[path.db][path.coll];
		coll.update(selection, localQuery, options, function(error, result, writes){
			if(error){
				logging.log.errors('error in update: ' + error);
				new DBException(error, callBack);
			}
			else{
				logging.log.mongo('update completed: ' + result + ': ' + JSON.stringify(writes));
				callBack(error, result, writes);	
			}
		});
	}
	else
		DBException('unable to assert mapping of: ' + path.db + ':' + path.coll, callBack);
}

/** */
function getDBNames(){
	logging.log.trace('in getDBNames');
	
	var names = [];
	for(var eachDB in dbMap){
		if(!hiddenDB[eachDB])
			names.push(eachDB);
	}
	
	return names;
}

/** */
function getCollectionNames(dbName){
	logging.log.trace('in getCollectionNames: ' + dbName);
	
	if(dbMap[dbName]){
		var colls = [];
		for(var eachColl in dbMap[dbName]){
			if(eachColl != 'db' && eachColl != 'system.indexes')
				colls.push(eachColl);
		}
		
		return colls;
	}
	else
		return [];
}

/*
	Private
*/
	//create map to DBs
	//for each DB, 
		//add map to collections
		//keep for dynamic queries on any db/collection pair
		//add functions to create DBs and Collections on fly
/** */
function mapDBs(dataBase, callBack){

	dataBase.admin().listDatabases(function(error, database){
		database = database.databases;
		for(var i = 0; i < database.length; i++){
			logging.log.mongo('DB found: ' + database[i].name);
			var last = (i == database.length-1);
			(function(name, loc, end){//capture current values with IIFE
				mongo.MongoClient.connect(loc, function(error, aDB){
					dbMap[name] = {//map each db to its own object
						'db' : aDB,
					}; 
					aDB.collections(function(error, colls){
						for(var j = 0; j < colls.length; j++){
							logging.log.mongo('mapping collection ' + colls[j].collectionName + ' to ' + name);
							//add each collection to it's corresponding db object
							dbMap[name][colls[j].collectionName] = colls[j];	
						}
						if(end)//if last DB mapped, carry on
							callBack();
					});
				});
			})(database[i].name, 'mongodb://localHost:27017/' + database[i].name, last);	
		}
	});	
}

/** */
function init(callBack){
	logging.log.trace('in init');
	
	//gotta connect to something to get started with it
	mongo.MongoClient.connect('mongodb://localHost:27017/thillyNet', function(error, dataBase){
		if(error){
			logging.log.errors('not connected to thillyNet: ' + error);
			new DBException(error, callBack);
		}
		else{
			logging.log.mongo('connected to thillyNet');
			mapDBs(dataBase, function(){
				logging.log.mongo('DB mapping complete');
				if(typeof(callBack) == 'function')
					callBack();
			});
		}
	});
}

/** */
function assertMapping(dbName, collName){
	if(dbMap[dbName])
		if(dbMap[dbName][collName])
			return true;
	
	return false;
}

/** */
function DBException(msg, callBack){
	this.msg = msg;
	this.name = 'DBException';
	if(typeof(callBack) == 'function')
	{
		callBack(this, '');
		return;
	}
	else
		return this;
}

/** */
function dateTimeStamp(type){
	var date = new Date();
	var year = date.getFullYear();
	var month = (date.getMonth() + 1);
		if(month < 10)
			month = '0' + month;
	var day = date.getDate();
		if(day < 10)
			day = '0' + day;
	var dateString = '' + year + month + day;
	if(type === 'full')
	{
		var hour = date.getHours();
		if(hour < 10)
			hour = '0' + hour;
		var minute = date.getMinutes();
		if(minute < 10)
			minute = '0' + minute;
		var seconds = date.getSeconds();
		if(seconds < 10)
			seconds = '0' + seconds;
		dateString += '' + hour + minute + seconds;	
	}
	return dateString;
}