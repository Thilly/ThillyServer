/** thillyFiles.js
 * @module thillyMongo
 * @author Thilly
 * @description My personal library for eventually managing mongo stuff related to thilly.net v5
 */

var mongo = require('mongodb').MongoClient;
var logging;
var dataBase = false;

var contentCollection;
var commentCollection;
var userCollection;

/** */
module.exports = function(logObject){
	
	logging = logObject;
	
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
function addArticle(contents, pictures, callBack){
	if(logging.trace)
		logging.log('in addArticle');
		
	contentCollection.insert(
		{
			//_id		:	auto applied,
			'pageID'	: 	dateTimeStamp(),
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

/*

thillyNet schema (maybe?)

thillyNet{//database
	content{//collection
		_pageID: number,			(date time stamp: 201406140)	
		content: bigText,			(html of article)
		pictures: imgSrc[],			(array of sources: [img1.png, img2.png, ... ])
	},
	comment{//collection
	//	_commentID: number,			(auto applied comment _id)
		pageID: number,				(date time stamp of page comment is on: 201406140)
		commentText: bigText,		(plain text of article)
		date: text, 				(date time stamp of comment: 14 June 2014 : 21:13PM)
		replyTO: number,			(0: root comment to article; other: nested comment)
		points: number,				(total of votes on comment)	
		userID: text,				(submitter)
	},
	user{//collection
		_userID: text,				(user choice, 'Some Random' for guest)
		password: text,				(password, hashed)
		votes: {commentID, vote}[],	(array of votes: [{commentID, 1}, {commentID, -1}, ... ])
		points: number				(total comment points user earned)
	}
}



*/

