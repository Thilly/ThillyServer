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

var toExport = {
	'getUserVotes'		:	getUserVotes,
	'getUserComments'	:	getUserComments,
	'getPageComments'	:	getPageComments,
	'getUser'			:	getUser,
	'getPages'			:	getPages,
	'addUser'			:	addUser,
	'addComment'		:	addComment,
	'addArticle'		:	addArticle
};

/** */
module.exports = function(logObject, callBack){
	mongo = require('mongodb').MongoClient;
	logging = logObject;
	init(callBack);
	return toExport;
};

/** */
function getUserVotes(userName, callBack){
	if(logging.trace)
		logging.log('in getUserVotes');
	userCollection.find({'userID':userName}, {'votes': 1}, function(error, cursor){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in getUserVotes: ' + error);
			else
				logging.log('getUserVotes completed: ' + cursor);
		}
		if(error)
			new DBException(error, callBack);
		else if(cursor)
			cursor.toArray(callBack);
	});
}

/** */
function getUserComments(userName, callBack){
	if(logging.trace)
		logging.log('in getUserComments');
	commentCollection.find({'userID':userName}, function(error, cursor){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in getUserComments: ' + error);
			else
				logging.log('getUserComments completed: ' + cursor);
		}
		if(error)
			new DBException(error, callBack);
		else if(cursor)
			cursor.toArray(callBack);
	});
}

/** */
function getPageComments(page, callBack){
	if(logging.trace)
		logging.log('in getPageComments');
	commentCollection.find({'pageID': page}, function(error, cursor){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in getPageComments: ' + error);
			else
				logging.log('getPageComments completed: ' + cursor);
		}
		if(error)
			new DBException(error, callBack);
		else if(cursor)
			cursor.toArray(callBack);
	});
}

/** */
function getUser(userName, callBack){
	if(logging.trace)
		logging.log('in getUser');
	userCollection.find({'userID':userName}, function(error, cursor){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in getUser: ' + error);
			else
				logging.log('getUser completed: ' + cursor);
		}
		if(error)
			new DBException(error, callBack);
		else if(cursor)
			cursor.toArray(callBack);
	});
}

/** */
function getPages(from, to, callBack){		
	if(logging.trace)
		logging.log('in getPages');
	 
	from = from || 0;
	to = to || 5;
	
	contentCollection.find().sort({'pageID': -1}).skip(from).limit(to-from).toArray(function(error, result){
		if(logging.mongo)
		{
			if(error)
				logging.log('error in getPages: ' + error);
			else
				logging.log('getPages completed: ' + result);
		}
		if(error)
			new DBException(error, callBack);
		else if(result)
			callBack(error, result);	
	});
}

/** */
function addUser(userObj, callBack){
	if(logging.trace)
		logging.log('in addUser');
		
	userCollection.insert(
		{
			//_id 			: auto applied,
			'userID'	: 	userObj.name,				
			'password'	: 	userObj.pass,				
			//'votes'		: 	[],	//doesn't fill in the empty array, $push to start putting stuff in
			'points'	: 	0
		},
		
		isLogging(callBack),
		
		function(error, result){
			if(logging.mongo)
			{
				if(error)
					logging.log('error in addUser: ' + error);
				else
					logging.log('addUser completed: ' + result);
			}
			if(error)
				new DBException(error, callBack);
			else if(result)
				callBack(error, result);			
		}
	);
}

/** */
function addComment(commentObj, callBack){
	if(logging.trace)
		logging.log('in addComment');
		
	commentCollection.insert(
		{
			//_id 			:	auto applied,
			'pageID'		:	commentObj.page,				
			'commentText'	:	commentObj.text,		
			'date'			:	dateTimeStamp('full'), 				
			'replyTO'		:	commentObj.reply,			
			'points'		:	1,				
			'userID'		:	commentObj.user				
		},
		
		isLogging(callBack),
		
		function(error, result){
			if(logging.mongo)
			{
				if(error)
					logging.log('error in addComment: ' + error);
				else
					logging.log('addComment completed: ' + result);
			}
			if(error)
				new DBException(error, callBack);
			else if(result)
				callBack(error, result);			
		}
	);
}

/** */
function addArticle(contents, pictures, date, callBack){
	if(logging.trace)
		logging.log('in addArticle');
		
	contentCollection.insert(
		{
			//_id		:	auto applied,
			'pageID'	: 	date || dateTimeStamp(),
			'content'	: 	contents,
			'pics'		:	pictures
		},
		
		isLogging(callBack),
		
		function(error, result){
			if(logging.mongo)
			{
				if(error)
					logging.log('error in addArticle: ' + error);
				else
					logging.log('addArticle completed: ' + result);
			}
			if(error)
				new DBException(error, callBack);
			else if(result)
				callBack(error, result);			
		}
	);
}



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

