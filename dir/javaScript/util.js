/** 
 *
 */

/** */
window.thillyUtil = {};

/** */
(function(debug){

	/** */
	this.utilityException = function(msg){
		if(debug.trace)
			console.log('in utilityException: ' + msg); 
		this.message = msg;
		this.name = 'Utility Exception';
	}//manage ALL exceptions without THROWING exceptions come real deployment callbacks, and proper degradation

	/** */
	this.craftFile = function(filename, type, callBack){
		if(debug.trace)
			console.log('in craftFile: ' + filename); 
		var newFile;
		newFile = document.createElement(type)
		newFile.id = filename;
		
		if(type == 'script')
		{
			newFile.type = 'application/javascript';
			newFile.src = filename;		
		}
		else if(type == 'link')
		{
			newFile.type = 'text/css';
			newFile.rel = 'stylesheet';
			newFile.href = filename;
		}
		else if(type == 'div')
		{
			this.updateHTML(mainSocket, filename, callBack);
			return;
		}
		else
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new this.utilityException('Type: ' + type + ' not supported by craftFile'));
				return;
			}
			else
				return new this.utilityException('Type: ' + type + ' not supported by craftFile');
		}
		
		if(typeof(callBack) == 'function')
			callBack(newFile);
		else
			return newFile;
	}

	/** */
	this.removeFile = function(filename, callBack){
		if(debug.trace)
			console.log('in removeFile: ' + filename); 
		var head = document.getElementsByTagName('Head')[0];
		var oldFile = document.getElementById(filename);
		if(oldFile === null)
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new this.utilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile'));
				return;
			}
			else
				return new this.utilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile');
		}
		else
			oldFile = head.removeChild(oldFile);
		if(typeof(callBack) == 'function')
			callBack(oldFile);
	}

	/** */
	this.getFile = function(filename, callBack){
		if(debug.trace)
			console.log('in getFile: ' + filename); 
		var type = filename.substring(filename.indexOf('.'));//get file extension
		if(filename.indexOf('.js') >= 0)//if plan on adding JS
			type = 'script';
		else if(filename.indexOf('.css') >= 0)//if plan on adding CSS
			type = 'link';
		else if(filename.indexOf('.html') >= 0)//if just grabbing more rawHTML
			type = 'div';
		else
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new this.utilityException('Type: ' + type + ' not supported by getFile'));
				return;
			}
			else
				return new this.utilityException('Type: ' + type + ' not supported by getFile');
		}
		
		this.craftFile(filename, type, function(newNode){
			if(type == 'div')
			{
				callBack(newNode);
			}
			else if(type == 'script' || type == 'link')
			{
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(newNode);
				var serverTimer = setTimeout(function(){
					var potentialDead = newNode;
					var potentialHead = head;
				/*
					since closure from getFile() can change the local head and newNode of craftFile().
					the newNode.onload() is fine since newNode changes, wont override that particular event
				*/
					head.removeChild(potentialDead);
					window.stop();
					//bail
					new utilityException('Server took too long to find file: ' + filename + ', cannot getFile');
				}, 3000);
					
				newNode.onload = function(){
					clearTimeout(serverTimer);
					callBack();
				};			
			}
		});
	}

	/** */
	this.updateHTML = function(socketToListenOn, filename, callBack){
		if(debug.trace)
			console.log('in updateHTML: ' + filename); 

		if(socketToListenOn === undefined)
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new this.utilityException('Socket has not been instantiated yet, cannot updateHTML'));
				return;
			}
			else
				return new this.utilityException('Socket has not been instantiated yet, cannot updateHTML');
		}
		else if(!socketToListenOn.connected)
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new this.utilityException('Socket is not connected, cannot updateHTML'));
				return;
			}
			else
				return new this.utilityException('Socket is not connected, cannot updateHTML');
		}
		else
		{
			socketToListenOn.sendCommand('updatePage', filename);
			socketToListenOn.once('updatePage', function(data){
				if(data.error)
					new utilityException('Filename: ' + filename + ' not found on server, cannot updateHTML'); 
				else
				{
					var newNode = document.createElement('div');
					newNode.innerHTML = data.value;
					if(typeof(callBack) == 'function')
						callBack(newNode);
					else
					{
						var context = document.getElementById('theContext');
						context.innerHTML = '';
						context.appendChild(newNode);
					}
				}
			});
		}
	}

	/** */
	this.sendCommand = function(command, dataObject, callBack){
		if(debug.trace)
			console.log('in sendCommand: ' + command); 

		var commandObject = {'command':command, 'value':dataObject};
		try{
			if(typeof(callBack) == 'function')
				this.emit('command', commandObject, callBack);
			else
				this.emit('command', commandObject);
		}
		catch(error){
			return new utilityException('Socket has not been instantiated yet, cannot sendCommand: ' + command);
		}
	}

	/** */
	this.actionCommand = function(data, socket, functionMap){
		if(debug.trace)
			console.log('in actionCommand: ' + data.command);
		try{
			functionMap[data.command](data.value, socket);
		}
		catch(error){
			return new this.utilityException('Error in actionCommand: ' + data.command + ' : ' + error);
		}
	}

	/** */
	this.getMoreArticles = function(numberArticles, callBack){
		console.log('"getting" ' + numberArticles + ' more articles');
		if(typeof(callBack) == 'function')
			callBack();
	};
	
}).apply(window.thillyUtil, [window.thillyLogging]);