var paths = {
		src : './client/source/',
		test : './client/test/',
		live : './client/live/'
	};
	
var exec = require('child_process').exec;
var sass = require('node-sass');
var fileSys = require('fs');
var minify = require('closurecompiler');

var work = [];
var commands = '';

var buildJS = {
	'live' : liveJS,
	'test' : testJS
	};

	commands += process.argv.slice(2).join('');
	
	if(commands.indexOf('test') >= 0)
		work.push('test');
	if(commands.indexOf('live') >= 0)
		work.push('live');

for(var i in work)
	build(work[i]);
	
function build(environment){
	console.log('beginning build: ' + environment);
	buildJS[environment](paths['src']+'javaScript/', paths[environment]+'javaScript/');
}

function testJS(fromPath, toPath){
	var jsFiles = [];
	console.log('building JS: ' + fromPath + ': ' + toPath);
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++){//copy each JS file over one at a time
			jsFiles.push(files[i]);
			copyFile(fromPath+files[i], toPath+files[i]);
		}
		testCSS(fromPath.replace('javaScript/','styleSheets/'), toPath.replace('javaScript/','styleSheets/'), jsFiles);
	});
}

function testCSS(fromPath, toPath, jsFiles){
	var cssFiles = [];
	var totalSCSS = '';
	console.log('building CSS: ' + fromPath + ': ' + toPath);
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++){//parse each SCSS file over one at a time
			if(files[i] == 'mobileStyle.scss')//don't add to list to insert into index.html
				parseSass({'fileName':fromPath + files[i]}, toPath, 'mobile.css');
			else{
				cssFiles.push(parseSass({'fileName':fromPath + files[i]}, toPath, files[i].replace('.scss', '.css')));
			}
		}
		rootDir(fromPath.replace('styleSheets/',''), toPath.replace('styleSheets/',''), jsFiles, cssFiles);
	});
}

function liveJS(fromPath, toPath){
	var jsFiles = [];
	var append = [];
	console.log('building JS: ' + fromPath + ': ' + toPath);
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++){
			jsFiles.push(fromPath + files[i]);
		}
		append.push(compileJS(jsFiles, toPath));
	});
	liveCSS(fromPath.replace('javaScript/','styleSheets/'), toPath.replace('javaScript/','styleSheets/'), append);
}

function liveCSS(fromPath, toPath, jsFiles){
	var cssFiles = [];
	var totalSCSS = '';
	console.log('building CSS: ' + fromPath + ': ' + toPath);
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++){//copy each JS file over one at a time
			if(files[i] == 'mobileStyle.scss')
				parseSass({'fileName':fromPath + files[i]}, toPath, 'mobile.css');
			else{
				totalSCSS += fileSys.readFileSync(fromPath+files[i]).toString();
			}
		}
		cssFiles.push(parseSass({'data':totalSCSS}, toPath, 'style.css'));
		rootDir(fromPath.replace('styleSheets/',''), toPath.replace('styleSheets/',''), jsFiles, cssFiles);
	});
}	

function rootDir(fromPath, toPath, jsFiles, cssFiles){
	console.log('building HTML: ' + fromPath + ': ' + toPath);
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++){
			if(files[i] == 'index.html')
				buildHTML(fromPath, toPath, jsFiles, cssFiles);
			else
				copyFile(fromPath+files[i], toPath+files[i]);
		}
	});
	moveStuff(fromPath+'images/', toPath+'images/');
	moveStuff(fromPath+'images/resources/', toPath+'images/resources/');
	moveStuff(fromPath+'challenge/', toPath+'challenge/');
}

function moveStuff(fromPath, toPath){
	console.log('moving file: ' + fromPath + ': ' + toPath);
	var moveFiles = {};
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++)
			copyFile(fromPath + files[i], toPath + files[i]); 
	});
}

function copyFile(from, to){
	fileSys.readFile(from, function(error, data){
		if(!error){
			console.log('\tfile: ' + to);
			fileSys.writeFile(to, data);
		}
	});
}

function buildHTML(fromPath, toPath, jsFiles, cssFiles){
	var top = '<!doctype HTML>\n<html>\n\t<head>';
	for(var i = 0; i < jsFiles.length; i++)
		top += '\n\t\t<script type="application/javascript" src="javascript/'+jsFiles[i]+'"></script>';
	for(var j = 0; j < cssFiles.length; j++)
		top += '\n\t\t<link rel="stylesheet" href="styleSheets/'+cssFiles[j]+'">';
	fileSys.readFile(fromPath+'index.html', function(error, data){
		fileSys.writeFile(toPath+'index.html', top + data);
	});
}

function parseSass(data, toPath, fileName){

	if(data['fileName']){
		sass.renderFile({
			file: data['fileName'],
			outFile: toPath + fileName,
			success: function(css){
				console.log('\tfile: ' + css);
			},
			error: function(error){
				console.log('\tERROR: ' + error);
			},
		});
	}
	else if(data['data']){
		sass.renderFile({
			data: data['data'],
			outFile: toPath + fileName,
			success: function(css){
				console.log('\tfile: ' + css);
			},
			error: function(error){
				console.log('\tERROR: ' + error);
			},
		});
	}
	return fileName;
};

function compileJS(files, toPath){
	minify.compile(files,{}, function(error, result){
		if(error){
			console.log('Error in compileJS:' + error);
			console.log('\tfile: ' + toPath + 'min.js: NOT CREATED');
		}
		else{
			console.log('\tfile: ' + toPath + 'min.js');
			fileSys.writeFile(toPath + 'min.js', result);
		}
	});
	return 'min.js';
}