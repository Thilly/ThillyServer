/**	Deployment of dist snake */
window.currentGame = {};

/** */
(function(debug){
	
	var controller = {};
	var controllers = ['dPad', 'oneKey' ,'twoKey', 'fourKey' , 'touch',	'stick'];
	var canvas, controllerIndex = 0;
	
	this.init = function(){
	
		controller = new thillyController(thillyLogging);
		canvas = document.getElementById('gameCanvas');
		
		var left = {
			type: controllers[controllerIndex],
			args: {}
		};
		
		var right = {
			type: 'test',
			args: {}
		};
		
		controller.create(left, right);
		
		//dPad
		canvas.addEventListener('dPad', function(event){
			generalHandle('dPad: ' + event.detail.dPad);
		});
		
		//one, two, and fourbutton controllers
		canvas.addEventListener('button', function(event){
			generalHandle('button: ' + event.detail.button);
		});	

		//touchpad
		canvas.addEventListener('poke', function(){
			generalHandle('poke');
		});
		canvas.addEventListener('touchStart', function(){
			generalHandle('touchStart');
		});
		canvas.addEventListener('touchEnd', function(){
			generalHandle('touchEnd');
		});
		canvas.addEventListener('touchMove', function(){
			generalHandle('touchMove');
		});	
		canvas.addEventListener('swipe', function(){
			generalHandle('swipe');
		});
		
		//stick
		canvas.addEventListener('angle', function(event){
			generalHandle('angle: ' + event.detail.angle);
		});	
		
		//testController
		canvas.addEventListener('next', function(){
			generalHandle('next');
			controllerIndex = (controllerIndex+1)%controllers.length;
			getNextController();
		});	
		
		canvas.addEventListener('prev', function(){
			generalHandle('prev');
			getPrev();
			getNextController();
		});	
		
		function generalHandle(eventName){
			console.log(eventName);
			controller.getRight().addMsg(eventName);
		}
		
		function getPrev(){
			controllerIndex = controllerIndex - 1;
			if(controllerIndex < 0)
				controllerIndex = controllers.length -1;
		}
		
		function getNextController(){
			left = {
				type: controllers[controllerIndex],
				args: {}
			};
			controller.create(left, right);
			controller.getRight().addMsg(controllers[controllerIndex]);
		}
	};
	
}).apply(window.currentGame, [window.thillyLogging]);