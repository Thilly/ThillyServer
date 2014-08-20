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
	var thisThumb;
	
	/** */
	var updateTabs;
	
	/** */
	this.submit = function(oldPics, thumb, tabs){
		if(debug.trace)
			debug.log('in submit: ' + tabs.length);
		updateTabs = tabs;
		var picList = document.getElementsByClassName('controlBox');
		var pageID = document.getElementById('comboBox').value;
		if(pageID.length == 8) 
			pageID += document.getElementById('categoryBox').value;
		var thumbSent = false;
		oldPictures = oldPics;
		uploadTotal = 0;
		thisThumb = thumb;
		uploadUs = {};
		if(titleBox.value == ''){
			alert("You must enter title");
			return;
		}
		
		if(thisThumb.source == 'new'){
			var file = URItoBlob(thisThumb.url);
			var fileName = pageID + 't.' + file.extension;
			thisThumb.url = fileName;
			thillyIndex.mainSocket.sendCommand('picUpload', {name: fileName, file: file.data});	
			thisThumb.source = 'created';
			thumbSent = true;
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
			thillyUtil.sendReceive(thillyIndex.mainSocket, 'picUpload', {name: fileName, file: file.data}, picUploaded);
		}
	
		if(uploadTotal == 0 && !thumbSent)
			pushArticle();
	};
	
	/** */
	function picUploaded(data, socket){
		if(debug.trace)
			debug.log('in picUploaded: ' + data.path);
		var picList = document.getElementsByClassName('controlBox');
		for(var aPic in picList){
			if(picList[aPic].nodeName === 'DIV'){
				var temp = picList[aPic].children[0].src;
				var tempPicBox = picList[aPic];
				if(uploadUs[temp] == data.name){
					
					picList[aPic].children[0].src = 'images/' + data.path;
					picList[aPic].parentNode.id = '';
					picList[aPic].parentNode.className = 'articlePicture';
					picList[aPic].parentNode.style.float = picList[aPic].style.float;
					replaceContentInTabs(picList[aPic].id, picList[aPic].innerHTML);
					picList[aPic].outerHTML = picList[aPic].innerHTML;
					
					uploadTotal -= 1;
				}
			}
		}
		
		if(uploadTotal == 0)
			pushArticle();
	};
	
	function replaceContentInTabs(id, newPic){
		for(var i = 0; i < updateTabs.length; i++){
			var lookForMe = '<div id="tempPic'+ id + '"></div>';
			updateTabs[i].content = updateTabs[i].content.replace(lookForMe, newPic);
		}	
	}
	
	/** */
	this.submitChallenge = function(contestName, live, data){
		var pushData = {
			contestName: contestName,
			live: live,
			data: data
		};
		
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'pushChallenge', pushData, function(response){
			alert(response);
		});
	};
	
	/** */
	this.pushSchema = function(schemaObj){
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'pushSchema', schemaObj, function(response){
			if(response)
				alert('schema modification successful');
			else
				alert('schema modification failed');
		});
	};
	
	/** */
	function pushArticle(){
		if(debug.trace)
			debug.log('in pushArticle');
		var pics = [];
		for(var aPic in uploadUs)
		{
			pics.push(uploadUs[aPic]);
		}
		oldPictures = pics.concat(oldPictures);
		getTabContent();
		var uploadObj = {
			pageID 		: 	document.getElementById('comboBox').value,
			tabs		:	updateTabs,
			category	:	document.getElementById('categoryBox').value,
			pictures	: 	oldPictures,
			points		:	0,
			thumb		: 	thisThumb.url
		};
		if(uploadObj.pageID.length == 8)
			uploadObj.pageID += uploadObj.category.toLowerCase();
			
		thillyUtil.sendReceive(thillyIndex.mainSocket,'pushNewArticle', uploadObj, function(data){
			alert(data.msg);
		});
		document.getElementById('templateTextInput').value = uploadObj.tabs[0].content;
	}

	/** */
	function getTabContent(){
		for(var i = 0; i < updateTabs.length; i++){
			updateTabs[i].content = document.getElementById('tabSpace' + i).innerHTML;
		}
	}
	
	/** */
	function URItoBlob(dataURI){
		if(debug.trace)
			debug.log('in URItoBlob');
			
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