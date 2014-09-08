/** */
var diff = require('diff');

/** */
var diffs = {
	values: "",//will be the answers that are actually different
	numWrong: 0//how many different values held by diff (/2 for number wrong)
}

/** */
process.on('message', function(data){
	//data passed is an object with two parts, correct 'answer' and users 'output'
	var outPut = diff.diffWords(data.answer, data.output);//run the diff library on words to not look at whitespace

	for(var thing in outPut)//for each difference
	{
		if((outPut[thing].added)||(outPut[thing].removed))//color code based on user or answer
		{
			diffs.values += ((outPut[thing].added)?(outPut[thing].value):(outPut[thing].value));
			diffs.numWrong++;//inc number wrong
		}
	}
	
	diffs.numWrong = Math.ceil(diffs.numWrong/2);//to show incorrect answers.
	//1 wrong for answer and 1 for user, 2 per each wrong answer
	
	process.send(diffs);	
});