/** loader module for webService 
 *	shove all of the requires into one, and leave one require('loader.js')(this);
 *	it might work
 *
 
	(function(module){

		module.logging = new...();
		module.exceptions = new ...
		module.mongo = new require('./thillyMongo.js')(module.logging);
		module.files = new ... (module.logging);
		module.Socketio = new ... (logging.socketIO)
		module.http = new ...
		module.crypto = new ...


	}).apply(module);
*/

/** refactor admin.js and standard.js to be built during login
		**create assemble file in thillyFiles.js
		**take array of filenames, keep appending till done, return final string
	change userScript object = user || {};
	serve user while updating that JS (onLogin)
	start splitting up CSS, mobile (no leftscrollyBar, split up interaction.js also)
	and desktop (all the fun), also split up JS to allow for different games to be partitioned
*/

/**	create deployment script
		test:
			move js/html so can still step through
			compile scss into testing directory
		
		deploy:
			minify js/html into deploy directory
			compile scss into deploy directory
*/

/** random server library improvements
	extend fileHandler to account for streams and any other file types that come up
	extend thillyExceptions to handle errors cleanly (or at least provide the illusion of doing so)
	create supervisory process to 'watch' webService, contest, and other node processes
	create external 'classes' for different states of socket commands
	finish up exception handling
	give thillyLogging hooks to modify logging from outside hardcoded values
	generalize page requests
*/

/** random client improvements
	
		clean up design with something nice
			ide type colors (sublime/npp)
			dark theme, light theme
		namespace index.js with iife
*/
	
/**	::GAMES:: for landing screen
	mobile 
		ThillyBird 		:	flappyBirdClone
			tap to jump
		ThillyDefender	:	missle command
			tap to fire missle
		(*)				:	asteroids
			twin stick shooter
		match 3
			tap to choose

	desktop
		ThillyBird
			click to jump
		ThillyDefender
			click to fire missle
		Asteroids
			wasd
		snake
			wasd
		match 3
			click to choose
		breakout
			mouse / click	
			
*/