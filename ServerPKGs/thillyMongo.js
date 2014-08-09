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
				callBack(error, result);	
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

/* thillyNet schema, its a moving target

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
			contest: {
				subs: [], 				(array of tries: indexes of submissions, array of results: indexes of successes)
				results:[]
			} 
			upVotes: [{}],				(array of votes: [{pageID: commentID} ... ])
			downVotes: [{}], 			''
			points: number,				(total comment points user earned)
			type: string				(type of user: (admin, standard, moderator))
		}
		
		challenge{//collection
		//	_id: number,				(auto applied challenge _id)
			name: text,					(name of content or problem)
			content: text,				(actual content of problem or challenge related content)
			submissions: {
				success: []				(_ids of submissions for each problem)
				fail:	[]
			}
			test:text,					(test data of problem)
			answer:text,				(answer data of problem)
		}
		
		submission{//collection
		//	_id: number,				(auto applied submission _id)
			content:
			result:	
		}
*/