/**
 *
 */
 
/** */
window.thillyAdmin = {};

/** */
(function(debug){

	/** */
	this.admin = true;

	/** */
	var uploadUs = {};
	
	/** */
	var oldPictures = [];
	
	/** */
	var thumb;
	
	/** */
	this.submit = function(oldPics, thumbNail){
		var picList = document.getElementsByClassName('controlBox');
		var pageID = document.getElementById('comboBox').value.split(' ')[0];
		var thumbSent = false;
		oldPictures = oldPics;
		thumb = thumbNail;
		uploadTotal = 0;		
		uploadUs = {};
		if(titleBox.value == ''){
			alert("You must enter title");
			return;
		}
		
		if(thumb.source == 'old'){
			thumb.url = document.getElementById('aBox1').style.backgroundImage;
			thumb.url = thumb.url.split('/')[5].replace(')','');
		}
		else if(thumb.source == 'new'){
			var file = URItoBlob(thumb.url);
			var fileName = pageID + 't.' + file.extension;
			thumb.url = fileName;
			mainSocket.sendCommand('picUpload', {name: fileName, file: file.data});	
			thumb.source = 'created';
			thumbSent = true;
		}
		else if(thumb.source == 'none'){
			alert('You must choose thumbnail');
			return;
		}
		
		for(var aPic in picList){
			if(picList[aPic].nodeName === 'DIV')
			{
				var temp = picList[aPic].children[0].src;
				uploadUs[temp] = temp;
			}
		}
		
		for(var picSource in uploadUs){
			var file = URItoBlob(uploadUs[picSource]);
			var fileName = pageID + (uploadTotal++ + oldPictures.length) + '.' + file.extension;
			uploadUs[picSource] = fileName;
			mainSocket.sendCommand('picUpload', {name: fileName, file: file.data});
		}
		
		if(uploadTotal == 0 && !thumbSent)
			pushSubmit();
	};
	
	/** */
	this.picUploaded = function(data, socket){
		console.log('pic upload successful: ' + data.path + ':' + data.name);
		var picList = document.getElementsByClassName('controlBox');
		for(var aPic in picList){
			if(picList[aPic].nodeName === 'DIV'){
				var temp = picList[aPic].children[0].src;
				if(uploadUs[temp] == data.name){
					picList[aPic].children[0].src = data.path;
					picList[aPic].parentNode.id = '';
					picList[aPic].parentNode.className = 'articlePicture';
					picList[aPic].parentNode.style.float = picList[aPic].style.float;
					picList[aPic].outerHTML = picList[aPic].innerHTML;
					uploadTotal--;
				}
			}
		}
		
		if(uploadTotal == 0)
			pushSubmit();
	};
	
	/** */
	function pushSubmit(){
		var pics = [];
		for(var aPic in uploadUs)
		{
			pics.push(uploadUs[aPic]);
		}
		oldPictures = pics.concat(oldPictures);
		var uploadObj = {
			pageID 		: 	document.getElementById('comboBox').value,
			title		: 	document.getElementById('titleBox').value,
			category	:	document.getElementById('categoryBox').value,
			content		: 	templateView.innerHTML,
			pictures	: 	oldPictures,
			points		:	0,
			thumb		: 	thumb.url
		};
		if(uploadObj.pageID.length == 8)
			uploadObj.pageID += uploadObj.category;
			
		mainSocket.sendCommand('pushNewArticle', uploadObj);
		document.getElementById('templateTextInput').value = uploadObj.content;
	}

	/** */
	function URItoBlob(dataURI){
		var byteString, mimestring, extension;

		if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
			byteString = atob(dataURI.split(',')[1]);
		} else {
			byteString = decodeURI(dataURI.split(',')[1]);
		}

		mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];
		extension = mimestring.split('/')[1];

		var content = new Array();
		for (var i = 0; i < byteString.length; i++) {
			content[i] = byteString.charCodeAt(i);
		}

		return {data:new Blob([new Uint8Array(content)], {type: mimestring}), extension: extension};
	}
	
}).apply(window.thillyAdmin, [thillyLogging])