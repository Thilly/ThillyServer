var paths = {
		src : './client/source/',
		test : './client/test/',
		live : './client/live/'
	}
	
var exec = require('child_process').exec;
var fileSys = require('fs');
var time = new Date().getTime();
var done = 0;
var work = ['test','live'];

if(process.argv[2] == 'test')
		build('test');
if(process.argv[2] == 'live')
		build('live');
	
	
function timeThis(){	
	if(done == work.length)
		console.log('Build completed in ' + ((new Date().getTime()) - time) + 'ms');
}

/** */
function build(buildType){
	var JSFiles = [];
	var CSSFiles = [];
	console.log('beggining build for: ' + buildType);
	//minify or move the JS
	fileSys.readdir(paths['src'] + 'javascript/', function(error, files){
		for(var i in files){
			JSFiles.push('javascript/'+files[i]);
			files[i] = paths['src'] + 'javascript/' + files[i];
		}
		if(buildType == 'live'){
			buildJS(paths[buildType]+'javascript/', files.join(' \ '));
			JSFiles = [];
			JSFiles.push('javascript/min.js');
		}
		if(buildType == 'test'){
			listFilesToCopy(paths['src']+'javascript/', paths[buildType]+'javascript/');
		}
		
		//build the css
		fileSys.readdir(paths['src'] + 'styleSheets/', function(error, files){
			for(var i in files){
				files[i] = paths['src'] + 'styleSheets/' + files[i];
			}
			CSSFiles.push(buildCSS(paths[buildType] + 'styleSheets/', files.join(' ')));
			
			//copy the few static HTML
			listFilesToCopy(paths['src'], paths[buildType], JSFiles, CSSFiles);
			//copy the pictures
			listFilesToCopy(paths['src']+'images/', paths[buildType]+'images/');
			listFilesToCopy(paths['src']+'images/resources/', paths[buildType]+'images/resources/');
		});		
	});
}

/** */
function listFilesToCopy(fromPath, toPath, JS, CSS){
	fileSys.readdir(fromPath, function(error, files){
		for(var i in files){
			if(files[i] == 'index.html')
				buildHTML(fromPath, toPath, JS, CSS);
			else
				copyFile(fromPath, toPath, files[i]);
		}
	});
}

/** */
function buildHTML(from, to, JS, CSS){
	console.log('building index.html for: ' + to);
	var writeMe = '<!doctype HTML><html><head>';
	for(var i in CSS){
		var aLink ='<link rel="stylesheet" href="' + CSS[i] + '">\n';
		console.log('adding: ' + CSS[i]);
		writeMe += aLink;
	}
	for(var j in JS){
		var someJS = '<script type="application/javascript" src="'+ JS[j] +'"></script>\n';
		console.log('adding: ' + JS[j]);
		writeMe += someJS;
	}
	
	fileSys.readFile(from + 'index.html', function(error, data){
		if(error){
			if(error != 'EISDIR');
			console.log('error reading index.html: ' + error);
		}
		else
			fileSys.writeFile(to + 'index.html', writeMe + data, function(error){
				if(error)
					console.log('error writing index.html: ' + error);
			});
	});
}

/** */
function copyFile(from, to, fileName){
	fileSys.readFile(from + fileName, function(error, data){
		if(error){
			if(error.code != 'EISDIR')
				console.log('error reading file: ' + error);
		}
		else
			fileSys.writeFile(to+fileName, data, function(error){
				console.log('copying file: ' + fileName);
				if(error){
					console.log('error copying file: ' + error);
				}
			});
	
	});
}

/** */
function buildJS(toPath, fileList, live){
	console.log('uglifying: ' + fileList.split(' \ ').length + ' files');
	var uglify = exec('uglifyjs ' + fileList + ' -o ' + toPath + 'min.js' + ((live)?' -c -m':''),
		function(error, stdout, stderr){
			if(error)
				console.log('error: ' + error);
		});
}

/** */
function buildCSS(toPath, fileList){
	console.log('building css for ' + toPath);
	var sass = require('node-sass');
		sass.renderFile({
			file: fileList,
			outputStyle: 'compressed',
			outFile: toPath + 'style.css',
			success: function(css){
				console.log('built: ' + css);
				done++;
				timeThis();
			}
		});
	return 'styleSheets/style.css';
}	