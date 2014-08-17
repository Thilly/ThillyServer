/** random server library improvements
	extend fileHandler to account for streams and any other file types that come up
	create external modules for different states of socket commands
	
	add a schema specific database
	each collection will represent a database
	each document will represent a specific collection
	each record will be a mapping of a field name onto a regex pattern for pre-validation
		before submit or changes
				
	mongo cache 
		om selects, memoize by query/projection.toString()
		Map to priority queue, on remove purge map
		max 100, let oldest fall off
			Cache[query] -> array[idx]
	
	mongo backup - mongoDump
		daily create backup db of all content currently hosted on mongo
		move to different folder and archive it
			keep last 2 weeks of backups
*/

/** random client improvements
	
	user profile stuff
		**back burner**
		give each user a public and private profile
		link to public on each comment
		create list of users when pulling comments
		query all the users $all[userList], 
		with projection {userID: 1, points: 1, publicLink:1}
		after comments are populated, run over comments and add title/link to each user
	
	graphics and UX
		clean up design with something nice
		ide type colors (sublime/npp)
		dark theme, light theme
		css, lots of it
		make the webby look good for a change
		find inspiration deep inside :D

	create sprite sheet for buttons
	X	up/down default
	X	up/down active
	X	x (close buttons)
	X	-/+ minify, expand 
	X	replyComment/active
		minimap arrows
		template tools + tools/hide
		general settings - gear
		profile button + active
		
Content TABS (refactor interaction to take/make tabs for all content, just in case)

	DB management 
		thillyMongo.js
			submit: submit query
			getDBs
			getCollections
			getDocuments
			getFields
		use bottom to see query as being built or mongo result
	
	make the template more of a wysiwyg thing
		**back burner**
*/
	
/** refactor admin.js and standard.js to be built during login
		create and assemble file in thillyFiles.js
		take array of filenames, keep appending till done, return creation
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
		(*)				:
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
			ad
			
*/

/** build script 

	Append version numbers in build script, to alleviate browser caching problems
		
	Mainv29389.css
	Minv73920.js
*/