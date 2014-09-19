/**	Deployment of dist snake */
window.currentGame = {};

/** */
(function(debug){
	
	var theSnake = new aSnake('green', 'UserName', {xPos:100, yPos:100});
	
	this.frameRate = 3;

	this.init = function(){
		thillyLayers.clear();
		thillyLayers.addLayer('base', 0, function(layer){
			layer.addObject(theSnake);
		});
		
		thillyLayers.addLayer('fruit', 1, function(layer){
			layer.addObject(new aFruit());
		});
		
		window.onkeydown = function(event){
			if(event.keyCode == 82)//'r'
				theSnake.turnRight();
			if(event.keyCode == 76)//'l'
				theSnake.turnLeft();
		};
	};
	
	function aFruit(canvas){
		this.xPos = Math.random() * 500;
		this.yPos = Math.random() * 500;
		var width = 15;
		
		this.getAsRect = function(){
			return {
				top:	this.yPos - width / 2,
				bottom: this.yPos + width / 2,
				left:	this.xPos - width / 2,
				right:	this.xPos + width / 2
			};
		};
			
		this.consume = function(){
			this.xPos = Math.random() * 500;
			this.yPos = Math.random() * 500;
		};
		
		this.drawMe = function(context){
			context.fillStyle = 'red';
			context.fillRect(this.xPos-width/2, this.yPos-width/2, width, width);
		};
	}
	
	function aSnake(inColor, inName, startPos){
		
		var color = inColor;
		var name = inName;
		var length = 3;
		var segments = [{xPos: startPos.xPos, yPos: startPos.yPos}];
		var width = 25;
		var direction = 0;
		var pendingDirection = false;
		/** right, down, left, up*/
		var directionList = [{dX:width, dY:0},{dX:0, dY:width},{dX:-width, dY:0},{dX:0, dY:-width}];
		
		this.drawMe = function(context, dt){
			
			if(segments.length > 0){
				console.log(name);
				context.fillStyle = color;
				updatePosition();
				
				for(var i = 0; i < segments.length; i++){
					context.fillRect((segments[i].xPos - width/2), (segments[i].yPos-width/2), width, width); 	
				}
				
				context.font = '24px Calibri';
				context.fillStyle = 'black';
				context.fillText(name, segments[0].xPos-(name.length*6), segments[0].yPos+7);
				if(checkLose(context.canvas))
					lostGame();
			}
		};
		
		this.turnLeft = function(){
			updateDirection(-1);
		};
		
		this.turnRight = function(){
			updateDirection(1);
		};
		
		function increaseLength(){
			length++;
		};
		
		function eatFruit(fruits){
			var headRect = {
				top: segments[0].yPos-width/2,
				bottom: segments[0].yPos+width/2,
				left: segments[0].xPos-width/2,
				right: segments[0].xPos+width/2,
			};
			
			for(var i = 0; i < fruits.length; i++){
				fruitRect = fruits[i].getAsRect();
				if(thillyLayers.overLap(headRect, fruitRect)){
					fruits[i].consume();
					increaseLength();					
				}
			}
		}
			
		function checkLose(canvas){
			return collideSelf() || outOfBounds(canvas);
		}
		
		function lostGame(){
			segments = [];
			setTimeout(function(){
				direction = 0;
				segments = [{xPos: startPos.xPos, yPos: startPos.yPos}];
			}, 1000);
		}
		
		function collideSelf(){
			var front = segments[0];
			for(var i = 1; i < segments.length; i++){
				if(front.xPos == segments[i].xPos)
					if(front.yPos == segments[i].yPos)
						return true;
			}
			return false;
		};
		
		function outOfBounds(canvas){
			var front = segments[0];
			if(front.xPos < 0 || front.xPos > canvas.width)
				return true;
			if(front.yPos < 0 || front.yPos > canvas.height)
				return true;
			return false;
		}
		
		function updatePosition(){
		
			if(pendingDirection){
				pendingDirection();
				pendingDirection = false;
			}
			
			var newSegment = {
				xPos: (segments[0].xPos + directionList[direction].dX),
				yPos: (segments[0].yPos + directionList[direction].dY)
			};
			eatFruit(thillyLayers.getLayer('fruit').getObjects());
			segments.unshift(newSegment);
			if(segments.length > length)
				segments.pop();
		}
		
		function updateDirection(leftRight){
			pendingDirection = function(){
				direction = (direction+leftRight)%directionList.length;
				if(direction < 0)
					direction = directionList.length -1;
			};
		}
	}
	
	
}).apply(window.currentGame, [window.thillyLogging]);