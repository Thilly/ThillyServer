/** random server library improvements
	extend fileHandler to account for streams and any other file types that come up
	extend thillyExceptions to handle errors cleanly (or at least provide the illusion of doing so)
	create external modules for different states of socket commands
	give thillyLogging hooks to modify logging from outside hardcoded values
		implement a way for an admin to watch the log during runtime
			add a stream, logging.log also broadcasts to the admin channel if anyone listening
			
	mongo cache 
		om selects, memoize by query/projection.toString()
		Map to priority queue, on remove purge map
		max 100, let oldest fall off
			Cache[query] -> array[idx]
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
			contest
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
		general settings - gear
		profile button + active
		
	category:template = [
		tab1: {contentTop: CT,  contentBottom:CB, tabName:TN, title:Title}
		tab2: {contentTop: CT,  contentBottom:CB, tabName:TN, title:Title}
		tab3: {contentTop: CT,  contentBottom:CB, tabName:TN, title:Title}
		tab4: {contentTop: CT,  contentBottom:CB, tabName:TN, title:Title}
	]	
Content TABS (refactor interaction to take/make tabs for all content, just in case)
	newsFeed
		include button/tabs to create as tab/add tabs

	DB management 
		create a front end (admin only for real, test for standard) for managing the database easier
		cick for db
		click for collections, 
		get a projection of collection and click for options
			bottom content will be fields to change or an insert button to create new record

	Diagnostic
		just like from contest 1
		get log messages and memory usage just like contest 1
	
	
	contest management
		top: 3fields
			problem Text
			problem input
			problem output(answer)
		
		bottom
			show the results of the three soon to be inputs
	
	onClick of tab = function(){
		articleContent.innerHTML = this.contentTop
		article1content.innerHTML = this.contentBottom
		}		
*/
	
/** refactor admin.js and standard.js to be built during login
		**create assemble file in thillyFiles.js
		**take array of filenames, keep appending till done, return final string
	change userScript object = user || {};
	serve user while updating that JS (onLogin)
	start splitting up CSS, mobile (no leftscrollyBar, split up interaction.js also)
	and desktop (all the fun), also split up JS to allow for different games to be partitioned
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

/** build script 

	Append version numbers in build script, to alleviate browser caching problems
		
	Mainv29389.css
	Minv73920.js
*/

/** first contest problem set

 1 echo shapes
 2 echo shapes after rotation s2RR
 3 fall in Grid based on rotated shape and column s1LLc3
 4 fall in Grid based on rotated shape and clear lines, above clear falls again 
 5 can be solved with the order given? end with empty grid?
 
*/