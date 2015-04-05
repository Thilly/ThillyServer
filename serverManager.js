/** serverManager.js
	This process is first launched in order to launch, monitor, re-launch and spawn multiple threads for the actual webserver.
	
	command arguments:
		test : create test (local) server
		live : create live (internet accessible) server
 */
 
/** child
	child is a node library that holds the utility for creating multiple processes and threads
*/
var child = require('child_process');

/** manager 
	manager is an object that houses the functionality to start creating server threads
*/
var manager = new myServers();

/** commands
	commands is created from the command line argument, it will be a string containing test and/or live
*/
var commands = '';

/** work
	work is an array of server objects created for each command line argument
*/
var work = [];

	commands += process.argv.slice(2).join('');
		
	if(commands.indexOf('test') >= 0)
		work.push('test');
	if(commands.indexOf('live') >= 0)
		work.push('live');

	for(var i in work)
		manager.startAServer(work[i]);
	
/** myServers()
	myServers is a sub function that takes the command arguments and creates child processes based on the environment it should be running in.
 */	
function myServers(){

	/** processes
		A map of the running projects
	*/
	this.processes = {};

	/** startAServer
		startAServer links the messaging between a server child-process and the main serverManager process
	*/
	this.startAServer = function(type){

		var that = this;
		
		var onMessage = function(message){
			console.log(this.pid + ': msg: ' + message);
		};
		
		var onError = function(error){
			console.log(this.pid + ': error: ' + error);
		};
		
		var onDisconnect = function(signal){
			console.log(this.pid + ': error: ' + signal);
			this.kill();
			delete that.processes[this.pid];
		};
		
		var server = child.fork('./ServerPKGs/thillyServer.js', [type]);
			server.on('message', onMessage);
			server.on('error', onError);
			server.on('disconnect', onDisconnect);
			
		that.processes[server.pid] = server;
		console.log(server.pid + ': starting ' + type);
		
		this.stop = function(pID){
			var that = this;
			if(typeof(pID) === 'undefined'){
				for(var key in that.processes){
					that.processes[key].disconnect();
				}
			} 
			else if (that.processes[pID]){
				that.processes[pID].disconnect();
			}
		};
	}
}

