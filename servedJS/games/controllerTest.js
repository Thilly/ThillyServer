/**	Deployment of dist snake */
window.currentGame = {};

/** */
(function(debug){
	
	var controller = {};

	this.init = function(){
		controller = new thillyController(true);
		controller.create('dPad', 'dPad');
		
		document.addEventListener('up', function(){
			console.log('up');
		});
		document.addEventListener('down', function(){
			console.log('down');
		});
		document.addEventListener('left', function(){
			console.log('left');
		});
		document.addEventListener('right', function(){
			console.log('right');
		});		
	};
	
}).apply(window.currentGame, [window.thillyLogging]);