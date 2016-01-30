/** */
window.thillyRender = {};

/** */
(function(debug){

	var frameRate;
	var interval = false;
	this.context = false;
	var width;
	var height;
	var lastTime = 0;

	/** */	
	this.start = function(canvasElement, fps){
		frameRate = 1000/fps;
		lastTime = new Date().getTime();
		context = canvasElement.getContext('2d');
		width = canvasElement.width;
		height = canvasElement.height;
		stuffToDraw = [];
		stuffToDraw[0] = [];
		layers = {};
		currentGame.init();
		resumeGame();
		thillyState.leaveState = this.quit;
	};
	
	this.quit = function(){
		clearInterval(interval);
		interval = false;	
	};
	
	/** */	
	this.pause = function(){
		if(interval !== false){
			//drawPause();
			setTimeout(function(){//clear interval after next frame
				clearInterval(interval)
				interval = false;		
			}, frameRate);
		}
		else{
			//clearPause();
			setTimeout(function(){
				resumeGame();
			}, frameRate);
		}
	};
	
	/** */
	function resumeGame(){
		interval = setInterval(function(){
			renderLoop();		
		}, frameRate);
	}

	/** */	
	function renderLoop(){
		context.clearRect(0,0, width, height);
		var nowTime = new Date().getTime();
		var dt = (frameRate) * (nowTime - lastTime);
		//potential for context aware re-draw, unlikely
		//call drawMe on whole drawable class
		thillyLayers.drawMe(context, dt);
		lastTime = nowTime;
	}
	
}).apply(thillyRender, [thillyLogging]);

/** */
window.thillyLayers = {};

/** */
(function(debug){

	var stuffToDraw = [];//array of layers, ordered by z-index 0+
	var layers = {}; //map of same layers indexed by name

	/** sets & gets */
	this.getLayer = function(layerName){return layers[layerName];};
	
	this.clear = function(){
		stuffToDraw = [];
		layers = {};
	}
	
	/** */	
	this.addLayer = function(layerName, zIndex, callBack){
		var newLayer = new aLayer(layerName, zIndex);
		
		layers[layerName] = newLayer;
		
		for(var i = 0; i < stuffToDraw.length; i++){
			if(zIndex < stuffToDraw[i].getZ){
				stuffToDraw.splice(i, 0, newLayer);//dbl check
				return;
			}
		}
		
		stuffToDraw.push(newLayer);
		if(typeof callBack == 'function')
			callBack(newLayer);
		else
			return newLayer;
	};

	/** */	
	this.removeLayer = function(layerName){
		for(var i = 0; i < stuffToDraw.length; i++){
			if(stuffToDraw[i].name == layerName){
				stuffToDraw = stuffToDraw.splice(i, 1);//remove that one, keep as filled indexed array
			}
		}
		delete layers[layerName];
	};

	/** */	
	this.moveObject = function(drawable, fromLayer, toLayer){
		layers[fromLayer].removeObject(drawable);
		layers[toLayer].addObject(drawable)
	};

	/** */	
	this.rearrange = function(layerName, zIndex){
		layers[layerName].setZIndex(zIndex);
		sortObjects(stuffToDraw, generalCompare('zIndex'));
	};

	/** */
	this.drawMe = function(context, dt){
		for(var i = 0; i < stuffToDraw.length; i++){
			//call drawMe on each drawable layer
			stuffToDraw[i].drawMe(context, dt);
		}
	};
	
	this.overLap = function(rect1, rect2){
		if(rect1.left > rect2.right || rect2.left > rect1.right)//if they are offset on x
			return false
		if(rect1.top > rect2.bottom || rect2.top > rect1.bottom)//if they are offset on y
			return false
		return true
	};
	
//Move the next three to UTIL
	/** */
	function sortObjects(toSort, sortWith){
		for(var i = 1; i < toSort.length; i++){
			if(sortWith(toSort[i-1], toSort[i])){
				swap(toSort[i-1], toSort[i])
				i--;
			}
		}
		return toSort;
	}
	
	/** */
	function swap(left, right){
		var temp = left;
		left = right;
		right = temp;
	}//might not work, might destroy references in array
	
	/** */
	function generalCompare(propertyName){
		var propName = propertyName;
		return function(left, right){
			if(left[propName] > right[propName])
				return true;
			return false;
		}
	}
//Move the last three to UTIL
		
	/** */
	function aLayer(layerName, depth){//nested constructor function in the module to distinguish individual layers
	
		var name = layerName;
		var zIndex = depth;
		var drawables = [];
		
		var scale = 1;
		var rotate = 0;
	
		/** sets & gets */
		this.getName = function(){return name;};
		this.getZ = function(){return zIndex;};
		this.setZ = function(depth){zIndex = depth;};
		this.getScale = function(){return scale;};
		this.setScale = function(newScale){scale = newScale;};
		this.getRotation = function(){return rotate;};
		this.setRotation = function(rotation){rotate = rotation;};
		this.getObjects = function(){return drawables;};
		
		/** */
		this.addObject = function(drawable){
			drawables.push(drawable);
		};
		
		/** */
		this.removeObject = function(drawable){
			for(var i = 0; i < drawables.length; i++){
				if(drawables == drawable){
					drawables.splice(i, 1);
				}
			}			
		};
		
		/** */
		this.bringToFront = function(drawable){
			for(var i = 0; i < drawables.length; i++){
				if(drawables == drawable){
					drawable = drawables.splice(i, 1);
					drawables.push(drawable);
				}
			}			
		};
		
		/** */
		this.sendToBack = function(drawable){
			for(var i = 0; i < drawables.length; i++){
				if(drawables == drawable){
					drawable = drawables.splice(i, 1);
					drawables.unshift(drawable);
				}
			}
		};
		
		/** */
		this.drawMe = function(context, dt){
		
		//	context.save();//or what ever it was
		//	context.scale(scale);
		//	context.rotate(rotate);
			
			//update any behaviours and then call drawMe on each drawable object
			draw(drawables, context, dt);			
		//	context.restore();
		};
		
		function draw(drawable, context, dt){
			if(drawable.length)
				for(var i = 0; i < drawable.length; i++)
					draw(drawable[i], context, dt);
			else{		
				if(drawable.behaviors)
					drawable.behaviors(layers, dt);//interact with anything/everything necessary
				if(drawable.drawMe)
					drawable.drawMe(context, dt);
			}
		}
		
	}//end of aLayer constructor
	
}).apply(thillyLayers, [thillyLogging]);