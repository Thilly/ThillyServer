
var canvas;
var context;
var liveUpdate = false;
var solving = false;

var drawUs = [];
var nodes = [];
var edges = [];

var currentLine;

var currentOption = 'none';
var mouse = {x: 0, y: 0};

window.onload = function(){	

	canvas = document.getElementById('drawing');
	context = canvas.getContext('2d');

	reinit();
	canvas.onclick = function(event){
		aClick(event)
	};
		
	canvas.onmousemove = function(event){
		mouse.x = event.clientX - canvas.getBoundingClientRect().left;
		mouse.y = event.clientY - canvas.getBoundingClientRect().top;
	};
	
	canvas.oncontextmenu = function(){
		if(liveUpdate)
			currentLine.direct();
		return false;
	};
};

window.onresize = function(){
	reinit();
};
	
function reinit(){

	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth*.8;
	update();
}

function option(selected){
	currentOption = selected;
	if(!solving)
	{
		clearBordersOnOptions();
		if(currentOption == 'clear')
		{
			nodes = [];
			drawUs = [];
			edges = [];
			document.getElementById('results').innerHTML = '';
			update();
		}
		else
		{
			var div = document.getElementById(currentOption);
			div.style.border = '1px solid white';
			
		}
		
		if(liveUpdate)
		{
			liveUpdate = false;
			currentLine = '';//clear current line
			drawUs.pop();//remove the last line from the drawUs pile
		}
		
		if(currentOption == 'solve')
			solve();
	}
}

function clearBordersOnOptions(){
	var box = document.getElementById('leftBar');
	for(var child in box.childNodes)
		if(box.childNodes[child].style)		
				box.childNodes[child].style.border = 'none';
}

function solve(){

	var solvedPaths = [];
	var possiblePaths = [];
	
	for(var i in nodes)
		possiblePaths.push([].concat(nodes[i]));//make a single index for each node since can possibly start at each one
	
	while(possiblePaths.length > 0)
	{
		var currentPath = possiblePaths.pop();//get next path
		var workingNodes = [].concat(nodes);
		var nextNode = true;
		while(nextNode)
		{
			nextNode = formAPath(currentPath[currentPath.length-1], workingNodes, edges, currentPath);
			if(nextNode)
			{
				if(currentPath.length == nodes.length-1)
				{
					console.log('solved a path: ')
					currentPath = currentPath.concat(nextNode);
					var str = '';
					for(var j in currentPath)
						str += currentPath[j].getIdx();
					console.log(str);
					solvedPaths.push(currentPath);
					nextNode = false;
				}
				else
					possiblePaths.push([].concat(currentPath).concat(nextNode));
			}
		}	
	}	
	solving = false;
	if(solvedPaths.length > 0)
		displayResults(solvedPaths);
	else
		document.getElementById('results').innerHTML = 'No paths\navailable';
}

function formAPath(startingNode, listOfNodes, listOfEdges, currentPath){

	var currentPos = startingNode.getIdx();
	for(var i in listOfNodes)//for each edge, make sure the edge is leaving this node
	{						//and make sure I haven't visited the next node
		if(currentPath.indexOf(listOfNodes[i]) == -1)
			if(pathExists(currentPos, listOfNodes[i].getIdx()))
				return listOfNodes.splice(i, 1);
	}
	return false;		
}

function pathExists(from, to){
	for(var i in edges)
	{
		if(edges[i].getNodes().from == from && edges[i].getNodes().to == to)
			return true;
	}
	return false;

}

function formACircuit(first, last){
	for(var i in edges)
	{
		if(edges[i].getNodes().from == last.getIdx() 
			&& edges[i].getNodes().to == first.getIdx())
		return true;
	}
	return false;
}

function displayResults(solved){
	var results = document.getElementById('results');
	results.innerHTML = '';
	for(var i in solved)
	{
		var aPath = '';
		for(var j in solved[i])
			aPath += ' ' + solved[i][j].getIdx();
		
		results.innerHTML += aPath + '\n';
		if(formACircuit(solved[i][0], solved[i][solved[i].length-1]))
			results.innerHTML += 'Circuit\n';
		results.innerHTML += '\n';
	}
}

function aClick(event){

	var drawX = event.offsetX;
	var drawY = event.offsetY;
	
	if(currentOption == 'node')
		if(!overLapping(drawX, drawY))	
			drawUs.push(new circle(drawX,drawY));
	if(currentOption == 'edge')
	{
		if(overLapping(drawX, drawY) && !liveUpdate)
			drawUs.push(new line(drawX, drawY));
		else if(overLapping(drawX, drawY) && liveUpdate)
			currentLine.finalize(drawX, drawY);
	}
	update();
	
}

function line(xPos, yPos){
	
	var from = {
		x: xPos,
		y: yPos
	};
	
	var finalized = false;
	var directed = 0;//0, undirected, 1 'from' directed, 2 'to' directed
	
	var to = {
		x: 0,
		y: 0
	};
	
	this.drawMe = function(context){
		
		context.beginPath();
		context.moveTo(from.x, from.y);
		if(!finalized)
		{
			to.x = mouse.x;
			to.y = mouse.y;
		}
		context.lineTo(to.x, to.y);
		context.stroke();
		
		
		if(directed)
		{
			var theta = -Math.atan2(from.x-to.x, from.y-to.y);
			theta += 90 /180*Math.PI;
			var tempAdj = 25 / 180*Math.PI;
			var length = 40;
			
			if(directed == 1)
			{	//draw arrow FROM
				context.beginPath();
				context.moveTo(from.x, from.y);
				context.lineTo(from.x-(length*Math.cos(theta-tempAdj)), from.y -(length*Math.sin(theta-tempAdj)));
				context.moveTo(from.x, from.y);
				context.lineTo(from.x-(length*Math.cos(theta+tempAdj)), from.y -(length*Math.sin(theta+tempAdj)));
				context.stroke();
			}
			if(directed == 2)
			{	//draw arrow TO
				context.beginPath();
				context.moveTo(to.x, to.y);
				context.lineTo(to.x+(length*Math.cos(theta-tempAdj)), to.y + (length*Math.sin(theta-tempAdj)));
				context.moveTo(to.x, to.y);
				context.lineTo(to.x+(length*Math.cos(theta+tempAdj)), to.y + (length*Math.sin(theta+tempAdj)));
				context.stroke();
			}
		}
	};
	
	this.isFinalized = function(){
		return finalized;
	};
	
	this.getNodes = function(){
		return {from: overLapping(from.x, from.y), to: overLapping(to.x, to.y)};
	};
	
	this.finalize = function(x, y){
		to.x = x;
		to.y = y;
		liveUpdate = false;
		var tempEdges = getEdges(from, to, directed);
			for(var i in tempEdges)
			{
				var add = true;
				for(var j in edges)
					if((tempEdges[i].getNodes().from == edges[j].getNodes().from) 
						&& (tempEdges[i].getNodes().to == edges[j].getNodes().to))
						{
							add = false;
							removeEdgeFromDrawing(tempEdges[i].getNodes().from, tempEdges[i].getNodes().to);
						}
				if(add)
					edges.push(tempEdges[i]);
			}
		finalized = true;
	};
	
	this.direct = function(){
		directed = ++directed%3;
	}
	
	currentLine = this;
	liveUpdate = true;
}

function removeEdgeFromDrawing(from, to){
	for(var i in drawUs)
		if(drawUs[i] instanceof line)
			if(!drawUs[i].isFinalized())
				if((drawUs[i].getNodes().from == from) && (drawUs[i].getNodes().to == to))
				{
					drawUs.splice(i,1);
					break;
				}
}

function getEdges(from, to, directed){
	var tempEdges = [];
	if(directed == 1)
		tempEdges.push(new edge(to, from));
	if(directed == 2)
		tempEdges.push(new edge(from, to));
	if(directed == 0)
	{
		tempEdges.push(new edge(to, from));
		tempEdges.push(new edge(from, to));
	}
	return tempEdges;

};

function edge(from, to){
	
	var fromNode = overLapping(from.x, from.y);
	var toNode = overLapping(to.x, to.y);

	this.getNodes = function()
	{
		return {from: fromNode, to: toNode};
	};

}

function update(){

	context.clearRect(0,0,canvas.width, canvas.height);

	for(var i in drawUs)
		drawUs[i].drawMe(context);
	
	if(liveUpdate)
		setTimeout(update, 100);
}

function node(xPos, yPos, idx){
	var x = xPos;
	var y = yPos;
	var id = idx;
	var visited = false;
	
	var edges = [];
	
	this.getLoc = function(){
		return {x: x, y: y};
	};
	
	this.overLap = function(xQ, yQ){
		var tempX = Math.abs(xQ - x); 
		var tempY = Math.abs(yQ - y);
		if( (tempX*tempX)+(tempY*tempY) <= 2000)
			return parseInt(id);
	};
	
	this.getVisited = function(){
		return visited;
	};
	
	this.getIdx = function(){
		return id;
	};
	
	this.addEdge = function(edge){
		edges.push(edge);
	};
}

function overLapping(xQ, yQ){
	for(var i in nodes)
		if(nodes[i].overLap(xQ, yQ))
			return parseInt(i)+1;
	
	return false;
}

function circle(xPos, yPos){

	var x = xPos, y = yPos, radius = 15;
	var idx = nodes.length+1;
	nodes.push(new node(x, y, nodes.length+1));//one based idx
	document.getElementById('node').innerHTML = 'Node ' + nodes.length;
	
	
	this.drawMe = function(context){
	
		context.beginPath();
		context.arc(x, y, radius, 0, 2*Math.PI);
		context.fill();	
		context.font = '16px Arial';
		context.fillText(idx, x, y-20);
	}
	update();

}