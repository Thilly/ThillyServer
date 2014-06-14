//
//

var mainSocket;

var functionMap = {};

window.onload = init;

function init(){

	mainSocket = io.connect('http://192.168.1.50');
	
	mainSocket.sendCommand = thillyUtil.sendCommand;
	mainSocket.actionCommand = thillyUtil.sendCommand;
	
	mainSocket.on('connect',function(){
		thillyUtil.getFile('javaScript/interaction.js', function(){
			thillyUtil.getFile('content/DependencyInjection.html', function(data){
				thillyInteraction.addArticle('thing', '', data);
			});
		});
	});
};