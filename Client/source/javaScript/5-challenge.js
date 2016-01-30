/**
 *
 */

/** */
window.thillyChallenge = {};

/** */
(function(debug){
	
	var challengeBox;
	
	var problems = [];
		
	this.init = function(){
		if(debug.trace)
			debug.log('in thillyChallenge.init');
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getChallenge', {}, function(data){
			challengeBox = document.getElementById('topContent');
			topContent.innerHTML = data.page;
			var changeLog = challengeBox.querySelector('#changeLog');
			changeLog.innerHTML = data.change;
			if(thillyIndex.user.name)
				challengeBox.querySelector('#challengeID').innerHTML = 'Team Name: ' + thillyIndex.user.name;
			thillyState.loggedIn();
			
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'getProblems', {}, function(data){
				problems = [];
				var dropDown = challengeBox.querySelector('#problemList');
					dropDown.innerHTML = '<option>Select a problem</option>';
				var scoreWrapper = new DocumentFragment();
				for(var i = 0; i < data.length; i++){
					for(var j = 0; j < data[i].problems.length; j++){
						var scoreProblem = document.createElement('span');
							scoreProblem.className = 'problemResult fail';
							scoreProblem.id = data[i].problems[j].name;
							scoreProblem.innerHTML = data[i].problems[j].name;
						var thisProblem = document.createElement('option');
							thisProblem.innerHTML = data[i].problems[j].name;
							thisProblem.id = problems.length;
						dropDown.appendChild(thisProblem);
						problems.push(data[i].problems[j]);
						scoreWrapper.appendChild(scoreProblem);
					}
				}
				document.getElementById('score').appendChild(scoreWrapper);
				thillyUtil.sendReceive(thillyIndex.mainSocket, 'getProblemHistory', {}, fillProblemHistory);
			});
		});
	};
		
	this.checkSelect = function(element){
		if(debug.trace)
			debug.log('in checkSelect');
		var problemIdx = element.selectedOptions[0].id;
		if(problemIdx)
			getProblemInfo(problemIdx);
	};
	
	this.clearBox = function(){
		challengeBox.querySelector('#codeWindow').value = '';
		challengeBox.querySelector('#results').innerHTML = '';
		challengeBox.querySelector('#results').className = 'alert';
	};
	
	this.submitProblem = function(){
		if(debug.trace)
			debug.log('in submitProblem');
		
		challengeBox.querySelector('#results').innerHTML = '';
		challengeBox.querySelector('#results').className = 'alert';
		
		codeSubmit = {
			code : challengeBox.querySelector('#codeWindow').value,
			problem : challengeBox.querySelector('#problemList').selectedOptions[0].innerHTML,
			language: challengeBox.querySelector('#languages').selectedOptions[0].innerHTML
		};
		
		if(codeSubmit.code == ''){
			challengeBox.querySelector('#results').innerHTML += '\n Must provide code';
			challengeBox.querySelector('#results').className = 'alert error';		
		}
		else if(codeSubmit.problem == '...'){
			challengeBox.querySelector('#results').innerHTML += '\n Must select problem';
			challengeBox.querySelector('#results').className = 'alert error';
		}
		else
			thillyUtil.listen(thillyIndex.mainSocket,'codeSubmission', codeSubmit, pushResult);	
	};
	
	function fillProblemHistory(data){
		var scoreBox = document.getElementById('score');
		for(var i in data){
			var theScore = scoreBox.querySelector('#'+data[i].toString());
			if(theScore)
				theScore.className = 'problemResult success';
		}
	};
	
	function pushResult(result){
		if(debug.trace)
			debug.log('in pushResult');
		var alerts = result.text.split('\n');
		for(var i = 0; i < alerts.length; i++){
			challengeBox.querySelector('#results').innerHTML += alerts[i] + '</br>';
		}
		challengeBox.querySelector('#results').className = 'alert ' + result.tone;
		if(result.tone)
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'getProblemHistory', {}, fillProblemHistory);
	}
	
	function getProblemInfo(problemIdx){
		challengeBox.querySelector('#codeWindow').value = problems[problemIdx].problemDetails;		
	}	
	
}).apply(window.thillyChallenge, [window.thillyLogging]);