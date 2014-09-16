/** */
var messageMap = {
	'contestData' : runSubmission
};

/** */
var compilerMap = {
	'JavaScript' : runJS,
	'C++' 	: buildC,
	'Java'	: buildJava
};

/** */
var fileSys = require('fs');

/** */
process.on('message', function(data){
	if(messageMap[data.msg])
		messageMap[data.msg](data.data);
});

/** */
function runSubmission(data){
	if(compilerMap[data.language])
		compilerMap[data.language](data)
}

/** */
function runJS(data){
	
	if(data.code.indexOf('require(') > -1){
		process.send({reason:'compError', error:'Compile ERROR: Cannot use "require" in JS submissions'});
	}
	else{
		try{
			var submittedFunction = eval(data.code);
			if(typeof submittedFunction != 'function'){
				process.send({reason:'compError', error:'Compile ERROR: check your source code and language, something is weird'});
				console.log(submittedFunction);
			}
			process.send({reason:'running'});
			try{
				var response = submittedFunction(data.testData.testCases);
				process.send({reason:'finished', data:response});				
			}
			catch(runtimeError){
				process.send({reason:'compError', error:runtimeError});
			}
		}
		catch(evalError){
			process.send({reason:'compError', error:'Compile ERROR: check your source code and language, something is weird'});
		}
	}
}

/** */
function buildC(data){

	var fileName = new Date().getTime() + '.cpp';
	makeFile(fileName, data.code, function(error, newName){
		if(error)
			console.log(error);
		else{
			fileName = newName;
			compileC(fileName, function(progName){
				runC(progName, data.testData.testCases);
			});
		}
	});
	

	//run child to create file
	//compile file
	//run file
	//check output
}

/** */
function compileC(fileName, callBack){

	var outName = fileName.replace('.cpp', '.exe');
	var compile = require('child_process').exec('g++ -o ' + outName +' ' + fileName, function(compError, stdout, stderr){
		fileSys.unlink(fileName);
		if(compError){
			var regex = new RegExp(fileName, 'g');
			stderr = stderr.replace(regex, '\n-');
			process.send({reason:'compError', error:stderr});
		}
		else{
			process.send({reason:'running'});
			callBack(outName);
		}
	});
}

/** */
function runC(fileName, input){
	var response = '', stderror = '';
	var testing = require('child_process');
		testing = testing.exec(fileName.replace('.', 'C:/ThillyServer'), function(testError, stdout, stderr){
			fileSys.unlink(fileName);
			if(testError)
				process.send({reason:'compError', error:testError});
			else
				process.send({reason:'finished', data:response});
		});
	
	testing.stdin.write(input);
	testing.stdin.end();
	
	testing.stdout.on('data', function(chunk){//on each chunk that leaves the program
		response += chunk;
	});	
}

/** */
function buildJava(data){
	var fileName = new Date().getTime() + '.java';
	makeFile(fileName, data.code, function(error, newName){
		if(error)
			console.log(error);
		else{
			fileName = newName;
			compileJava(fileName, function(){
				runJava(data.testData.testCases);
			});
		}
	});
}

/** */
function compileJava(fileName, callBack){
	var compile = require('child_process').exec('javac ' + fileName, function(compError, stdout, stderr){
		fileSys.unlink(fileName);
		if(compError){
			stderr = stderr.replace(/\..*\.java/g, '\n-');
			process.send({reason:'compError', error:stderr});
		}
		else{
			process.send({reason:'running'});
			callBack();
		}
	});
}

/** */
function runJava(input){
	var response = '', stderror = '';
	var testing = require('child_process');
		testing = testing.exec('java -cp C:\\ThillyServer\\ServerPKGs\\ChildProcesses\\temp\ aSubmission', function(testError, stdout, stderr){
			fileSys.unlink('./ServerPKGs/ChildProcesses/temp/aSubmission.class');
			if(testError)
				process.send({reason:'compError', error:testError});
			else
				process.send({reason:'finished', data:response});
		});
	
	testing.stdin.write(input);
	testing.stdin.end();
	
	testing.stdout.on('data', function(chunk){//on each chunk that leaves the program
		response += chunk;
	});		
}

/** */
function makeFile(fileName, data, callBack){
	var newName = './ServerPKGs/ChildProcesses/temp/'+fileName;
	fileSys.writeFile(newName, data, function(error){
		callBack(error, newName);
	});
}



