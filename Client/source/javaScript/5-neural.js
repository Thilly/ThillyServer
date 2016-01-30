/** */
window.thillyNeural = {};

/** */
(function(debug){
	
	var draw;
	var drawCtx;
	var smallImg;
	var smallImgCtx;
	
	this.init = function(){
		if(debug.trace)
			debug.log('in thillyNeural.init');
		document.getElementById('topContent').appendChild(buildPeices());
		drawCtx.lineWidth = 50;
		drawCtx.lineCap = 'round';
		document.addEventListener('mousedown', beginDraw);
		document.addEventListener('mousemove', continueDraw);
		document.addEventListener('mouseup', endDraw);
		thillyState.leaveState = leaveState;
	};	
	
	function leaveState(){
		if(debug.trace)
			debug.log('in thillyNeural leaveState');
		document.removeEventListener('mousedown', beginDraw);
		document.removeEventListener('mousemove', continueDraw);
		document.removeEventListener('mouseup', endDraw);
		document.getElementById('topContent').innerHTML = '';
	};
	
	var mouse = {
		down : false,
		x : 0,
		y : 0
	}
	
	function clearBoth(){
		drawCtx.clearRect(0, 0, draw.width, draw.height);
		smallImgCtx.clearRect(0, 0, smallImg.width, smallImg.height);
		document.getElementById('resultBox').innerHTML = '';
	}
	

	function beginDraw(event){
		if(event.target === draw){
			mouse.down = true;
			mouse.x = event.offsetX || event.clientX;
			mouse.y = event.offsetY || event.clientY;
		}
	}

	function continueDraw(event){
		if(mouse.down === true){
			drawCtx.beginPath();
			drawCtx.moveTo(mouse.x, mouse.y);
			var newX = event.offsetX || event.clientX;
			var newY = event.offsetY || event.clientY;
			drawCtx.lineTo(newX, newY);
			drawCtx.stroke();
			mouse.x = newX;
			mouse.y = newY;
		}
	}

	function endDraw(){
		mouse.down = false;
	}

	function parseCanvas(testing){
		var condensed = [];
		for(var y = 0; y < draw.width; y+=draw.height/smallImg.height){
			for(var x = 0; x < draw.width; x+=draw.width/smallImg.width){
				condensed.push(getChunk(drawCtx.getImageData(
					x,
					y,
					draw.width/smallImg.width,
					draw.height/smallImg.height))
				);
			}
		}
		createResult(condensed);
		if(testing === true){
			console.log('testing');
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'neuralTest', {testData: condensed}, showResult);
		}
	}

	function trainNetworks(){
		thillyUtil.listen(thillyIndex.mainSocket, 'neuralTrain', {data: 1}, showResult);
	}
	
	function showResult(neuralResult){
		console.log(neuralResult);
		var box = document.getElementById('resultBox');
			box.innerHTML = neuralResult.value;
	}
	
	function getChunk(imgDat){
		var total = 0;
		imgDat = imgDat.data;
		for(var i = 0; i < imgDat.length; i+=4){
			total += imgDat[i+3]*4;
		}
		return Math.floor(total/imgDat.length);
	}

	function createResult(imgData){
		var smallImgData = smallImgCtx.createImageData(smallImg.width,smallImg.height);
		var total = '';
		for(var i = 0; i < imgData.length; i++){
			smallImgData.data[(i*4)+3] = imgData[i];
			total+= imgData[i] + ',';
			if(i%28 == 0){
				console.log(total);
				total = '';
			}
				
		}
		smallImgCtx.putImageData(smallImgData, 0,0);
	}
	
	function buildPeices(){
		var topContent = new DocumentFragment();
		draw = document.createElement('canvas');
		draw.id = 'draw';
		draw.height = 560;
		draw.width = 560;
		smallImg = document.createElement('canvas');
		smallImg.id = 'smallImg';
		smallImg.height = 28;
		smallImg.width = 28;
		drawCtx = draw.getContext("2d");
		smallImgCtx = smallImg.getContext("2d");
		
		var parseButton = document.createElement('button');
		parseButton.innerHTML = 'Parse';
		parseButton.onclick = function(){
			parseCanvas(false);
		};

		var testButton = document.createElement('button');
		testButton.innerHTML = 'Test';
		testButton.onclick = function(){
			parseCanvas(true);
		};
		
		var clearButton = document.createElement('button');
		clearButton.innerHTML = 'Clear';
		clearButton.onclick = function(){
			clearBoth();
		};
		
		var trainButton = document.createElement('button');
		trainButton.innerHTML = 'Train';
		trainButton.onclick = function(){
			trainNetworks();
		};		
		var resultBox = document.createElement('H1');
		resultBox.innerHTML = 'neural response';
		resultBox.id = 'resultBox';
		
		topContent.appendChild(draw);
		topContent.appendChild(smallImg);
		topContent.appendChild(parseButton);
		topContent.appendChild(testButton);
		topContent.appendChild(clearButton);
		topContent.appendChild(thillyUtil.createLoginWall('', trainButton));
		topContent.appendChild(resultBox);
		return topContent;
	}

}).apply(window.thillyNeural, [window.thillyLogging]);