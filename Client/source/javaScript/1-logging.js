/**
 *
 */

/** */
window.thillyLogging = {};

/** */
(function(){
	
	/** */
	this.movement 	= false;
	
	/** */
	this.trace 		= true;
	
	/** */
	this.history	= false;
	
	/** */
	this.log		= function(msg){//if not live
		if(window.location.href.indexOf('thilly') < 0)
			console.log(msg);
	};
	
}).apply(window.thillyLogging);