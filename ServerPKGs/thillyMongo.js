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
var logging;

/** */
var contentCollection;

/** */
var commentCollection;

/** */
var userCollection;

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
	if(logging.trace)
		logging.log('in select: ' + collection);
		
	collectionMap[collection].find(query, options.projection, function(error, cursor){
		if(options.skip)
			cursor = cursor.skip(options.skip);
		if(options.limit)
			cursor = cursor.limit(options.limit);
		if(options.sort)
			cursor = cursor.sort(options.sort);
			
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

/** */
function insert(collection, query, options, callBack){
	if(logging.trace)
		logging.log('in insert: ' + collection);
	collectionMap[collection].insert(query, options, function(error, result){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in insert: ' + error);
			else
				logging.log('insert completed: ' + result.length);					
		}
		if(error)
			new DBException(error, callBack);
		else
			callBack(error, result.length);	
	});
}

/** */
function update(collection, selection, query, options, callBack){
	if(logging.trace)
		logging.log('in update: ' + collection);
	collectionMap[collection].update(selection, query, options, function(error, result, writes){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in update: ' + error);
			else
				logging.log('update completed: ' + result);					
		}
		if(error)
			new DBException(error, callBack);
		else
			callBack(error, result, writes);	
	});
}

/*
	Private
*/

/** */
function init(callBack){
	if(logging.trace)
		logging.log('in init');

	mongo.MongoClient.connect('mongodb://localHost:27017/thillyNet', function(error, dataBase){
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
							'user' 		:	userCollection,
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
			category: text,				(category of the article, standard, games, bio, etc..)
			content: bigText,			(html of article)
			pictures: imgSrc[],			(array of sources: [img1.png, img2.png, ... ])
			thumb:	imgSrc,				(a single picURL to be set as thumbnail)
			points:	number				(any upvotes the article received)
		},
		comment{//collection
		//	_id: number,				(auto applied comment _id)
			pageID: number,				(date time stamp of page comment is on: 201406140)
			commentText: bigText,		(plain text of article)
			date: text, 				(date time stamp of comment: 14 June 2014 : 21:13PM)
			commentID: number,			(id of comment, timeDateStamp)
			replyTo: number,			(0: root comment to article; other: nested comment)
			points: number,				(total of votes on comment)
			userID: text,				(submitter)
		},
		user{//collection
		//	_id: number,				(auto applied user _id)
			userID: text,				(user choice, 'Some Random' for guest)
			password: text,				(password, hashed)
			upVotes: {pageID, commentID}[],	(array of votes: [{commentID, 1}, {commentID, -1}, ... ])
			downVotes: {pageID, commentID}[], ''
			points: number,				(total comment points user earned)
			type: string				(type of user: (admin, standard, moderator))
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
