//
//

var mainSocket;
var voidSocket;

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
	mainSocket.sendCommand = sendCommand;
	mainSocket.sendCommand('test', {'test': 'test'});
	
	console.log(mainSocket);
	getFile('DependencyInjection.html', function(data){
		console.log('response from server' + data.length)
		var aFile = document.createElement('div');
		aFile.innerHTML = data;
		document.getElementsByTagName('body')[0].appendChild(aFile);
	});
/*	
//test various exceptions on delivery of util.js	
var exceptionObject = {	
	'1': function(){getFile('iWillBreak.cjs');},//bad file extension in get file
	'2': function(){updateHTML(mainSocket,'iWillBreak.html');},//socket not connected
	'3': function(){craftFile('iWillBreak.ksj');},//bad file extension in craft file
	'4': function(){removeFile('iWillBreak.js');},//no file to remove
	'5': function(){updateHTML(voidSocket,'iWillBreak.html');},//socket not instantiated
	'6': function(){sendCommand('iWillBreak', {'iWill':'break'});},//no socket that was instantiated
	'7': function(){getFile('iWillBreak.js');}//file time(s)-out(s) from server
	};
	
	
	
setTimeout(function(){
	mainSocket.disconnect();
	for(var i in exceptionObject)
		try{
			console.log('testing: '+ exceptionObject[i]);
			exceptionObject[i]();
		}
		catch(error){//for lulz
		//dont actualy throw/catch anything during deployment
			console.log(error);
		}
}, 1000);
*/
};


