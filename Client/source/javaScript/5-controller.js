/** */
window.thillyController = controller;

function controller(debug){

	var controllerMap = {
		'dPad' : dPad,
		'oneKey' : oneKey,
		'twoKey' : twoKey,
		'fourKey' : fourKey,
		'touch' : touch,
		'stick' : stick,
		'test' : test
	};

	var canvas, leftModel, rightModel;
	var portionX, portionY;
	
	this.getRight = function(){return rightModel};
	this.getLeft = function(){return leftModel};
	
	this.create = function(left, right){
		console.log('in create');
		canvas = document.getElementById('gameCanvas');
		portionX = (canvas.width/2)/5;
		portionY = canvas.height/5;
		leftModel = new controllerMap[left.type](left.args, false);
		rightModel = new controllerMap[right.type](right.args, true);
		
		window.addEventListener('resize', function(){
			topContent = document.getElementById('topContent');
			canvas.width = topContent.offsetWidth;
			canvas.height = topContent.offsetHeight;
			portionX = (canvas.width/2)/5;
			portionY = canvas.height/5;
			leftModel.resize();
			rightModel.resize();
		});
		
		thillyLayers.clear();
		thillyLayers.addLayer('controller', 0, function(layer){
			layer.addObject(leftModel);
			layer.addObject(rightModel);
		});		
		
		canvas.onclick = function(event){
			if(debug.trace)
				console.log('click');
			if(event.clientX > canvas.width/2){
				rightModel.click(event);
			}
			else
				leftModel.click(event);
		};	
		canvas.onmousedown = function(event){
			if(debug.trace)
				console.log('mouseDown');
			if(event.clientX > canvas.width/2){
				rightModel.mouseDown(event);
			}
			else
				leftModel.mouseDown(event);
		};	
		canvas.onmouseup = function(event){
			if(debug.trace)
				console.log('mouseUp');
			if(event.clientX > canvas.width/2){
				rightModel.mouseUp(event);
			}
			else
				leftModel.mouseUp(event);			
		};	
		canvas.onmousemove = function(event){
			if(debug.trace)
				console.log('mouseMove');
			if(event.clientX > canvas.width/2){
				rightModel.mouseMove(event);
			}
			else
				leftModel.mouseMove(event);
		};
	
		canvas.ontouchstart = function(event){
			event.preventDefault();
			if(debug.trace)
				console.log('touchStart');
			var touches = event.changedTouches;
			for(var i = 0; i < touches.length; i++){
				if(touches[i].clientX > canvas.width/2)
					rightModel.touchStart(touches[i]);
				else
					leftModel.touchStart(touches[i]);
			}
		};
		canvas.ontouchmove = function(event){
			event.preventDefault();
			if(debug.trace)
				console.log('touchMove');
			var touches = event.changedTouches;
			for(var i = 0; i < touches.length; i++){
				if(touches[i].clientX > canvas.width/2)
					rightModel.touchMove(touches[i]);
				else
					leftModel.touchMove(touches[i]);
			}
		};
		canvas.ontouchend = function(event){
			event.preventDefault();
			if(debug.trace)
				console.log('touchEnd');
			var touches = event.changedTouches;
			for(var i = 0; i < touches.length; i++){
				if(touches[i].clientX > canvas.width/2)
					rightModel.touchEnd(touches[i]);
				else
					leftModel.touchEnd(touches[i]);
			}
		};
	};

	function dPad(argObj, rightHalf){
		console.log('in dpad');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var up = new CustomEvent('dPad', {'detail':{'dPad':'up'}});
		var left = new CustomEvent('dPad', {'detail':{'dPad':'left'}});
		var right = new CustomEvent('dPad', {'detail':{'dPad':'right'}});
		var down = new CustomEvent('dPad', {'detail':{'dPad':'down'}});		
		if(rightHalf)
			leftSide = canvas.width/2;
			
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			
			context.fillStyle = 'black';
			context.fillRect((leftSide + portionX*2)-1, (portionY*2)-1, portionX+2, portionY+2);
			//middleSquare
			drawSquare(leftSide + portionX*4, portionY*2, 1, btnDown);//right
			drawSquare(leftSide + portionX*3, portionY*4, 2, btnDown);//down
			drawSquare(leftSide + portionX  , portionY*3, 3, btnDown);//left
			drawSquare(leftSide + portionX*2, portionY, 4, btnDown);//up
			
			function drawSquare(leftX, topY, amDown, whoDown){
				context.save();
				context.translate(leftX, topY);
				context.rotate((amDown*90) * Math.PI/180);
				
				context.fillStyle = (whoDown === amDown)?'white':'black';
					if(amDown %2 === 0)//if sideways, y is x...
						context.fillRect(0, 0, portionX, portionY);
					else
						context.fillRect(0, 0, portionY, portionX);
				context.strokeStyle = '#999';
				context.lineWidth = 3;
				
				context.beginPath();
					if(amDown %2 === 0){
						context.moveTo(portionX/5, portionY*(4/5));
						context.lineTo(portionX/2, portionY/5);
						context.lineTo(portionX*(4/5), portionY*(4/5));
					}
					else{
						context.moveTo(portionY/5, portionX*(4/5));
						context.lineTo(portionY/2, portionX/5);
						context.lineTo(portionY*(4/5), portionX*(4/5));					
					}
				context.stroke();
				context.restore();
			}
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			mouseIsDown = true;
			if(event.clientX < leftSide + portionX)
				return;
			else if(event.clientX < leftSide + portionX*2){
				if(event.clientY < portionY*3 && event.clientY > portionY*2){
					btnDown = 3;//left
					canvas.dispatchEvent(left);
				}
			}
			else if(event.clientX < leftSide + portionX*3){
				if(event.clientY > portionY && event.clientY < portionY*2){
					btnDown = 4;//up
					canvas.dispatchEvent(up);
				}
				else if(event.clientY > portionY*3 && event.clientY < portionY*4){
					btnDown = 2;//down
					canvas.dispatchEvent(down);
				}
			}
			else if(event.clientX < leftSide + portionX*4){
				if(event.clientY < portionY*3 && event.clientY > portionY*2){
					btnDown = 1;//right
					canvas.dispatchEvent(right);
				}
			}
		}
		function mouseUp(event){
			btnDown = 0;
			mouseIsDown = false;
		}
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}
	};
	
	function test(argObj, rightHalf){
		console.log('in test');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var next = new Event('next');
		var prev = new Event('prev');
		var message = 'thing';
		var clearMsg = false;
		
		if(rightHalf)
			leftSide = canvas.width/2;
			
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			
			context.fillStyle = (btnDown == 1)?'red':'green';
				context.fillRect(leftSide + portionX*2, portionY, portionX, portionY);//1
			context.fillStyle = (btnDown == 2)?'red':'green';
				context.fillRect(leftSide + portionX*2, portionY*3, portionX, portionY);//2
			
			context.font = '50px arial';
			context.fillStyle = 'black';
				context.fillText('<', leftSide + portionX*2.4, portionY*1.6);//1
				context.fillText('>', leftSide + portionX*2.4, portionY*3.6);//2
			if(message !== '')
				context.fillText(message, leftSide + portionX, portionY*2.6);
		};
		
		this.addMsg = function(msg){
			message = msg;
			clearTimeout(clearMsg);
			clearMsg = setTimeout(function(){
				message = '';
			}, 500);
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			mouseIsDown = true;
			if(event.clientX < leftSide + portionX*2 || event.clientX > leftSide + portionX*3)
				return;
			if(event.clientY > (portionY) && event.clientY < (portionY*2)){
				btnDown = 1;//prev
				canvas.dispatchEvent(prev);	
			}
			
			if(event.clientY > (portionY*3) && event.clientY < (portionY*4)){
				btnDown = 2;//prev
				canvas.dispatchEvent(next);	
			}
		}
		function mouseUp(event){
			btnDown = 0;
			mouseIsDown = false;
		}
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}		
		
	};
	
	function oneKey(argObj, rightHalf){
		console.log('in oneKey');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var button1Txt = argObj.button1Txt || 'A'
		var button1 = new CustomEvent('button', {'detail':{'button':button1Txt}});
		var buttonRadius = 200;
		if(rightHalf)
			leftSide = canvas.width/2;
		
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			context.fillStyle = (btnDown)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX*2.5, portionY*2.5, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button1Txt, leftSide+portionX*2.25, portionY*2.6);
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			mouseIsDown = true;
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX*2.5, y:portionY*2.5}) > buttonRadius)
				return;
			else{
				btnDown = 1;
				canvas.dispatchEvent(button1);			
			}
		}
		function mouseUp(event){
			btnDown = 0;
			mouseIsDown = false;
		}
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}		
	};
	function twoKey(argObj, rightHalf){
		console.log('in twoKey');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var button1Txt = argObj.button1Txt || 'A'
		var button2Txt = argObj.button2Txt || 'B'
		var button1 = new CustomEvent('button', {'detail':{'button':button1Txt}});
		var button2 = new CustomEvent('button', {'detail':{'button':button2Txt}});
		var buttonRadius = 150;
		if(rightHalf)
			leftSide = canvas.width/2;
		
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			context.fillStyle = (btnDown == 1)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX, portionY, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown == 1)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button1Txt, leftSide+portionX*1.2, portionY*1.2);
			
			context.fillStyle = (btnDown == 2)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX*3, portionY*3, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown == 2)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button2Txt, leftSide+portionX*3.2, portionY*3.2);
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			mouseIsDown = true;
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX, y:portionY}) < buttonRadius){
				btnDown = 1;
				canvas.dispatchEvent(button1);
			}
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX*3, y:portionY*3}) < buttonRadius){
				btnDown = 2;
				canvas.dispatchEvent(button2);			
			}
		}
		function mouseUp(event){
			btnDown = 0;
			mouseIsDown = false;
		}
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}		
	};
	function fourKey(argObj, rightHalf){
		console.log('in fourKey');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var button1Txt = argObj.button1Txt || 'A'
		var button2Txt = argObj.button2Txt || 'B'
		var button3Txt = argObj.button2Txt || 'X'
		var button4Txt = argObj.button2Txt || 'Y'
		var button1 = new CustomEvent('button', {'detail':{'button':button1Txt}});
		var button2 = new CustomEvent('button', {'detail':{'button':button2Txt}});
		var button3 = new CustomEvent('button', {'detail':{'button':button3Txt}});
		var button4 = new CustomEvent('button', {'detail':{'button':button4Txt}});
		var buttonRadius = 125;
		if(rightHalf)
			leftSide = canvas.width/2;
		
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			context.fillStyle = (btnDown == 1)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX, portionY, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown == 1)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button1Txt, leftSide+portionX*.9, portionY*1.2);
			
			context.fillStyle = (btnDown == 2)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX, portionY*3, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown == 2)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button2Txt, leftSide+portionX*.9, portionY*3.2);
			
			context.fillStyle = (btnDown == 3)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX*3, portionY, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown == 3)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button3Txt, leftSide+portionX*2.9, portionY*1.2);
			
			context.fillStyle = (btnDown == 4)?'green':'black';
			context.beginPath();
			context.arc(leftSide+portionX*3, portionY*3, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = (btnDown == 4)?'black':'green';
			context.font = buttonRadius/2 + 'px arial';
			context.fillText(button4Txt, leftSide+portionX*2.9, portionY*3.2);
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			mouseIsDown = true;
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX, y:portionY}) < buttonRadius){
				btnDown = 1;
				canvas.dispatchEvent(button1);
			}
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX, y:portionY*3}) < buttonRadius){
				btnDown = 2;
				canvas.dispatchEvent(button2);			
			}
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX*3, y:portionY}) < buttonRadius){
				btnDown = 3;
				canvas.dispatchEvent(button3);			
			}
			if(distance({x:event.clientX, y:event.clientY}, {x:leftSide+portionX*3, y:portionY*3}) < buttonRadius){
				btnDown = 4;
				canvas.dispatchEvent(button4);			
			}
		}
		function mouseUp(event){
			btnDown = 0;
			mouseIsDown = false;
		}
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}		
	};
	function touch(argObj, rightHalf){
		console.log('in touch');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var poke = new Event('poke');
		var evtTouchStart = new Event('touchStart');
		var evtTouchEnd = new Event('touchEnd');
		var evtTouchMove = new Event('touchMove');
		var swipe = new Event('swipe');
		
		var lastPoints = [];
		var dv = 0;
		var startTime;
		
		if(rightHalf)
			leftSide = canvas.width/2;
		
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			context.strokeStyle = (btnDown)?'green':'black';
			context.beginPath();
			context.moveTo(leftSide+portionX*2.5, portionY*.5);
			context.lineTo(leftSide+portionX*2.5, portionY*4.5);
			context.moveTo(leftSide+portionX*.5, portionY*2.5);
			context.lineTo(leftSide+portionX*4.5, portionY*2.5);
			context.stroke();
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			if(!mouseIsDown){
				canvas.dispatchEvent(evtTouchStart);
				startTime = new Date().getTime();
			}
			mouseIsDown = true;
			lastPoints.push({x:event.clientX, y:event.clientY, time:new Date().getTime()});
			if(lastPoints.length > 5)
				lastPoints.shift();
			
		}
		function mouseUp(event){
			btnDown = 0;
			mouseIsDown = false;
			startTime = new Date().getTime() - startTime;
			console.log(startTime);
			if(startTime < 80)
				canvas.dispatchEvent(poke);
			else if(getSwipe())
				canvas.dispatchEvent(swipe);
			else
				canvas.dispatchEvent(evtTouchEnd);
		}
		
		function getSwipe(){
			var totalTime = 0;
			var totalDist = 0;
			for(var i = 1; i < lastPoints.length; i++){
				totalTime += lastPoints[i].time - lastPoints[i-1].time;
				totalDist += distance(lastPoints[i], lastPoints[i-1]);
			}
			console.log(totalDist);
			console.log(totalTime);
			if(totalDist > totalTime)
				return true;
			return false;
		}
		
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
				canvas.dispatchEvent(evtTouchMove);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}		
	};
	function stick(argObj, rightHalf){
		console.log('in stick');
		var leftSide = 0;
		var btnDown = 0;
		var mouseIsDown = false;
		var angle = '';
		var buttonRadius = 200;
		var evtAngle;
		
		if(rightHalf)
			leftSide = canvas.width/2;
		
		this.resize = function(){
			if(rightHalf)
				leftSide = canvas.width/2;			
		};
		
		this.drawMe = function(context){
			context.fillStyle = 'black';
			context.beginPath();
			context.arc(leftSide + portionX*2.5, portionY*2.5, buttonRadius, 0, 2*Math.PI);
			context.fill();
			context.fillStyle = 'green';
			context.beginPath();
			if(angle !== ''){
				var xPart = Math.sin(angle*Math.PI/180)*buttonRadius/2;
				var yPart = Math.cos(angle*Math.PI/180)*buttonRadius/2;
				context.arc(leftSide + xPart + portionX*2.5, yPart+portionY*2.5, buttonRadius*2/3, 0, 2*Math.PI);
			}
			else{
				context.arc(leftSide + portionX*2.5, portionY*2.5, buttonRadius*2/3, 0, 2*Math.PI);
			}
			context.fill();
		};
		
		this.click = function(){};
		this.mouseDown = mouseDown;
		this.mouseMove = mouseMove;
		this.mouseUp = mouseUp;
		
		function mouseDown(event){
			mouseIsDown = true;
			btnDown = 1;
			angle = getAngle({x:event.clientX, y:event.clientY}, {x:leftSide+portionX*2.5, y:portionY*2.5});
			evtAngle = new CustomEvent('angle', {'detail': {'angle':angle}});
			canvas.dispatchEvent(evtAngle);
		}
		function mouseUp(event){
			btnDown = 0;
			angle = '';
			mouseIsDown = false;
		}
		function mouseMove(event){
			if(mouseIsDown){
				mouseDown(event);
			}	
		};
		
		this.touchStart = touchDown;
		this.touchMove = touchMoving;
		this.touchEnd = touchUp;
		
		function touchDown(event){
			mouseDown(event);
		}
		function touchUp(event){
			mouseUp(event);
		}
		function touchMoving(event){
			mouseMove(event);
		}		
	};
}

function distance(pt1, pt2){
	var dx = Math.abs(pt1.x-pt2.x);
	var dy = Math.abs(pt1.y-pt2.y);
	return Math.sqrt(dx*dx + dy*dy);
}
function getAngle(pt1, pt2){
	var dx = pt1.x - pt2.x;
	var dy = pt1.y - pt2.y;
	var rad = Math.atan2(dx,dy);
	console.log(rad + ': radian');
	rad = rad * 180/Math.PI;
	console.log(rad + ': degree');
	return Math.ceil(rad);
}