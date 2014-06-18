/** thillyMongo.js
 * @module thillyMongo
 * @author Nicholas 'Thilly' Evans
 * @description My personal library for eventually managing mongo stuff related to thilly.net
 */

/** */
var mongo;

/** */ 
var logging;

/** */
var contentCollection;

/** */
var commentCollection;

/** */
var userCollection;

var collectionMap = {};

var toExport = {
	'select'			:	select
};

/** */
module.exports = function(logObject, callBack){
	mongo = require('mongodb').MongoClient;
	logging = logObject;
	init(callBack);
	return toExport;
};
/*
	Public
*/

/** */
function select(collection, query, options, callBack){
	if(logging.trace)
		logging.log('in select');
		
	collectionMap[collection].find(query, options.projection, function(error, cursor){
		if(options.skip)
			cursor = cursor.skip(options.skip);
		if(options.limit)
			cursor = cursor.limit(options.limit);
		cursor.toArray(function(error, result){
			if(logging.mongo)
			{
				if(error)
					logging.log('error in select: ' + error);
				else
					logging.log('select completed: ' + result.length);
			}
			if(error)
				new DBException(error, callBack);
			else if(result)
				callBack(error, result);	
		});
	});
}

/*
	Private
*/

/** */
function init(callBack){
	if(logging.trace)
		logging.log('in init');

	mongo.connect('mongodb://localHost:27017/thillyNet', function(error, dataBase){
		if(logging.mongo)
		{
			if(error)
				logging.log('not connected to thillyNet: ' + error);
			else
				logging.log('connected to thillyNet');
		}
		if(error)
			new DBException(error, callBack);
		else
		{
			dataBase.createCollection('content', function(error, content){
				contentCollection = content;
				dataBase.createCollection('comment', function(error, comment){
					commentCollection = comment;
					dataBase.createCollection('user', function(error, user){
						userCollection = user;
						mongo = dataBase;
						collectionMap =	{
							'users' 	:	userCollection,
							'comment'	:	commentCollection,
							'content'	:	contentCollection
						};
						if(typeof(callBack) == 'function')
							callBack();
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
function isLogging(testCallBack){
	if(typeof(callBack) == 'function')
		return {w:1}
	else
		return {w:0}
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




/* thillyNet schema

	thillyNet{//database
		content{//collection
		//	_id: number,				(auto applied page _id)
			pageID: number,				(date time stamp: 201406140)
			title: text,				(title of the article)
			content: bigText,			(html of article)
			pictures: imgSrc[],			(array of sources: [img1.png, img2.png, ... ])
		},
		comment{//collection
		//	_id: number,				(auto applied comment _id)
			pageID: number,				(date time stamp of page comment is on: 201406140)
			commentText: bigText,		(plain text of article)
			date: text, 				(date time stamp of comment: 14 June 2014 : 21:13PM)
			replyTO: number,			(0: root comment to article; other: nested comment)
			points: number,				(total of votes on comment)	
			userID: text,				(submitter)
		},
		user{//collection
		//	_id: number,				(auto applied user _id)
			userID: text,				(user choice, 'Some Random' for guest)
			password: text,				(password, hashed)
			votes: {commentID, vote}[],	(array of votes: [{commentID, 1}, {commentID, -1}, ... ])
			points: number				(total comment points user earned)
		}
	}
*/

/*
	generalize the mongo functions, take command: 'mongo'
		data.type = 'update', 'find', 'insert'
		and data.select = {field:param, field2:param2, ...},//the query ('find' + 'update')
			'find' has, data.find = {field:1, field2:1, ...},//the shape
			'update' has, data.update = {field:value, field2:value2, ...}//the content
			'insert' has, data.insert = {field:value, field2:value2, ...}//the content

	all remove functions specific programmed,
		userCollection.remove({user:name}), yadda
*/



