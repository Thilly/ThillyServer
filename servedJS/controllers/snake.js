/**	Deployment of dist snake */
window.currentGame = {};

/** */
(function(debug){
	
	var controller = {};
	var canvas;
	
	this.init = function(){
	
		controller = new thillyController(thillyLogging);
		canvas = document.getElementById('gameCanvas');
		
		var left = {
			type: 'oneKey',
			args: {button1Txt: 'Left'}
		};
		
		var right = {
			type: 'oneKey',
			args: {button1Txt: 'Right'}
		};
		
		controller.create(left, right);

		canvas.addEventListener('button', function(event){
			if(debug.trace)
				console.log('button event: ' + event.detail.button);
			generalHandle(event.detail.button);
		});	
	
		function generalHandle(operation){
			if(debug.trace)
				console.log('sending toGame: ' + operation);
				
			var command = {
				player : thillyIndex.user.name,
				control : operation
			};
			
			thillyUtil.send(thillyGame.gameSocket, 'toGame', command);
		}
		
		introduce();
	};
}).apply(window.currentGame, [window.thillyLogging]);


function introduce(){
	var introduction = thillyIndex.user;
	thillyUtil.send(thillyGame.gameSocket, 'introduce', introduction);

}

