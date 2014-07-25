var paths = {
		src : './client/source/',
		test : './client/test/',
		live : './client/live/'
	}
	
var exec = require('child_process').exec;
var fileSys = require('fs');

build('test');
build('live');

/** */
function build(buildType){
	var JSFiles = [];
	var CSSFiles = [];
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
				console.log(files[i]);
			}
			buildCSS(paths[buildType] + 'styleSheets/', files.join(' '));
			CSSFiles.push('styleSheets/style.css');
			
			//copy the few static HTML
			listFilesToCopy(paths['src'], paths[buildType], JSFiles, CSSFiles);
			//copy the pictures
			listFilesToCopy(paths['src']+'images/', paths[buildType]+'images/');
			listFilesToCopy(paths['src']+'images/resources', paths[buildType]+'images/resources');
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
		if(error)
			console.log('error reading index.html: ' + error);
		else
			fileSys.writeFile(to + 'index.html', writeMe + data, function(error){
				if(error)
					console.log('error writing index.html: ' + error);
			});
	});
}

/** */
function copyFile(from, to, fileName){
	console.log('copying file: ' + from + fileName);
	fileSys.readFile(from + fileName, function(error, data){
		if(error)
			console.log('error reading file: ' + error);
		else
			fileSys.writeFile(to+fileName, data, function(error){
				if(error)
					console.log('error copying file: ' + error);
			});
	
	});
}

/** */
function buildJS(toPath, fileList, live){
	console.log('uglifying: ' + fileList.split(' \ ').length + ' files');
	var uglify = exec('uglifyjs ' + fileList + ' -o ' + toPath + 'min.js' + ((live)?'':''),
		function(error, stdout, stderr){
			console.log('out: ' + stdout);
			console.log('err: ' + stderr);
			if(error)
				console.log('error: ' + error);
		});
}

/** */
function buildCSS(toPath, fileList){

	var sass = require('node-sass');
		sass.renderFile({
			file: fileList,
			outputStyle: 'compressed',
			outFile: toPath + 'style.css',
			success: function(css){
				console.log(css);
			}
		});
}