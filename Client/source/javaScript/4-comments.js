window.thillyComments = {};

(function(debug){

/** 
	private comment stuff 
*/

	/** */
	var userVotes = {};//{pageID: vote[]}
	/** */
	var pageComments = {};//{pageID: comment[]}
	/** */	
	var gotVotes = false;
	/** */	
	var gotComments = false;
	
	/** */
	function commentWrapper(commentData){
		if(debug.trace)
			debug.log('in commentWrapper');
			
		var theTools = document.createElement('div');//mouse over comment box and show tools
			theTools.className = 'commentWrapper';//wrapper
		
		var userName = document.createElement('span');
			userName.className = 'commentMetadata';//name of poster
			userName.id = 'commenter'+commentData.date;
			userName.innerHTML = commentData.userID;
		
		var dateStamp = document.createElement('span');
			dateStamp.className = 'commentMetadata';
			dateStamp.innerHTML = thillyUtil.unDateStamp(commentData.date);
		
		var hide = document.createElement('span');
			hide.className = 'icon-sm minify';
			hide.title = 'hide conversation';
			hide.onclick = function(){
				if(this.className == 'icon-sm minify'){
					userName.style.display = 'none';			
					votes.style.display = 'none';
					dateStamp.style.display = 'none';
					theText.style.display = 'none';
					replyWrapper.style.display = 'none';
					replies.style.display = 'none';
					this.className = 'icon-sm expand';
					this.title = 'show conversation';
				}
				else{
					userName.style.display = 'inline';			
					votes.style.display = 'inline';
					dateStamp.style.display = 'inline';
					theText.style.display = 'block';
					replyWrapper.style.display = 'inline';
					replies.style.display = 'block';		
					this.className = 'icon-sm minify';
					this.title = 'hide coversation';
				}
			};
		
		var votes = document.createElement('span');
			votes.className = 'commentMetadata points';//points so far
			votes.setAttribute('after', (commentData.points == 1 || commentData.points == -1)?' point':' points');
			votes.id = 'commentPoints' + commentData.date;
			votes.innerHTML = ((commentData.points > 0)?'+':'')+commentData.points;
		
		var theText = document.createElement('div');
			theText.className = 'commentText';
			theText.innerHTML = commentData.commentText;

		var replyWrapper = createReplyWrapper(commentData.date, commentData.pageID);
		var replies = document.createElement('div');
			replies.id = 'replies'+commentData.date;
		
		theTools.appendChild(hide);
		theTools.appendChild(userName);
		theTools.appendChild(votes);
		theTools.appendChild(dateStamp);
		theTools.appendChild(theText);
		theTools.appendChild(replyWrapper);
		theTools.appendChild(replies);
		
		return theTools;
	}

	/** */	
	function createReplyWrapper(parentID, pageID){
		if(debug.trace)
			debug.log('in createReplies');			
		
		var specify = ((parentID == 0)?' this article':' this comment')
		
		var replyBox = document.createElement('span');
			replyBox.className = 'loggedOut';//reply || (reply as guest && login)
		
		var replyOut = document.createElement('span');
			replyOut.className = 'out';
		
		var replyOutWrapper = document.createElement('div');
		
		var replyAsGuest = document.createElement('div');
			replyAsGuest.className = 'icon reply';	
			replyAsGuest.title = 'Reply as guest to' + specify;				
				
		var replyOutTools = createReplyTools(parentID, pageID, replyAsGuest);
				replyAsGuest.onclick = function(){
					this.style.display = 'none';
					replyOutTools.style.display = 'inline-block';
				};
				
		var loginButton = document.createElement('span');
			loginButton.innerHTML = 'login';
			loginButton.className = 'inlineButton small';
			loginButton.onclick = function(){
				thillyUtil.showLogin()
			};
		
//		replyOutWrapper.appendChild(replyOutTools);
//		replyOutWrapper.appendChild(loginButton);
//		replyOut.appendChild(replyOutWrapper);
		
		replyOut.appendChild(loginButton);
		replyOut.appendChild(replyOutTools);
		replyOut.appendChild(replyAsGuest);
		
		var replyIn = document.createElement('span');
			replyIn.className = 'in';
			
		var replyInWrapper = document.createElement('div');
			
		var replyAsUser = document.createElement('div');
				replyAsUser.className = 'icon reply';
				replyAsUser.title = 'Reply to' + specify;
								
		var replyInTools = createReplyTools(parentID, pageID, replyAsUser);
				replyAsUser.onclick = function(){
					this.style.display = 'none';
					replyInTools.style.display = 'block';
				};
			
			replyInWrapper.appendChild(replyInTools);
			replyIn.appendChild(replyInWrapper);
			replyIn.appendChild(replyAsUser);
			
			
		var voteUp = document.createElement('div');
			voteUp.id = 'voteUp'+((parentID>0)?parentID:pageID);
			voteUp.title = 'Upvote' + specify;
			voteUp.className = 'icon voteUp';
			voteUp.onclick = function(){
				voteOnComment(thillyIndex.user.name, pageID, parentID, 1);
			};
			
		var voteDown = document.createElement('div');
			voteDown.id = 'voteDown' + ((parentID>0)?parentID:pageID);
			voteDown.title = 'Downvote' + specify;
			voteDown.className = 'icon voteDown';
			voteDown.onclick = function(){
				voteOnComment(thillyIndex.user.name, pageID, parentID, -1);
			}
			
		replyIn.appendChild(voteUp);
		replyIn.appendChild(voteDown);
		
		
		replyBox.appendChild(replyOut);
		replyBox.appendChild(replyIn);
		
		return replyBox;
	}

	function spriteButton(className){
		
		var theButton = document.createElement('img');
		theButton.className = 'icon ' + className;
		return theButton;	
	}
	/** */	
	function createCancelButton(replyTools, replyAs){
		var cancel = document.createElement('span');	
			cancel.className = 'inlineButton small';
			cancel.innerHTML = 'Cancel';
			cancel.onclick = function(event){
				replyTools.style.display = 'none';
				replyAs.style.display = 'inline-block';
			};
		return cancel;
	}

	/** */
	function createReplyTools(parent, id, replyAs){
		if(debug.trace)
			debug.log('in createReplyTools');
		var replyTools = document.createElement('div');
			replyTools.className = 'replyTools';
			replyTools.id = 'replyTools' + id;
			replyTools.style.display = 'none';
			
		var replyText = document.createElement('textarea');
			replyText.className = 'replyText';
			replyText.rows = "5";
			replyText.cols = "30";
			replyText.id = 'replyText' + parent;
			
		var cancelButton = createCancelButton(replyTools, replyAs)
		
		var submitButton = document.createElement('span');
			submitButton.className = 'inlineButton small';
			submitButton.innerHTML = 'Submit';
			submitButton.onclick = function(){ 
				var commentData = {
					pageID: id,
					commentText: replyText.value,
					date: thillyUtil.dateTimeStamp('full'),
					replyTo: parent,
					points: 1,
					userID: thillyIndex.user.name || 'some random'				
				};
				if(commentData.commentText.trim().length > 0)
					submitComment(commentData, cancelButton);
			};
		
		replyTools.appendChild(replyText);
		replyTools.appendChild(cancelButton);
		replyTools.appendChild(submitButton);
		
		return replyTools;
	}

	/** */	
	function voteOnComment(userID, pageID, commentID, upDown){
		if(debug.trace)
			debug.log('in voteOnComment: ' + commentID + ' : ' + pageID);
		var obj = {
			userID: userID,
			pageID: pageID,
			commentID: commentID,
			vote: upDown,
			commenter: ((commentID > 0)?document.getElementById('commenter'+commentID).innerHTML:'')
		};
			thillyUtil.send(thillyIndex.mainSocket,'commentVote', obj);
			placeAVote(commentID, pageID, upDown, true);	
	}

	/** */	
	function submitComment(commentData, close){
		//send comment data to server for mongo saving
		if(debug.trace)
			debug.log('in submitComment');
		thillyUtil.send(thillyIndex.mainSocket,'pushNewComment', commentData);
		close.click();
		
		var container;
		if(commentData.replyTo == 0)
			container = document.getElementById('commentContainer' + commentData.pageID);
		else
			container = document.getElementById('replies'+commentData.replyTo);
			
		container.appendChild(commentWrapper(commentData));
		thillyState.loggedIn();
		thillyInteraction.reScale();
	}

	/** */	
	function getComments(pageID, container){
		//check local cache first, clear on msg from server
		//sort by date, get sorted by date w.e
		//shove into map, 
		//genHTML from map,
		//putHTML into article
		if(debug.trace)
			debug.log('in getComments: ' + pageID);
		
		var commentObj = {
			pageID: pageID.split(' ')[0],
			category: pageID.split(' ')[1],
			userName: (thillyState.checkLogged())?thillyIndex.user.name:false
		};
		
		gotVotes = false;
		gotComments = false;

		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getComments', commentObj, function(data, socket){
			fillComments(data.value, data.id, function(){
				thillyState.loggedIn();
				thillyInteraction.reScale();
			});	
		});
		
		if(thillyState.checkLogged())
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'getVotes', commentObj, function(data, socket){
				fillVotes(data.value, data.id);
			});
	}

	/** */	
	function placeVotes(pageID){
		if(debug.trace)
			debug.log('in placeVotes: ' + pageID);
		var votes = userVotes[pageID]
		
		for(var i = 0; i < votes.upVotes.length; i++){
			placeAVote(votes.upVotes[i].cID, pageID, 1, false);	
		}	
		for(var i = 0; i < votes.downVotes.length; i++){
			placeAVote(votes.downVotes[i].cID, pageID, -1, false);	
		}	
	}
	
	/** */	
	function placeAVote(commentID, pageID, vote, local){
		if(debug.trace)
			debug.log('in placeAVote: ' + commentID + ' : ' + vote);
		var points, className = 'commentMetadata points', switched = false;
		var upArrow = document.getElementById('voteUp'+((commentID>0)?commentID:pageID));
		var downArrow = document.getElementById('voteDown'+((commentID>0)?commentID:pageID));
		
		if(commentID == 0){
			points = document.getElementById('articlePoints'+pageID);
			className += ' articleMetadata';
		}
		else//vote = 1 for upvote, -1 for downvote
			points = document.getElementById('commentPoints'+commentID);

		//colorize and modify points
		if(points.className.indexOf(((vote>0)?' upVoted':' downVoted')) >= 0){//if removing vote
			points.className = className;
			vote =  -vote;
			switched = true;
		}
		else if(points.className.indexOf(((vote>0)?' downVoted':' upVoted')) >= 0){//if switching vote
			points.className = className + ((vote>0)?' upVoted':' downVoted');
			vote *= 2;
		}
		else{																//if first vote
			points.className = className + ((vote>0)?' upVoted':' downVoted');
		}
		if(local){//if local update, modify the points
			var total = parseInt(points.innerHTML) + vote
			points.innerHTML = ((total > 0)?'+':'') + total;
			points.setAttribute('after', (total == 1 || total == -1)?' point':' points');
			if(switched){
				if(vote > 0)
					downArrow.className = 'icon voteDown';
				else
					upArrow.className = 'icon voteUp';
			}
		}
		
		//colorize arrows
		if(!switched){
			if(vote > 0){
				upArrow.className = 'icon voteUp upVoted';
				downArrow.className = 'icon voteDown';
			}
			else{
				upArrow.className = 'icon voteUp';
				downArrow.className = 'icon voteDown downVoted';		
			}
		}
	}
	
	/** TODO:IMPLEMENT ME EVENTUALLY */	
	function flagComment(commentID, userID){
		//send CommentID and UserID of flagger to email 'webmin@thilly.net'
		if(debug.trace)
			debug.log('in flagComment: ' + commentID);
	}

/** 
	public comment API 
*/
	/** */	
	function fillVotes(voteData, pageID){
		if(debug.trace)//vote data is an object of arrays {upvotes:[pID,cID], downVotes:[pID,cID]}
			debug.log('in fillVotes: ' + pageID);
		userVotes[pageID] = voteData;
		gotVotes = true;
		if(gotComments)
			placeVotes(pageID);
	};
	
	/** */	
	this.commentBox = function(pageID, points){
		if(debug.trace)
			debug.log('in commentBox: ' + pageID);
		
		var commentWrapper = document.createElement('span');
		
		var commentButton = document.createElement('span');
			commentButton.className = 'articleControl';
			commentButton.innerHTML = 'see comments';
		
		var votes = document.createElement('span');
			votes.className = 'commentMetadata articleMetadata points';//points so far
			votes.id = 'articlePoints' + pageID;
			votes.setAttribute('after', (points == 1 || points == -1)?' point':' points');
			votes.innerHTML = ((points > 0)?'+':'')+points;
			
		var commentContainer = document.createElement('div');
			commentContainer.className = 'commentContainer';
			commentContainer.id = 'commentContainer' + pageID;
			commentContainer.style.display = 'none';
			
			commentButton.onclick = function(){
				if(commentContainer.style.display == 'none'){
					if(commentContainer.childNodes.length == 0)
						getComments(pageID);
					commentContainer.style.display = 'block';
					this.innerHTML = 'hide comments';
					thillyInteraction.reScale();
				}
				else{
					commentContainer.style.display = 'none';
					this.innerHTML = 'see comments';
					thillyInteraction.reScale();
				}		
			};
		
		commentWrapper.appendChild(commentButton);
		commentWrapper.appendChild(votes);
		commentWrapper.appendChild(commentContainer);

		return commentWrapper;
	}	
	
	/** */
	function fillComments(commentData, pageID, callBack){
		if(debug.trace)
			debug.log('in fillComments');
		pageComments[pageID] = commentData;
			
		var container = document.getElementById('commentContainer' + pageID);
		container.appendChild(createReplyWrapper(0, pageID));
		
		for(var i =0; i < commentData.length; i++){
			if(commentData[i].replyTo == 0)
				container.appendChild(commentWrapper(commentData[i]));
			else{
				var repliedCommentArea = document.getElementById('replies'+commentData[i].replyTo);
				repliedCommentArea.appendChild(commentWrapper(commentData[i]));
			}
		}
		
		gotComments = true;
		if(gotVotes)
			placeVotes(pageID);
		
		if(typeof(callBack) == 'function')
			callBack();
	};
	
}).apply(window.thillyComments, [window.thillyLogging]);

