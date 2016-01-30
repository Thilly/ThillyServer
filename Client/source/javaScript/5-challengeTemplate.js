/**
 *
 */

/** */
window.thillyChallengeTemplate = {};

/** */
(function(debug){
	
	var tabs = [];
	
	var currentTab = 0;
	
	this.init = function(){
		if(debug.trace)
			debug.log('in init');
			
		var contestNames = document.getElementById('comboBox');
		var problemName = document.getElementById('problemNameBox');
		var problemDetails = document.getElementById('problemDetails');
		var testCases = document.getElementById('testCases');
		var answerBox = document.getElementById('answer');
		
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getContests', {}, function(data){
			for(var i = 0; i < data.length; i++){
				var newOption = document.createElement('option');
				newOption.value = data[i].contestName;
				document.getElementById('contestNames').appendChild(newOption);
			}
		});
		
		contestNames.onchange = function(){
			tabs = [];
			document.getElementById('contestProblemList').innerHTML = '';
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'getContest', {contestName: this.value}, function(problemSet){
				if(!problemSet){
					createNewContest();
					return;
				}
				else{
					var problems = problemSet[0].problems;
					document.getElementById('liveProblem').checked = problemSet[0].live;
					for(var j = 0; j < problems.length; j++){
						createNewTab(problems[j], j);
						tabs.push(problems[j]);
					}
				}
				displayContent(problems[0]);
				currentTab = 0;
			});
		};	
	
		problemName.onchange = function(){
			var tabList = document.getElementById('contestProblemList');
			tabList.childNodes[currentTab].innerHTML = this.value;
			preserveContent();
		};
		
		problemDetails.onchange = function(){
			preserveContent();
		};
		
		testCases.onchange = function(){
			preserveContent();
		};
		
		answerBox.onchange = function(){
			preserveContent();
		};
	
	};
	
	this.submit = function(){
		preserveContent();
		if(thillyIndex.user.type == 'admin'){
			var contestName = document.getElementById('comboBox').value;
			var liveProblem = document.getElementById('liveProblem').checked
			thillyAdmin.submitChallenge(contestName, liveProblem, tabs);
		}
		else
			thillyAdmin.submit();	
	
	}
	
	this.addAProblem = function(){
		var problemInfo = {
			name: 'problemTitle',
			problemDetails: 'problemDetails',
			answer: 'answer',
			testCases: 'testCases'
		}
		tabs.push(problemInfo)
		createNewTab(problemInfo, tabs.length-1);
	}
	
	function displayContent(problemInfo){
		if(debug.trace)
			debug.log('in displayContent');
		document.getElementById('templateView').innerHTML = '<pre style="word-wrap: break-word;">' + problemInfo.problemDetails + '</pre>'; 
		document.getElementById('problemDetails').value = problemInfo.problemDetails;
		document.getElementById('testCases').value = problemInfo.testCases;
		document.getElementById('answer').value = problemInfo.answer;	
		document.getElementById('problemNameBox').value = problemInfo.name;
	}
	
	function createNewTab(problemInfo, tabIndex){
		if(debug.trace)
			debug.log('in createNewTab');
			
		var tabBox = document.getElementById('contestProblemList');
		var newTab = document.createElement('span');
			newTab.className = 'inlineButton small' + ((tabIndex == 0)?' selected':'');
			newTab.id = tabIndex;
			newTab.innerHTML = problemInfo.name;
			newTab.onclick = function(){
				preserveContent();
				displayContent(tabs[this.id]);
				currentTab = this.id;
				thillyUtil.replaceClasses('inlineButton small selected', 'inlineButton small');
				this.className = 'inlineButton small selected';
			}
		tabBox.appendChild(newTab);
	}
	
	function preserveContent(){
		if(debug.trace)
			debug.log('in preserveContent');
			
		tabs[currentTab].problemDetails = document.getElementById('problemDetails').value;
		tabs[currentTab].testCases = document.getElementById('testCases').value;
		tabs[currentTab].answer = document.getElementById('answer').value;
		tabs[currentTab].name = document.getElementById('problemNameBox').value;
	}
	
	function createNewContest(){
		if(debug.trace)
			debug.log('in createNewContest');
			
		var problemInfo = {
			name: 'problemTitle',
			problemDetails: 'problemDetails',
			answer: 'answer',
			testCases: 'testCases'
		}
		createNewTab(problemInfo, 0)
		tabs.push(problemInfo)
		currentTab = 0;
	}
	
	
}).apply(window.thillyChallengeTemplate, [window.thillyLogging]);	