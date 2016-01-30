/** build.js
	build is the script that adjusts all the raw files and moves, compiles, minifies, and parses any scripts needed for deploying the client.
*/

/** paths
	paths are the relative paths to the individual deployments.
*/
var paths = {
		src : './client/source/',
		test : './client/test/',
		live : './client/live/'
	};
	
/** exec
	exec is a peice of the node child_process library. It is used for running CLI applications.
*/	
var exec = require('child_process').exec;
/** sass
	sass is a community module, it is used to create css from sass.

*/
var sass = require('node-sass');
/**
	fileSys
	fileSys is the node standard library for interacting with the file system
*/
var fileSys = require('fs');

/** minify
	minify is a compiler created by google that takes the clientside JS and minifies it to create smaller file transfers.
*/
var minify = require('closurecompiler');

/** buildVersion
	buildVersion is the current iteration since using the build script.
*/
var buildVersion;

/** work
	work is an array of functions created for each step the build script needs to do before exiting.
*/
var work = [];

/** commands
	commands are the arguments passed in from the command line
*/
var commands = '';

/** buildJS
	buildJS is a function map with different functions for starting build process to the different environments

*/
var buildJS = {
	'live' : getBuildVersion,
	'test' : testJS
	};

	commands += process.argv.slice(2).join('');
	
	if(commands.indexOf('test') >= 0)
		work.push('test');
	if(commands.indexOf('live') >= 0)
		work.push('live');

for(var i in work)
	build(work[i]);
	
/** build
	build takes the environment and the relative paths to create a function for further processing
*/	
function build(environment){
	console.log('beginning build: ' + environment);
	buildJS[environment](paths['src']+'javaScript/', paths[environment]+'javaScript/');
}
/** testJS
	testJS moves the files into the correct directory and assembles the index.html for the test environment.
*/
function testJS(fromPath, toPath){
	var jsFiles = [];
	console.log('building JS: ' + fromPath + ': ' + toPath);
	fileSys.readdir(fromPath, function(error, files){
		for(var i = 0; i < files.length; i++){//copy each JS file over one at a time
			jsFiles.push(files[i].match(/\d*-(\D*)/)[1]);
			copyFile(fromPath+files[i], toPath+files[i].match(/\d*-(\D*)/)[1]);
		}
		testCSS(fromPath.replace('javaScript/','styleSheets/'), toPath.replace('javaScript/','styleSheets/'), jsFiles);
	});
}

/** testCSS
	testCSS parses through the sass files and finishes assembling the index.html for the test environment.
*/
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

/** getBuildVersion
	getBuildVersion reads the current build version number from a file, increments it, and then puts that number back in the same file. The build version number will be used elsewhere in the program.
*/
function getBuildVersion(fromPath, toPath){
	fileSys.readFile('./buildVersion.txt', function(error, versionNum){
		buildVersion = parseInt(versionNum);
		buildVersion++;
		fileSys.writeFile('./buildVersion.txt', buildVersion, function(error, written){
			if(!error){
				console.log('build version: ' + buildVersion);
				liveJS(fromPath, toPath)
			}
			else{
				console.log('Error: ' + error);
				console.log('Build aborted');
			}
		});
	});
}

/** liveJS
	liveJS is a function that compiles the totality of the clientside JS. This minifies it, and the google closure compiler optimizes the code wherever it can. The new JS file is included into the index.html.
*/
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

/** liveCSS
	liveCSS reads and parses through all of the sass files and creates a single css document that is included in the index.html.
*/
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

/** rootDir
	rootDir finishes assembling the index.html from all of the different files being used by this version of the client.
*/
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

/** moveStuff
	moveStuff takes a file name and a destination and just copies the file over to the new destination.
*/
function moveStuff(fromPath, toPath){
	console.log('moving file: ' + fromPath + ': ' + toPath);
	var moveFiles = {};
	fileSys.readdir(toPath, function(error, files){
		if(!error) {
			fileSys.readdir(fromPath, function(error, files){
				for(var i = 0; i < files.length; i++)
				copyFile(fromPath + files[i], toPath + files[i]);
			});
		} else {
			fileSys.mkdir(toPath, function(error){
				if(error) {
					console.log('error creating directory: ' + toPath);
				} else {
					moveStuff(fromPath, toPath);
				}
			});
		}
	});


}

/** copyFile
	copyFile is a small helper function around the actual file copy process
*/
function copyFile(from, to){
	fileSys.readFile(from, function(error, data){
		if(!error){
			console.log('\tfile: ' + to);
			fileSys.writeFile(to, data);
		}
	});
}

/**	buildHTML
	buildHTML writes all of the included filenames into the index.html before capping it with the meta tags.
*/
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

/** parseSass 
	parseSass takes all of the sass files and runs them through a sass interpreter to generate the raw css.
*/
function parseSass(data, toPath, fileName){

	if(buildVersion)
		fileName= fileName.replace('.css', buildVersion + '.css');
	
	if(data['fileName']){
		sass.render({
			file: data['fileName'],
			outFile: toPath + fileName,
		}, function(error, result){
			if (error) {
				console.log('error creating css file: ' + fileName);
			} else {
				fileSys.writeFile(toPath + fileName, result.css, function(error){
					if (error) {
						console.log('error putting css file: ' + error);
					}
				});
			}
		});
	}
	else if(data['data']){
		sass.render({
			data: data['data'],
			outFile: toPath + fileName,
		}, function(error, result){
			if (error) {
				console.log('error creating css file: ' + fileName);
			} else {
				fileSys.writeFile(toPath + fileName, result.css, function(error){
					if (error) {
						console.log('error putting css file: ' + error);
					}
				});
			}
		});
	}
	return fileName;
};

/** compileJS
	compileJS runs the js files through the google closure js optimizer/minifier.
*/
function compileJS(files, toPath){
	minify.compile(files,{}, function(error, result){
		if(error){
			console.log('Error in compileJS:' + error);
			console.log('\tfile: ' + toPath + 'min' + buildVersion + '.js : NOT CREATED');
		}
		else{
			console.log('\tfile: ' + toPath + 'min' + buildVersion + '.js');
			fileSys.writeFile(toPath + 'min' + buildVersion + '.js', result);
		}
	});
	return 'min' + buildVersion + '.js';
}