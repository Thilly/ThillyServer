thillyNet{//database

/*		content{	//collection
		//	_id: number,				(auto applied page _id)
			pageID: number,				(date time stamp: 201406140)
			category: text,				(category of the article, standard, games, bio, etc..)
			tabs: []					(array of individual tabs)
				content: bigText,			(html of article)
				title: text,				(title of the article)
			pictures: imgSrc[],			(array of sources: [img1.png, img2.png, ... ])
			thumb:	imgSrc,				(a single picURL to be set as thumbnail)
			points:	number				(any upvotes the article received)
		},
*/	
	
/*		comment{	//collection
		//	_id: number,				(auto applied comment _id)
			pageID: number,				(date time stamp of page comment is on: 201406140)
			commentText: bigText,		(plain text of article)
			date: text, 				(date time stamp of comment: 14 June 2014 : 21:13PM)
			commentID: number,			(id of comment, timeDateStamp)
			replyTo: number,			(0: root comment to article; other: nested comment)
			points: number,				(total of votes on comment)
			userID: text,				(submitter)
		},
*/
	
/*		user{		//collection
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
*/	
	
/*		challenge{	//collection
		//	_id: number,				(auto applied challenge _id)
			name: text,					(name of content or problem)
			live: boolean,				(if this problem set is active or not)
			problems: [],				(array of problem objects)
				problemDetails: text,		(actual content of problem or challenge related content)
				testCases: text,				(test data of problem)
				answer: text,				(answer data of problem)
				submissions: {}				(object containing two arrays, failures and successes)
					success: []				(_ids of submissions for each problem)
					fail: []				(_ids of submissions for each problem)
		}
*/	
	
/*		submission{	//collection
		//	_id: number,				(auto applied submission _id)
			content: text				(contents of submission)
			result:	text				(result of submission, compile error, wrong answer...)
		}
*/