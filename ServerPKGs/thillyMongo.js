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
var contentCollection;

/** */
var commentCollection;

/** */
var userCollection;

/** */
var challengeCollection;

/** */
var submissionCollection;

/** */
var collectionMap = {};

/** */
var toExport = {
	'select'	:	select,
	'insert'	:	insert,
	'update'	:	update,
	'parse'		:	parse
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
function select(collection, query, options, callBack){
	logging.log.trace('in select: ' + collection);
		
	collectionMap[collection].find(query, options.projection, function(error, cursor){
		if(options.skip)
			cursor = cursor.skip(options.skip);
		if(options.limit)
			cursor = cursor.limit(options.limit);
		if(options.sort)
			cursor = cursor.sort(options.sort);
			
		cursor.toArray(function(error, result){
			if(error){
				logging.log.error('error in select: ' + error);
				new DBException(error, callBack);
			}
			else{
				logging.log.mongo('select completed: ' + result.length);
				callBack(error, result);	
			}
		});
	});
}

/** */
function insert(collection, query, options, callBack){
	logging.log.trace('in insert: ' + collection);
	collectionMap[collection].insert(query, options, function(error, result){
			if(error){
				logging.log.error('error in insert: ' + error);
				new DBException(error, callBack);
			}
			else{
				logging.log.mongo('insert completed: ' + result.length);
				callBack(error, result);	
			}
	});
}

/** */
function update(collection, selection, query, options, callBack){
	logging.log.trace('in update: ' + collection);
	var localQuery = {
		$set: query
	};
	options.multi = true;
	collectionMap[collection].update(selection, localQuery, options, function(error, result, writes){
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

/*
	Private
*/

/** */
function init(callBack){
	logging.log.trace('in init');

	mongo.MongoClient.connect('mongodb://localHost:27017/thillyNet', function(error, dataBase){
		if(error){
			logging.log.error('not connected to thillyNet: ' + error);
			new DBException(error, callBack);
		}
		else{//make into a promise, or some type of iterative process, this is getting stupid
			logging.log.mongo('connected to thillyNet');
			dataBase.createCollection('content', function(error, content){
				contentCollection = content;
				dataBase.createCollection('comment', function(error, comment){
					commentCollection = comment;
					dataBase.createCollection('user', function(error, user){
						userCollection = user;
						dataBase.createCollection('challenge', function(error, challenge){
							challengeCollection = challenge;
							dataBase.createCollection('submission', function(error, submission){
								submissionCollection = submission;
						
								mongo = dataBase;
								collectionMap =	{
									'user' 		:	userCollection,
									'comment'	:	commentCollection,
									'content'	:	contentCollection,
									'challenge'	:	challengeCollection,
									'submission':	submissionCollection
								};
								if(typeof(callBack) == 'function')
									callBack();
							});
						});
					});
				});
			});
		}
	});
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