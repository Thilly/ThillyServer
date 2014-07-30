/** thillyFiles.js
 * @module thillyFiles
 * @author Thilly
 * @description My personal library for managing everything to do with files
 */
 
var files = require('fs');
var logging = {};
 
/** @public */
module.exports = function(logObject)
{//dependency injected from thillyLogging to prevent circular dependency

	logging = logObject;

	return{
		'fileHandler'	:	fileHandler,
		'readFile'		:	readFile,
		'writeFile'		:	writeFile,
		'appendFile'	:	appendFile,
		'appendLog'		:	appendLog
	};
};//end of module.export

/** fileErrorHandle
 *	takes care of error logging, displaying and general error stuff quickly
 *	@private 
 */
function fileErrorHandle(error, callback){
	logging.log.trace('In fileErrorHandle');
	logging.log.files(JSON.stringify(error));
	if(typeof(callback) == 'function')
		callback(error, "");
} 

/** fileHandler
 *	enables a server to act as a fileserver
 *
 *	@param {string} req The request from a connection
 *	@param {string} res The response to be written
 */	
function fileHandler(req, res){
	logging.log.trace('In fileHandler');
	
	var filePath = req.url;
	if(filePath == '/')//if first request
		filePath = './client/' + logging.environment + '/index.html';
		//give main page
	else
		filePath = './client/' + logging.environment + filePath;
			//go into shared directory and get the thing requested
	logging.log.files('Retrieving: ' + filePath);//log thing gotten
	/*
	favicon.ico is a continued request.
	Apparently some type of google thing, possibly a heartbeat, 
	It is irritating but its part of chrome from what I can tell
	*/
	var contentType = 'text/html';//default content type	
	var path = require('path');
	switch(path.extname(filePath))//what is extension of file?
	{
		case '.js':
		{
			contentType = 'application/javascript';
			break
		}
		case '.css':
		{
			contentType = 'text/css';
			break;
		}
		case '.png':
		{
			contentType = 'image/png';
			break;		
		}
		case '.mp3':
		{
			contentType = 'audio/mpeg';
			break;		
		}
		case '.ogg':
		{
			contentTyoe = 'application/ogg';
			break;
		}
		//default already taken care of above
	};
		
	files.exists(filePath, function(exists) {	//read file in and tell browser what it is
		if(exists)
			readFile(filePath,  function (error, data) {
				if (error) {
					res.writeHead(500);
					res.end();//cant read it, bail and go elsewhere
					logging.log.files('Error loading' + filePath + ': ' + error);
				}
				
				res.writeHead(200, {'Content-Type': contentType,
									'Content-length': data.length,
									'Accept-Randges': 'bytes',
									'Cache-Control': 'max-age=1800'
				});//serve file based on type
				if(contentType.indexOf('image') >= 0 || 
					contentType.indexOf('audio') >= 0 ||
					contentType.indexOf('ogg'))
					res.end(data, 'binary');//send it
				else
					res.end(data.toString());
			});
		else
		{
			logging.log.files(filePath + ' not found, 404ing');
			
			res.writeHead(302,{//cant find it? 404 it
				Location: (logging.homeDomain + '404.html')
			});
			res.end();
		}
	});//end of file exist callback
}//end of fileHandle object

/** readFile
 *	reads a file
 * @param {String} fileName The name of the file to be read
 * @param {Function} callback (Optional)The action to take after the read is finished
 * @returns {Buffer} bufferRead A buffer of the data in the file
 * @returns {error} error If an error was thrown, it is returned instead of read data
 */	
function readFile(fileName, callback){	
	logging.log.trace('In readFile');
	try{
		files.open(fileName, 'r', function(error, fd){//open the file
			logging.log.files('fileName: ' + fileName + ' opened for reading');
			if(error)//log any error
				fileErrorHandle({errno:1, errmsg:'File ' + fileName + ' not found.'}, callback);	
			else
				files.fstat(fd, function(error, stats){//get the stats
					logging.log.files('fd: ' + fd + ' size: ' + stats.size);
					if(stats.size == 0)
						fileErrorHandle({errno:2, errmsg:'File ' + fileName + ' is empty.'}, callback);
					else
					files.read(fd, new Buffer(stats.size), 0, stats.size, 0, function(error, bytesRead, bufferRead){//read the file
						if(error)//log any error
							fileErrorHandle({errno:3, errmsg:'File ' + fileName + ' error during read.'}, callback);
						else//no error
							files.close(fd, function(){//close the file
								logging.log.files('fileName: ' + fileName + ' closed, read: ' + bytesRead + ' bytes');
							});
							if(typeof(callback) == 'function')
								callback(error, bufferRead);
							else
								return(error)?error:bufferRead.toString();
					});
				});	
		});
	}
	catch(error){
		fileErrorHandle({errno:0, errmsg:'Unexpected Error in readFile: ' + error}, callback);	
	}
}//end of readFile

/** writeFile
 *	creates or clears a file for writing
 *
 *	@param {string} fileName The name of the file to be written 
 *	@param {string} dataToWrite The information to be written to the file
 *	@param {function} callback (Optional)The action to take after the write is finished
 */	
function writeFile(fileName, dataToWrite, callback){
	logging.log.trace('In writeFile');
	try{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'w', function(error, fd){//open the file or create if not there yet
			logging.log.files('fileName: ' + fileName + ' opened for writing');
			if(error)
				fileErrorHandle({errno:1, errmsg:'File ' + fileName + ' not be opened/created for writing.'}, callback);
			//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//after writing to the file
				if(error)//log any error
					fileErrorHandle({errno:2, errmsg:'File ' + fileName + ' not be written to.'}, callback);
				else//no error
				{
					files.close(fd, function(){//close the file
						logging.log.files('fileName: ' + fileName + ' closed\nwrote: ' + written + ' bytes');
					});
					if(typeof(callback) == 'function')
						callback(error, fileName);
				}
			});
		});	
	}
	catch(error){
		fileErrorHandle({errno:0, errmsg:'Unexpected Error in writeFile: ' + error}, callback);	
	}
}//end of writeFile

/** appendFile
 *	Appends information to the end of a file
 *
 *	@param {string} fileName The name of the file to be appended 
 *	@param {string} dataToWrite The information to be written to the file
 *	@param {function} callback (Optional)The action to take after the append is finished
 */	
function appendFile(fileName, dataToWrite, callback){
	logging.log.trace('In appendFile');
	try{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'a', function(error, fd){//open the file or create if not there yet
			logging.log.files('fileName: ' + fileName + ' opened for appending');
			if(error)
				fileErrorHandle({errno:1, errmsg:'File ' + fileName + ' not found.'}, callback);	
			//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//write to the file
				if(error)//log any error
					fileErrorHandle({errno:1, errmsg:'File ' + fileName + ' could not be appended.'}, callback);	
				else//no error
				{
					files.close(fd, function(){//close the file
						logging.log.files('fileName: ' + fileName + ' closed\nappended: ' + written + ' bytes');
					});
					if(typeof(callback) == 'function')
						callback(error, fileName);
				}
			});
		});	
	}
	catch(error){
		fileErrorHandle({errno:0, errmsg:'Unexpected Error in appendFile: ' + error}, callback);	
	}
}//end of appendFile

/** appendLog
 *	Appends information to the end of the log without logging the information appended
 * 	redundant function to prevent redundancy :D
 *
 *	@param {string} fileName The name of the file to be appended 
 *	@param {string} dataToWrite The information to be written to the file
 *	@param {function} callback (Optional)The action to take after the append is finished
 */	
function appendLog(fileName, dataToWrite, callback){
	try{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'a', function(error, fd){//open the file or create if not there yet
			if(!error)
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//write to the file
				if(!error){
					files.close(fd);
					if(typeof(callback) == 'function')
						callback(error, fileName);
				}
			});
		});	
	}
	catch(error){
		fileErrorHandle({errno:0, errmsg:'Unexpected Error in appendFile: ' + error}, callback);	
	}
}//end of appendLog



