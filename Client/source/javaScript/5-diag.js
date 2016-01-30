/** 
 *
 */

/** */
window.thillyDiag = {};

/** */
(function(debug){
	
	/** */
	var memoryCache = [];
	
	/** */
	this.init = function(){
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getFlags', {}, function(flags){
			updateFlags(flags);
		});
		var logBox = document.createElement('div');
			logBox.id = 'logBox';
		var memBox = document.createElement('div');
			memBox.id = 'memBox';
		var templateView = document.getElementById('templateView')
			templateView.appendChild(memBox);
			templateView.appendChild(logBox);
			
	};
	
	/** */
	this.beginLogging = function(element){
		if(debug.trace)
			debug.log('in beginLogging');
		if(thillyState.checkLogged()){
			if(element.className == 'inlineButton'){
				thillyUtil.listen(thillyIndex.mainSocket,'log', {}, updateLog);
				thillyUtil.sendReceive(thillyIndex.mainSocket, 'startLogging', {}, function(logCache){
					updateLog(logCache);
					thillyInteraction.reScale();
				});
				element.className = 'inlineButton selected';
				element.innerHTML = 'Stop Logging';
				var oldLog = document.getElementById('logDiv');
				if(!oldLog){
					var logDiv = document.createElement('div');
						logDiv.id = 'logDiv';
						logDiv.classname = 'logDiv'
					document.getElementById('logBox').appendChild(logDiv);
				}
				else{
					oldLog.style.display = 'block';
				}
			}
			else{
				unhookLog(element);
			}
		}
	};
		
	/** */
	this.beginMemory = function(element){
		if(debug.trace)
			debug.log('in beginMemory');
		if(thillyState.checkLogged()){
			if(element.className == 'inlineButton'){
				thillyUtil.listen(thillyIndex.mainSocket, 'memory', {}, updateMemory);
				thillyUtil.sendReceive(thillyIndex.mainSocket, 'startMemory', {}, function(memCache){
					memoryCache = memCache;
					element.className = 'inlineButton selected';
					element.textContent = 'Stop Memory';
					var oldBox = document.getElementById('memDiv');
					if(!oldBox){
						var memDiv = document.createElement('canvas');
							memDiv.id = 'memDiv';
							memDiv.classname = 'memDiv'
							memDiv.height = 400;
							memDiv.width = document.getElementById('articleContent00000001template').offsetWidth;
							document.getElementById('memBox').appendChild(memDiv);
					}
					document.getElementById('memDiv').style.display = 'inline';
					thillyInteraction.reScale();
				});	
			}
			else
				unhookMemory(element);
		}
	};
	
	/** */
	function unhookLog(element){
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'stopLogging', {}, function(){
				thillyIndex.mainSocket.removeListener('log', updateLog);
				thillyInteraction.reScale();
				if(element){
					document.getElementById('logDiv').style.display = 'none';
					element.innerHTML = 'View Log';
					element.className = 'inlineButton';
				}
			});
		}
		
	/** */
	function unhookMemory(element){
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'stopMemory', {}, function(){
			thillyIndex.mainSocket.removeListener('memory', updateMemory);
			thillyInteraction.reScale();
			if(element){
				document.getElementById('memDiv').style.display = 'none';
				element.className = 'inlineButton';
				element.textContent = 'View Memory';
			}
		});
	}
	
	/** */
	function updateLog(log){
		if(debug.trace)
			debug.log('in updateLog');
		var logDiv = document.getElementById('logDiv');
		if(logDiv == null){
			unhookLog();
			return;		
		}			
		if(typeof log == 'object'){
			var logWrapper = document.createElement('div');
			for(var i = 0; i < log.length; i++){
				var logObj = document.createElement('div');
					logObj.className = 'logObj';
					logObj.textContent = log[i];
					logWrapper.appendChild(logObj);
			}
			logDiv.appendChild(logWrapper);
			logWrapper.outerHTML = logWrapper.innerHTML;
		}
		else{
			var logObj = document.createElement('div');
			logObj.className = 'logObj';
			logObj.innerHTML = log;
			logDiv.appendChild(logObj);
			while(logDiv.childNodes.length > 100)
				logDiv.removeChild(logDiv.childNodes[0]);
		}
	}

	/** */
	function updateMemory(memory){
		if(debug.trace)
			debug.log('in updateMemory: ' + memory);
		if(memory)
			memoryCache.push(memory);
		if(memoryCache.length > 150)
			memoryCache.shift();
		if(document.getElementById('memDiv'))	
			getStats(memoryCache, drawMemory);
		else
			unhookMemory();

	}
	
	/** */
	function getStats(memory, callBack){
		if(debug.trace)
			debug.log('in getStats');
		var bounds = {
			rss 	: findBounds(memory, 'rss'),		
			used 	: findBounds(memory, 'heapUsed'),					
			total 	: findBounds(memory, 'heapTotal')			
		};
		callBack(memory, bounds);	
	}
	
	/** */
	function findBounds(array, flag){
		if(debug.trace)
			debug.log('in findBounds: ' + flag);
		var highest;
		var lowest;
		for(var i = 0; i < array.length; i++){
			if(array[i][flag] > highest || !highest)
				highest = array[i][flag];
			if(array[i][flag] < lowest || !lowest)
				lowest = array[i][flag];	
		}
		return {hi: highest, lo:lowest};
	}
	
	/** */
	function updateFlags(flags){
		if(debug.trace)
			debug.log('in updateFlags');

		var flagBox = document.getElementById('loggingChecks');
		var flagWrapper = document.createElement('div');
		for(var eachFlag in flags){
			var aFlag = document.createElement('input');
				aFlag.className = 'templateInputTiny';
				aFlag.type = 'checkbox';
				aFlag.id = 'flag' + eachFlag;
				aFlag.value = eachFlag;
				flagWrapper.appendChild(aFlag);
				flagWrapper.innerHTML += eachFlag;
		}
		flagBox.appendChild(flagWrapper);
		flagWrapper.outerHTML = flagWrapper.innerHTML;
		
		for(var eachFlag in flags){
			var aFlag = document.getElementById('flag' + eachFlag);
				aFlag.checked = flags[eachFlag];
				aFlag.onchange = function(){
					var data = {};
					data[this.value] = this.checked;
					thillyUtil.sendReceive(thillyIndex.mainSocket, 'updateFlag', data, function(flags){
						alert(flags);
					});
				};
			
		}
	}

	/** */
	function drawMemory(memArray, bounds){
		if(debug.trace)
			debug.log('in drawMemory');
		var canvas = document.getElementById('memDiv');
		var context = canvas.getContext('2d');
		context.clearRect(0,0, canvas.width, canvas.height);
		
		drawLine('heapUsed', memArray, bounds.used.lo, bounds.used.hi, 65);
		context.fillText('Used:' + (bounds.used.lo/(1024*1024)).toPrecision(4) + '-' + (bounds.used.hi/(1024*1024)).toPrecision(4) + ' MB', 0, 48);
		drawLine('heapTotal', memArray, bounds.total.lo, bounds.total.hi, 130);
		context.fillText('Total:' + (bounds.total.lo/(1024*1024)).toPrecision(4) + '-' + (bounds.total.hi/(1024*1024)).toPrecision(4) + ' MB', 0, 32);
		drawLine('rss', memArray, bounds.rss.lo, bounds.rss.hi, 195);
		context.fillText('RSS:' + (bounds.rss.lo/(1024*1024)).toPrecision(4) + '-' + (bounds.rss.hi/(1024*1024)).toPrecision(4) + ' MB', 0, 16);

		if(memArray.length){
			context.fillStyle = 'White';
			context.fillText('Data Points: ' + memArray.length, 0, 64);
			context.fillText('Time Elapsed: ' + (memArray.length * 2) + 'sec', 0, 80);
		}
	}

	/** */
	function drawLine(memPart, array, lowest, highest, offset){
	
		var canvas = document.getElementById('memDiv');
		var context = canvas.getContext('2d');
		var height;
		var dX = canvas.width / array.length;
		var colorMap = {
			rss: 'White',
			heapTotal: 'Grey',
			heapUsed: 'Black'
		};
		
		context.font = '12pt Arial';
		context.textAlign = 'left';
		context.fillStyle = colorMap[memPart];
		context.strokeStyle = colorMap[memPart];
		context.beginPath();
		context.moveTo(0, canvas.height - (array[0][memPart] - lowest)*((canvas.height)/(highest-lowest+1)));
		
		for(var i = 0; i < array.length; i++){
			height = canvas.height - (array[i][memPart] - lowest)*((canvas.height)/(highest-lowest+1));//the height of the current datapoint
			context.lineTo(i * dX + dX, height);
			if(i == array.length-1)
				context.fillText((array[i][memPart]/(1024*1024)).toPrecision(4) + 'MB', canvas.width-offset, (height>20) ? height : height+20);
		}
		context.stroke();
	}
	
}).apply(window.thillyDiag, [window.thillyLogging]);	
















