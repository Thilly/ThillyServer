

/** */
var logging, files, mongo;

/** */
var crypto;

/** */
module.exports = function(deps){

	logging = deps.logging;
	files = deps.files;
	mongo = deps.mongo;
	
	crypto = require('./../thillyCrypto.js')(logging);
	
	return {
		login		:	 login,
		register	:	 register
	};
};

/** */
function login(data, socket, exception){

	logging.log.trace('In login: ' + data.userName + ' : ' + data.password + ' : ' + data.userString);
	
	if(data.userString)
		mongo.select('user', {_id:mongo.parse(data.userString)}, {projection:{_id : 1, userID:1, password:1, type:1}}, callBack)
	else
		mongo.select('user', {userID:data.userName}, {projection:{_id : 1, userID:1, password:1, type:1}}, callBack)
		
	function callBack(error, result){
		if(error)
			logging.log.error('error in login: ' + error);
		else if(result.length == 0){
			logging.log.sockets('login failed: no such user');		
			socket.emit('login', {failed:'no such user'});
		}
		else if(data.userString == result[0]._id)
			loginUser(result[0], socket);
		else if(result[0].password == crypto.createHash(data.password)){
			loginUser(result[0], socket);
		}
		else{
			logging.log.sockets('login failed: wrong password');
			socket.emit('login', {failed:'wrong password'});
		}
	}
}

/** */
function loginUser(userData, socket){
	logging.log.trace('In loginUser');
	var userTypeFileName = (userData.type == 'admin')?'admin.js':'standard.js';
	files.readFile('./servedJS/' + userTypeFileName, function(error, data){
		logging.log.sockets('login successful, sending ' + userTypeFileName);
		socket.user = userData;
		socket.emit('login', {success: true, userScript: data.toString(), type:userData.type, name:userData.userID, userString:userData._id});
	});
}

/** */
function register(data, socket, exception){
	logging.log.trace('In register');
	
	var insertObj = {
		userID	:	data.userName,
		userName:	data.userName.toLowerCase(),
		password:	crypto.createHash(data.password),
		points	:	0,
		type	:	'standard'
	};
	
	mongo.select('user', {userName:data.userName.toLowerCase()}, {projection:{userID:1}}, function(error, result){
		if(error)
			logging.log.error('error in register select: ' + error);
		else if(result.length > 0){
			logging.log.sockets('user name: ' + data.userName + ' taken.');
			socket.emit('login', {failed:'user name taken'});
		}
		else{
			mongo.insert('user', insertObj, {w:1}, function(error, result){
				if(error)
					logging.log.error('error in register: ' + error);
				else{
					logging.log.sockets('register completed successfully');
					loginUser(insertObj, socket);
				}
			});
		}
	});
}
