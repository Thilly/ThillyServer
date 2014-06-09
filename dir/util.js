/** */
function UtilityException(msg)
{//standard exception for this script
	this.message = msg;
	this.name = 'Utility Exception';
	console.log(this);
}//manage ALL exceptions without THROWING exceptions come real deployment callbacks, and proper degradation

/** */
function getFile(filename, callBack)
{//acquiring a new file from the server and appending it to the head
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
			callBack(new UtilityException('Type: ' + type + ' not supported by getFile'));
			return;
		}
		else
			return new UtilityException('Type: ' + type + ' not supported by getFile');
	}
	
	craftFile(filename, type, function(newNode){
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
				new UtilityException('Server took too long to find file: ' + filename + ', cannot getFile');
			}, 3000);
				
			newNode.onload = function(){
				clearTimeout(serverTimer);
				callBack();
			};			
		}
	});
}

/** */
function craftFile(filename, type, callBack)
{//forms a new dom-node based on type :supports JS, CSS
//(all you need:D )
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
		updateHTML(mainSocket, filename, callBack);
		return;
	}
	else
	{
		if(typeof(callBack) == 'function')
		{
			callBack(new UtilityException('Type: ' + type + ' not supported by craftFile'));
			return;
		}
		else
			return new UtilityException('Type: ' + type + ' not supported by craftFile');
	}
	
	if(typeof(callBack) == 'function')
		callBack(newFile);
	else
		return newFile;
}

/** */
function removeFile(filename, callBack)
{//remove a file no longer needed/wanted from the Head, does not remove the file from the browser until a refresh though
	var head = document.getElementsByTagName('Head')[0];
	var oldFile = document.getElementById(filename);
	if(oldFile === null)
	{
		if(typeof(callBack) == 'function')
		{
			callBack(new UtilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile'));
			return;
		}
		else
			return new UtilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile');
	}
	else
		oldFile = head.removeChild(oldFile);
	if(typeof(callBack) == 'function')
		callBack(oldFile);
}

/** */
function updateHTML(socketToListenOn, filename, callBack)
{//get other HTML content
	if(socketToListenOn === undefined)
	{
		if(typeof(callBack) == 'function')
		{
			callBack(new UtilityException('Socket has not been instantiated yet, cannot updateHTML'));
			return;
		}
		else
			return new UtilityException('Socket has not been instantiated yet, cannot updateHTML');
	}
	else if(!socketToListenOn.socket.connected)
	{
		if(typeof(callBack) == 'function')
		{
			callBack(new UtilityException('Socket is not connected, cannot updateHTML'));
			return;
		}
		else
			return new UtilityException('Socket is not connected, cannot updateHTML');
	}
	else
	{
		socketToListenOn.sendCommand('updatePage', filename);
		socketToListenOn.once('updatePage', function(data){
			if(data.error)
				new UtilityException('Filename: ' + filename + ' not found on server, cannot updateHTML'); 
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
function sendCommand(command, dataObject, callBack)
{//general send command function
	var commandObject = {'command':command, 'value':dataObject};
	try{
		if(typeof(callBack) == 'function')
			this.emit('command', commandObject, callBack);
		else
			this.emit('command', commandObject);
	}
	catch(error){
		return new UtilityException('Socket has not been instantiated yet, cannot sendCommand: ' + command);
	}
}

/** */
function actionCommand(data, socket, functionMap)
{//general recieve command function
	if(logging.trace)
		logging.log('In actionCommand');
	try{
		functionMap[data.command](data.value, socket);
	}
	catch(error){
		return new UtilityException('Error in actionCommand: ' + data.command + ' : ' + error);
	}
	
}