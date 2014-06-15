/** thillyFiles.js
 * @module thillyFiles
 * @author Thilly
 * @description My personal library for managing everything to do with files
 */
 
var files = require('fs');
var logging;
 
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

/** errorHandle
 *	takes care of error logging, displaying and general error stuff quickly
 *	@private 
 */
function errorHandle(error, callback)
{
	if(logging.trace)
		logging.log('In errorHandle');
	logging.log(JSON.stringify(error));
	if(typeof(callback) == 'function')
		callback(error, "");
} 

/** fileHandler
 *	enables a server to act as a fileserver
 *
 *	@param {string} req The request from a connection
 *	@param {string} res The response to be written
 */	
function fileHandler(req, res)
{
	if(logging.trace)
		logging.log('In fileHandler');
	var filePath = req.url;
	if(filePath == '/')//if first request
		filePath = './client/index.html';
		//give main page
	else	//otherwise
		filePath = './client' + req.url;	
			//go into shared directory and get the thing requested
	if(logging.files)	
		logging.log('Retrieving: ' + filePath);//log thing gotten
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
					logging.log('Error loading' + filePath); //loggit
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
			res.writeHead(404);//cant find it? 404 it
			res.end;
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
function readFile(fileName, callback)
{	
	if(logging.trace)
		logging.log('In readFile');
	try
	{
		files.open(fileName, 'r', function(error, fd){//open the file
			if(logging.files)//log them if need be
					logging.log('fileName: ' + fileName + ' opened for reading');
			if(error)//log any error
				errorHandle({errno:1, errmsg:'File ' + fileName + ' not found.'}, callback);	
			else
				files.fstat(fd, function(error, stats){//get the stats
					if(logging.files)//log them if need be
						logging.log('fd: ' + fd + ' size: ' + stats.size);
					if(stats.size == 0)
						errorHandle({errno:2, errmsg:'File ' + fileName + ' is empty.'}, callback);
					else
					files.read(fd, new Buffer(stats.size), 0, stats.size, 0, function(error, bytesRead, bufferRead){//read the file
						if(error)//log any error
							errorHandle({errno:3, errmsg:'File ' + fileName + ' error during read.'}, callback);
						else//no error
							files.close(fd, function(){//close the file
								if(logging.files)
								{
									logging.log('fileName: ' + fileName + ' closed');
									logging.log('read: ' + bytesRead + ' bytes');
								}
							});
							if(typeof(callback) == 'function')
								callback(error, bufferRead);
							else
								return(error)?error:bufferRead.toString();
					});
				});	
		});
	}
	catch(error)
	{
		errorHandle({errno:0, errmsg:'Unexpected Error in readFile: ' + error}, callback);	
	}
}//end of readFile

/** writeFile
 *	creates or clears a file for writing
 *
 *	@param {string} fileName The name of the file to be written 
 *	@param {string} dataToWrite The information to be written to the file
 *	@param {function} callback (Optional)The action to take after the write is finished
 */	
function writeFile(fileName, dataToWrite, callback)
{
	if(logging.trace)
		logging.log('In writeFile');
	try
	{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'w', function(error, fd){//open the file or create if not there yet
			if(logging.files)//log them if need be
				logging.log('fileName: ' + fileName + ' opened for writing');
			if(error)
				errorHandle({errno:1, errmsg:'File ' + fileName + ' not be opened/created for writing.'}, callback);
			//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//after writing to the file
				if(error)//log any error
					errorHandle({errno:2, errmsg:'File ' + fileName + ' not be written to.'}, callback);
				else//no error
				{
					files.close(fd, function(){//close the file
						if(logging.files)
						{
							logging.log('fileName: ' + fileName + ' closed');
							logging.log('wrote: ' + written + ' bytes');
						}
					});
					if(typeof(callback) == 'function')
						callback(error, fileName);
				}
			});
		});	
	}
	catch(error)
	{
		errorHandle({errno:0, errmsg:'Unexpected Error in writeFile: ' + error}, callback);	
	}
}//end of writeFile

/** appendFile
 *	Appends information to the end of a file
 *
 *	@param {string} fileName The name of the file to be appended 
 *	@param {string} dataToWrite The information to be written to the file
 *	@param {function} callback (Optional)The action to take after the append is finished
 */	
function appendFile(fileName, dataToWrite, callback)
{
	if(logging.trace)
		logging.log('In appendFile');
	try
	{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'a', function(error, fd){//open the file or create if not there yet
			if(logging.files)//log them if need be
				logging.log('fileName: ' + fileName + ' opened for appending');
			if(error)
				errorHandle({errno:1, errmsg:'File ' + fileName + ' not found.'}, callback);	
			//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//write to the file
				if(error)//log any error
					errorHandle({errno:1, errmsg:'File ' + fileName + ' could not be appended.'}, callback);	
				else//no error
				{
					files.close(fd, function(){//close the file
						if(logging.files)
						{
							logging.log('fileName: ' + fileName + ' closed');
							logging.log('appended: ' + written + ' bytes');
						}
					});
					if(typeof(callback) == 'function')
						callback(error, fileName);
				}
			});
		});	
	}
	catch(error)
	{
		errorHandle({errno:0, errmsg:'Unexpected Error in appendFile: ' + error}, callback);	
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
function appendLog(fileName, dataToWrite, callback)
{
	try
	{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'a', function(error, fd){//open the file or create if not there yet
			if(logging.files)//log them if need be
				console.log('fileName: ' + fileName + ' opened for appending log');
			if(error)
				errorHandle({errno:1, errmsg:'File ' + fileName + ' not found.'}, callback);	
			//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//write to the file
				if(error)//log any error
					errorHandle({errno:2, errmsg:'File ' + fileName + ' could not be appended.'}, callback);	
				else//no error
				{
					files.close(fd);
					if(typeof(callback) == 'function')
						callback(error, fileName);
				}
			});
		});	
	}
	catch(error)
	{
		errorHandle({errno:0, errmsg:'Unexpected Error in appendFile: ' + error}, callback);	
	}
}//end of appendFile



