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
};


