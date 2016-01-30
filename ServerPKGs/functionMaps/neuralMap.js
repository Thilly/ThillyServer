/** */
var logging, files, mongo;

/** */
module.exports = function(deps){

	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
	neural = deps.neural;
	
	/** */
	return {
		'getTests' : getTests,
		'neuralTest' : runTest,
		'testResponse' : serveResult,
		'neuralTrain' : trainNetwork,
		'approveTest' : approveTest,
		'removeTest' : removeTest
	};
};

/** */
var pendingRequests = {};
var currentRunner = 0;

/** */
function getTests(data, socket, exception){
	mongo.select({db:'thillyNet', coll:'neural'}, {okayed: false}, function(error, data){
		if(error){
			logging.log.errors('Error in getTests: ' + error);
			socket.sendCommand(data.command, {'error': error});
		}
		else
			socket.sendCommand(data.command, {'value':data.toString()});
	});
}

/** */
function trainNetwork(data, socket, exception){
	console.log('starting query to train network:');
	mongo.select({db:'thillyNet', coll:'neural'}, {okayed:true}, {limit:3000}, function(error, neuralDat){
		console.log('retreived query to train');
		var requestHash = socket.id;
		while(pendingRequests[requestHash])
			requestHash += Math.floor(Math.random()*10);
		pendingRequests[requestHash] = [socket, data.command];
		var testData = [];
		for(var i = 0; i < data.length; i++){
			testData.push(data.input);
		}
		for(var i = 0; i < neural.length; i++)
			neural[i].send({'msg':'neuralTrain', 'data':{testData:neuralDat, command:requestHash}});
	});
}

/** */
function runTest(data, socket, exception){
	var testData = data.testData;
	
	mongo.getCount({db:'thillyNet', coll:'neural'}, {}, function(error, neuralCount){
		mongo.insert({db:'thillyNet', coll:'neural'},{'input': testData.input,'output':testData.output,
											'testNum':(neuralCount+1), okayed:false },
											function(error, neuralDat){
			var requestHash = socket.id;
			while(pendingRequests[requestHash])
				requestHash += Math.floor(Math.random()*10);
			pendingRequests[requestHash] = [socket, data.command];
			neural[(currentRunner++)%neural.length].send({'msg':'neuralTest', 'data':{testData:testData, command:requestHash}});
		});
	});
}

/** */
function serveResult(data){
	var socket = pendingRequests[data.replyTo][0];
	var command = pendingRequests[data.replyTo][1];
	pendingRequests[data.hash] = false;
	socket.sendCommand(command, {'value':data.result});
}

/** */
function approveTest(data, socket, exception){
	mongo.update({db:'thillyNet', coll:'neural'},{'testNum':data.testNum},{okayed:true},function(error, result){
		if(error){
			logging.log.errors('Error in approveTest: ' + error);
			socket.sendCommand(data.command, {'error': error});
		}
		else
			socket.sendCommand(data.command, {'value':data.toString()});	
	});	
}

/** */
function removeTest(){
	//TODO
}