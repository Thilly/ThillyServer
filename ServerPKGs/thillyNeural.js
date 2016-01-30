/** */
var network = require('brain');
	network = new network.NeuralNetwork();

/** */
var msgMap = {
	'neuralTrain' : trainNetwork,
	'neuralTest' : runTest	
}

var trained = false;

/** */
process.on('message', function(message){
	console.log('received message :' + message.msg);
	if(msgMap[message.msg]){
		msgMap[message.msg](message.data);
	}
});

/** */
function trainNetwork(data){
	console.log('training network');
	var newTestData = [];
	for(var i = 0; i < data.testData.length; i++){
		var aTest = {
			input: data.testData[i].input,
			output: genCorrect(data.testData[i].output)
		};
		newTestData.push(aTest);
	}	
	network.train(newTestData,{
		log: true,
		logPeriod: 1,
		iterations: 5
	});
	process.send({msg:'testResponse', 'value':{replyTo:data.command, result:'Training Completed'}});
	trained = true;
}

/** */
function runTest(data){
	if(!trained){
		process.send({msg:'testResponse', 'value':{replyTo:data.command, result:'Network not trained yet'}});
	}
	else{
		console.log('received Data on neural network');
		var testData = data.testData;
		for(var i = 0; i < testData.length; i++)
			testData[i] /= 255;
		var result = network.run(testData);
		console.log(genAnswer(result));
		process.send({msg:'testResponse', 'value':{replyTo:data.command, result:genAnswer(result)}});
	}
}



function genAnswer(value){
	var max = -1/0; idx = 0;
	for(var i = 0; i < value.length; i++){
		if(value[i] > max){
			max = value[i];
			idx = i;
		}
	}
	return idx;
}

function genCorrect(value){
	var correct = [];
	for(var i = 0; i < 10; i++){
		correct[i] = ((value == i)?1:0);
	}
	return correct;
}