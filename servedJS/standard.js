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
	this.submit = function(){
		alert('Sorry, only Thilly can submit new content at this time');
	};

}).apply(window.thillyAdmin, [thillyLogging])