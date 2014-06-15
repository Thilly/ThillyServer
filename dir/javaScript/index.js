//
//

var mainSocket;

var functionMap = {};

window.onload = init;

function init(){

	mainSocket = io.connect(document.URL);
	
	mainSocket.sendCommand = thillyUtil.sendCommand;
	mainSocket.actionCommand = thillyUtil.actionCommand;
	
	mainSocket.on('connect',function(){
		thillyUtil.getFile('javaScript/interaction.js', function(){
			thillyUtil.getFile('content/DependencyInjection.html', function(data){
				thillyInteraction.addArticle('Dependency Injection', '', data);
				thillyUtil.getFile('content/FAQ.html', function(data){
					thillyInteraction.addArticle('FAQ', '', data);
				});
			});	
		});
	});
};