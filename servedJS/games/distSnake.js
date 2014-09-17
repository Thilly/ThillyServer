/**	Deployment of dist snake */
window.currentGame = {};

/** */
(function(debug){

	this.init = function(){
		console.log('DIST SNAKE GRABBED FROM SERVER');
		thillyLayers.clear();
		//just to test sillyRender
		thillyLayers.addLayer('base', 0, function(layer){
			layer.addObject(thillyDrawable.makeNew('square'));
		});
	};
	
}).apply(window.currentGame, [window.thillyLogging]);