/** refactor admin.js and standard.js to be built during login
		**create assemble file in thillyFiles.js
		**take array of filenames, keep appending till done, return final string
	change userScript object = user || {};
	serve user while updating that JS (onLogin)
	start splitting up CSS, mobile (no leftscrollyBar, split up interaction.js also)
	and desktop (all the fun), also split up JS to allow for different games to be partitioned
*/

/** random server library improvements
	extend fileHandler to account for streams and any other file types that come up
	extend thillyExceptions to handle errors cleanly (or at least provide the illusion of doing so)
	create external modules for different states of socket commands
	give thillyLogging hooks to modify logging from outside hardcoded values
		implement a way for an admin to watch the log during runtime
			add a stream, logging.log also broadcasts to the admin channel if anyone listening
*/

/** random client improvements
	
		clean up design with something nice
			ide type colors (sublime/npp)
			dark theme, light theme
		namespace index.js with iife
	
	user profile stuff
	give each user a public and private profile
	link to public on each comment
		create list of users when pulling comments
		query all the users $all[userList], 
		with projection {userID: 1, points: 1, publicLink:1}
		after comments are populated, run over comments and add title/link to each user
	
	graphics and UX	
		build tabs for articles served as array
			template
			mongo
			memory manager
		css, lots of it
		make the webby look good for a change
		find inspiration deep inside :D

	create sprite sheet for buttons
	X	up/down default
	X	up/down active
		x (close buttons)
	X	replyComment/active
		minimap arrows
		template tools + tools/hide
		general settings gear
		profile button + active
		
		
	DB management 
	create a front end (admin only for real, test for standard) for managing the database easier
		click for collections, 
		click column headers to narrow search
		delete, modify row at a time
	
	place in template page, add a tab for DBM
		<hidden ='true'> and toggle back and forth	
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
	