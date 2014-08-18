//
// STANDARD.js
//

/** */
window.thillyAdmin = {};

/** */
(function(debug){

	/** */
	this.admin = false;
	
	/** */
	this.pushSchema = function(){
		blankSubmit();
	};
	
	/** */
	this.submit = function(){
		blankSubmit();
	};

	function blankSubmit(){
		alert('Sorry, only Thilly can mess with content at this time');
	};
	
}).apply(window.thillyAdmin, [thillyLogging])