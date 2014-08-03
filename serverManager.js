/** */
var child = require('child_process');

/** */
var	events = require('events');

/** */
var manager = new myServers();

/** */
manager.startAServer('test');

/** */
manager.startAServer('live');
	
/** */	
function myServers(){

	/** */
	this.processes = {};

	/** */
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

