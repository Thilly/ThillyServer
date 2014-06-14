
/** */
var exceptionList = {	
	'1': function(){getFile('iWillBreak.cjs');},//bad file extension in get file
	'2': function(){updateHTML(mainSocket,'iWillBreak.html');},//socket not connected
	'3': function(){craftFile('iWillBreak.ksj');},//bad file extension in craft file
	'4': function(){removeFile('iWillBreak.js');},//no file to remove
	'5': function(){updateHTML(errorSocket,'iWillBreak.html');},//socket not instantiated
	'6': function(){sendCommand('iWillBreak', {'iWill':'break'});},//no socket that was instantiated
	'7': function(){getFile('iWillBreak.js');}//file time(s)-out(s) from server
};

/** */
function testTester(){
	setTimeout(function(){
		mainSocket.disconnect();//so I can 'throw' socket disconnect error
		for(var i in exceptionList)
		{
				console.log('testing: '+ exceptionList[i]);
				exceptionList[i]();
		}
	}, 1000);
}