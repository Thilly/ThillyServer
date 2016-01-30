/** 
 *
 */

/** */
window.thillyUtil = {};

/** */
(function(debug){

	var months = {
		'01': 'Jan',
		'02': 'Feb',
		'03': 'Mar',
		'04': 'Apr',
		'05': 'May',
		'06': 'Jun',
		'07': 'Jul',
		'08': 'Aug',
		'09': 'Sep',
		'10': 'Oct',
		'11': 'Nov',
		'12': 'Dec'	
	};

	var functionMap = {};
	
	String.prototype.insertAt = function(index, string){
		return [this.slice(0, index) + string + this.slice(index)].join('');
	}
	
	/** */
	this.clearPendingFunctions = function(){
		for(var aFunc in functionMap){
			delete functionMap[aFunc];
		}
	};
	
	/** */
	this.utilityException = function(msg){
		if(debug.trace)
			debug.log('in utilityException: ' + msg); 
		this.message = msg;
		this.name = 'Utility Exception';
	}//manage ALL exceptions without THROWING exceptions come real deployment callbacks, and proper degradation

	/** */
	this.craftFile = function(filename, type, callBack){
		if(debug.trace)
			debug.log('in craftFile: ' + filename); 
		var newFile;
		newFile = document.createElement(type);
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
			this.updateHTML(thillyIndex.mainSocket, filename, callBack);
			return;
		}
		else
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new thillyUtil.utilityException('Type: ' + type + ' not supported by craftFile'));
				return;
			}
			else
				return new thillyUtil.utilityException('Type: ' + type + ' not supported by craftFile');
		}
		
		if(typeof(callBack) == 'function')
			callBack(newFile);
		else
			return newFile;
	}

	/** */
	this.hasFile = function(fileName, callBack){
		if(debug.trace)
			debug.log('in hasFile: ' + fileName);
		var theFile = document.getElementById(fileName);
		if(theFile)
			return true;
		else
			return false;
	
	}
	
	/** */
	this.removeFile = function(filename, callBack){
		if(debug.trace)
			debug.log('in removeFile: ' + filename); 
		var head = document.getElementsByTagName('head')[0];
		var oldFile = document.getElementById(filename);
		if(oldFile == 'undefined')
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new thillyUtil.utilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile'));
				return;
			}
			else
				return new thillyUtil.utilityException('Filename: ' + filename + ' not found in the DOM, cannot removeFile');
		}
		else
			oldFile = head.removeChild(oldFile);
		if(typeof(callBack) == 'function')
			callBack(oldFile);
	}

	/** */
	this.getFile = function(filename, callBack){
		if(debug.trace)
			debug.log('in getFile: ' + filename); 
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
				callBack(new thillyUtil.utilityException('Type: ' + type + ' not supported by getFile'));
				return;
			}
			else
				return new thillyUtil.utilityException('Type: ' + type + ' not supported by getFile');
		}
		
		this.craftFile(filename, type, function(newNode){
			if(debug.trace)
				debug.log('after craftFile: ' + filename); 
			if(type == 'div')
			{
				callBack(newNode);
			}
			else if(type == 'script' || type == 'link')
			{
				var serverTimer = setTimeout(function(){
					var potentialDead = newNode;
					var potentialHead = head;
				/*
					since closure from getFile() can change the local head and newNode of craftFile().
					the newNode.onload() is fine since newNode changes, wont override that particular event
				*/
					head.removeChild(potentialDead);
					if(!(thillyIndex.browser.ie))
						window.stop();
					else
						document.execCommand('Stop');
					//bail
					new thillyUtil.utilityException('Server took too long to find file: ' + filename + ', cannot getFile');
				}, 3000);
				
				newNode.onload = function(){
					clearTimeout(serverTimer);
					callBack();
				};	
				
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(newNode);
	
			}
		});
	}

	/** */
	this.updateHTML = function(socketToListenOn, filename, callBack){
		if(debug.trace)
			debug.log('in updateHTML: ' + filename); 

		if(socketToListenOn === undefined){
			if(typeof(callBack) == 'function'){
				callBack(new thillyUtil.utilityException('Socket has not been instantiated yet, cannot updateHTML'));
				return;
			}
			else
				return new thillyUtil.utilityException('Socket has not been instantiated yet, cannot updateHTML');
		}
		else if(!socketToListenOn.connected)
		{
			if(typeof(callBack) == 'function')
			{
				callBack(new thillyUtil.utilityException('Socket is not connected, cannot updateHTML'));
				return;
			}
			else
				return new thillyUtil.utilityException('Socket is not connected, cannot updateHTML');
		}
		else
		{
			socketToListenOn.sendCommand('updatePage', filename);
			socketToListenOn.once('updatePage', function(data){
				if(data.error)
					new thillyUtil.utilityException('Filename: ' + filename + ' not found on server, cannot updateHTML'); 
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
	this.dateTimeStamp = function(type){
		var date = new Date();
		var year = date.getFullYear();
		var month = (date.getMonth() + 1);
			if(month < 10)
				month = '0' + month;
		var day = date.getDate();
			if(day < 10)
				day = '0' + day;
		var dateString = '' + year + month + day;
		if(type === 'full')
		{
			var hour = date.getHours();
			if(hour < 10)
				hour = '0' + hour;
			var minute = date.getMinutes();
			if(minute < 10)
				minute = '0' + minute;
			var seconds = date.getSeconds();
			if(seconds < 10)
				seconds = '0' + seconds;
			dateString += '' + hour + minute + seconds;	
		}
		return dateString;
	}
	
	/** */
	this.unDateStamp = function(dateTimeStamp){
		var year = dateTimeStamp.substring(0,4);
		var month = months[dateTimeStamp.substring(4,6)];
		var day = dateTimeStamp.substring(6,8);
		var hour, minute, second, time;
		if(dateTimeStamp.length > 8){
			hour = dateTimeStamp.substring(8,10);
			minute = dateTimeStamp.substring(10,12);
			second = dateTimeStamp.substring(12,14);
			time = ' ' + hour + ':' + minute + ':' + second;
		}
		return day + ' ' + month + ' ' + year + time;	
	};
	
	/** */
	this.showLogin = function(){
		document.getElementById('modal').style.visibility = 'visible';		
	};
	
	/** */
	this.createLoginWall = function(outElement, inElement, callBack){
		
		var loginButton = document.createElement('span');
			loginButton.className = 'inlineButton';
			loginButton.textContent = 'Login';
			loginButton.onclick = function(){
				thillyUtil.showLogin();
			};
			
		var innerOut = document.createElement('span');
			innerOut.className = 'out';
			innerOut.appendChild(loginButton);
		if(typeof outElement == 'object')
			innerOut.appendChild(outElement);
			
		var innerIn = document.createElement('span');
			innerIn.className = 'in';
		if(typeof inElement == 'object')
			innerIn.appendChild(inElement);
			
		var outerBox = document.createElement('span');
			outerBox.className = (thillyState.checkLogged()?'loggedIn':'loggedOut');
			outerBox.appendChild(innerOut);	
			outerBox.appendChild(innerIn);	
		
		if(typeof callBack == 'function')
			callBack(outerBox);
		else
			return outerBox;
	};
	
	/** */
	this.login = function(element, cookie){
		var box = element;
		var data = {
			userString : (cookie)?cookie:false,
			userName : (element)?box.querySelector('#userNameInput').value:false,
			password : (element)?box.querySelector('#passwordInput').value:false
		};
		if(cookie)
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'login', data, function(data, socket){
				thillyUtil.loginResult(data, socket, box);
			});
		else if(data.userName != '' && data.password != '')
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'login', data, function(data, socket){
				thillyUtil.loginResult(data, socket, box);
			});
		else if(data.userName == '')
			box.querySelector('#errorMessage').innerHTML = 'Must supply username';
		else if(data.password == '')
			box.querySelector('#errorMessage').innerHTML = 'Must supply password';
	};
	
	/** */
	this.logOut = function(){
		thillyIndex.userString = '';
		thillyIndex.type = '';
		thillyIndex.name = '';
		if(debug.trace)
			debug.log('in checkCache');
		if(typeof(Storage) !== 'undefined'){
			localStorage.setItem('userString', '');
		}
		thillyState.loggedIn(false);
	};

	/** */
	this.loginResult = function(data, socket, box){
		if(debug.trace)
			debug.log('in loginResult');
			
		if(data.failed){
			box.querySelector('#errorMessage').innerHTML = data.failed;
			debug.log('Login failed: ' + data.failed);
		}
		
		if(data.success){
			eval(data.userScript);
			thillyIndex.user = {type: data.type, name: data.name};
			localStorage.setItem('userString', data.userString);
			thillyState.loggedIn(true);
			if(box)
				thillyUtil.cancel(box);
		}
	}
	
	/** */
	this.registerAccount = function(element){
		var box = element;
		var rePassword =  box.querySelector('#reenterInput').value;
		
		var data = {
			userName :  box.querySelector('#userNameInput').value,
			password :  box.querySelector('#passwordInput').value
		};
		if(data.password != rePassword)
			box.querySelector('#errorMessage').innerHTML = 'Passwords do not match';
		else if(data.userName != '' && data.password != '')
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'register', data, function(data, socket){
				thillyUtil.loginResult(data, socket, box);
			});
		else if(data.userName == '')
			box.querySelector('#errorMessage').innerHTML = 'Must supply username';
		else if(data.password == '')
			box.querySelector('#errorMessage').innerHTML = 'Must supply password';
	};
	
	/** */
	this.cancel = function(elem){
		var box = elem;
		var loginButton = box.querySelector('#submitLoginButton');
		var cancelRegister = box.querySelector('#cancelRegisterButton');
		var reEnter = box.querySelector('#reenterBox');
		var errorBox = box.querySelector('#errorMessage');
		var inputs = box.childNodes;
		
		for(var i in inputs)
			if(inputs[i].value != '')
				inputs[i].value = '';
		document.getElementById('modal').style.visibility = 'hidden';
		reEnter.style.visibility = 'hidden';
		cancelRegister.style.visibility = 'hidden';
		loginButton.innerHTML = 'Login';
		errorBox.innerHTML = '';
		loginButton.onclick = '';
		loginButton.onclick = function(){thillyUtil.login(this.parentNode.parentNode);};
	};
		
	/** */
	this.register = function(element){
		var box = element;
		var loginBox = box.querySelector('#popupLogin');
		var reEnter = box.querySelector('#reenterBox');
		var loginButton = box.querySelector('#submitLoginButton');
		var cancelButton = box.querySelector('#cancelRegisterButton');
		box.querySelector('#errorMessage').innerHTML = '';
		loginButton.onclick = '';
		
		if(loginButton.innerHTML == 'Login'){
			reEnter.style.visibility = 'visible';
			cancelButton.style.visibility = 'visible';
			loginButton.innerHTML = 'Register';			
			loginButton.onclick = function(){ thillyUtil.registerAccount(this.parentNode.parentNode);};
		}
		else{			
			reEnter.style.visibility = 'hidden';
			cancelButton.style.visibility = 'hidden';
			loginButton.innerHTML = 'Login';
			loginButton.onclick = function(){ thillyUtil.login(this.parentNode.parentNode);};
		}
	};
	
	/** */
	this.replaceClasses = function(from, to){
		var toggleNodes = document.getElementsByClassName(from);
		while(toggleNodes.length > 0)
			if(toggleNodes[0].className){
				if(toggleNodes.pop){//for IE
					var nextNode = toggleNodes.pop();
					nextNode.className = nextNode.className.replace(from,to);
				}
				else
					toggleNodes[0].className = toggleNodes[0].className.replace(from,to);
			}
	}
	
	/** */
	this.send = function(socket, command, data){
		var tries = 0;
		command = command + tries;
		socket.sendCommand(command, data);
	};
	
	/** */
	this.sendReceive = function(socket, command, data, callBack){
	
		var tries = 0;
		while(functionMap[command + tries])
			tries++;
			
		command = command + tries;
			
		var tempFunc = function(response){
			clearTimeout(delay);
			callBack(response);
		};
		
		functionMap[command] = {};
		functionMap[command].func = tempFunc;
		functionMap[command].once = true;
		
		var delay = setTimeout(function(){
			delete functionMap[command];
			debug.log('removed event: ' + command);
		}, 1000);
		
		socket.sendCommand(command, data);
	};
	
	/** */
	this.listen = function(socket, command, data, callBack){
		
		command += '0';
		
		if(functionMap[command])
			delete functionMap[command];
		
		var tempFunc = function(response){
			callBack(response);
		};
		
		functionMap[command] = {};
		functionMap[command].func = tempFunc;
		functionMap[command].once = false;
		
		socket.sendCommand(command, data);	
	};

	/** */
	this.stopListening = function(socket, command){
		if(functionMap[command])
			delete functionMap[command];
	};
		
	/** */
	this.sendCommand = function(command, dataObject, callBack){
		if(debug.trace)
			debug.log('in sendCommand: ' + command); 

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
	this.actionCommand = function(data, socket){
		if(debug.trace)
			debug.log('in actionCommand: ' + data.command);
		try{
			functionMap[data.command].func(data.value, socket);
			if(functionMap[data.command].once)
				delete functionMap[data.command];
			else if(data.last)
				delete functionMap[data.command];
		}
		catch(error){
			return new thillyUtil.utilityException('Error in actionCommand: ' + data.command + ' : ' + error);
		}
	}
 	
	/** */
	this.stopBubble = function(event){
		if(event.stopPropagation)
			event.stopPropagation();
		else
			event.cancelBubble = true;
	};
	
}).apply(window.thillyUtil, [window.thillyLogging]);