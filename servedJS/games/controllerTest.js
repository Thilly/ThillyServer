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
			type: 'dPad',
			args: {}
		};
		
		var right = {
			type: 'dPad',
			args: {}
		};
		
		controller.create(left, right);
		
		canvas.addEventListener('up', function(){
			console.log('up');
		});
		canvas.addEventListener('down', function(){
			console.log('down');
		});
		canvas.addEventListener('left', function(){
			console.log('left');
		});
		canvas.addEventListener('right', function(){
			console.log('right');
		});		
	};
	
}).apply(window.currentGame, [window.thillyLogging]);