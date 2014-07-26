/** */
var child	= require('child_process');

/** */
var	events	= require('events');

/** */
var bigServer = new myServers();

/** */
bigServer.startAServer('test');

/** */
bigServer.startAServer('live');
	
/** */	
function myServers(){

	/** */
	this.threads = {};

	/** */
	this.startAServer = function(type){

		var that = this,
		onMessage = function(message) {
			console.log(this.pid + ': msg: ' + message);
		},
		onError = function(error) {
			console.log(this.pid + ': error: ' + error);
		},
		onDisconnect = function(signal) {
			console.log(this.pid + ': error: ' + signal);
			this.kill();
			delete that.threads[this.pid];
		};
		
		var server = child.fork('./ServerPKGs/thillyServer.js', [type]);
		server.on('message',onMessage);
		server.on('error',onError);
		server.on('disconnect',onDisconnect);
		that.threads[server.pid] = server;
		console.log(server.pid + ': started ' + type);
		
		this.stop = function(pID){
			var that = this;
			if(typeof(pID) === 'undefined'){
				for(var key in that.threads) {
					that.threads[key].disconnect();
				}
			} 
			else if (that.threads[pID]){
				that.threads[pID].disconnect();
			}
		};
	}
}

