function UtilityException(msg)
{//standard exception for this script
	this.message = msg;
	this.name = 'Utility Exception';
	console.log(msg);
}//manage ALL exceptions without THROWING exceptions come real deployment callbacks, and proper degradation

function getFile(filename, callBack)
{//acquiring a new file from the server and appending it to the head
	var head = document.getElementsByTagName('Head')[0];
	var type = filename.substring(filename.indexOf('.'));
	if(filename.indexOf('.js') >= 0)//if plan on adding JS
		type = 'script';
	else if(filename.indexOf('.css') >= 0)//if plan on adding CSS
		type = 'link';
	else if(filename.indexOf('.html') >= 0)//if just grabbing more rawHTML
	{
		updateHTML(mainSocket, filename, callBack);
		return;
	}
	else
		throw new UtilityException('Type: ' + type + ' not supported by getFile');
		
	craftFile(filename, type, function(newFile){
		head.appendChild(newFile);
			var serverTimer = setTimeout(function(){
					var potentialDead = newFile;
					var potentialHead = head;
				/*
					since closures can change the local head and newFile of getFile().
					the newfile.onload() is fine since it changes, wont override this particular event
				*/
					head.removeChild(potentialDead);
					window.stop();
					//throw
					console.log(new UtilityException('Server took too long to find file: ' + filename + ', cannot getFile'));
					//how to throw and catch this guy?
				}, 3000);
				
		newFile.onload = function(){
			clearTimeout(serverTimer);
			if(typeof(callBack) == 'function')
				callBack();
		};			
	});
}

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
	else
		throw new UtilityException('Type: ' + type + ' not supported by craftFile');
		
	if(typeof(callBack) == 'function')
		callBack(newFile);
	else
		return newFile;
}

function removeFile(filename, callBack)
{//remove a file no longer needed/wanted from the Head, does not remove the file from the browser until a refresh though
	var head = document.getElementsByTagName('Head')[0];
	var oldFile = document.getElementById(filename);
	if(oldFile === null)
		throw new UtilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile');
		
	oldFile = head.removeChild(oldFile);
	if(typeof(callBack) == 'function')
		callBack(oldFile);
}

function updateHTML(socketToListenOn, filename, callBack)
{//changes the context of the main page
	if(socketToListenOn === undefined)
		throw new UtilityException('Socket has not been instantiated yet, cannot updateHTML');
//	if(socketToListenOn.socket.connected)
//	{
		socketToListenOn.sendCommand('updatePage', filename);
		socketToListenOn.once('updatePage', function(data){
			console.log('got response from server ' + data.length);
			if(data === null)
				throw new UtilityException('Filename: ' + filename + ' not found on server, cannot updateHTML'); 
			if(typeof(callBack) == 'function')
				callBack(data);
			else
				document.getElementById('theContext').innerHTML = data.toString();
		});
//	}
//	else
//		throw new UtilityException('Socket is not connected, cannot updateHTML');
}

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
		throw new UtilityException('Socket has not been instantiated yet, cannot sendCommand');
	}
}

