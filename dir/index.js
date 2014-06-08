//
//

var mainSocket;
var errorSocket;

var functionMap = {};

window.onload = function(){

	var box = document.getElementById('testJS');
	box.innerHTML = 'JS is working too! :D';	
	
	console.log('getting file tester.js');
	getFile('tester.js', function(){
		console.log('got tester.js');
		testTester();
		removeFile('tester.js', function(){
			console.log('removed tester.js');
		});
	});
	
	mainSocket = io.connect(document.url);
	mainSocket.on('connect', function(){
		mainSocket.sendCommand = sendCommand;		
		getFile('DependencyInjection.html', function(newDiv){
			document.getElementsByTagName('body')[0].appendChild(newDiv);
		});
	});
	
	mainSocket.on('command', function(data){
		actionCommand(data, mainSocket, functionMap)
	});
	

//test various exceptions on delivery of util.js	
	var exceptionList = {	
		'1': function(){getFile('iWillBreak.cjs');},//bad file extension in get file
		'2': function(){updateHTML(mainSocket,'iWillBreak.html');},//socket not connected
		'3': function(){craftFile('iWillBreak.ksj');},//bad file extension in craft file
		'4': function(){removeFile('iWillBreak.js');},//no file to remove
		'5': function(){updateHTML(errorSocket,'iWillBreak.html');},//socket not instantiated
		'6': function(){sendCommand('iWillBreak', {'iWill':'break'});},//no socket that was instantiated
		'7': function(){getFile('iWillBreak.js');}//file time(s)-out(s) from server
	};
		
	setTimeout(function(){
		mainSocket.disconnect();
		for(var i in exceptionList)
		{
				console.log('testing: '+ exceptionList[i]);
				exceptionList[i]();
		}
	}, 1000);

};


