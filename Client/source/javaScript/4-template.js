/**
 *
 */
 
/** */
window.thillyTemplate = {}; 

/** */ 
(function(debug){
	
	/** */
	var pictureHolder = [];
	
	/** */
	var oldPictures = [];
	
	/** */
	var tabs = [];
	
	/** */
	var currentTab = 0;
	
	/** */
	var thumb = {
		source	: 'old',
		url		: 'thillys.png'
	};
	
	/** */
	var uploadTotal = 0;		
	
	/** */ 
	this.init = function(){
		if(debug.trace)
			debug.log('in init');
		tabs = [];
		pictureHolder = [];	
		thillyUtil.sendReceive(thillyIndex.mainSocket,'getPageIDs',{}, function(data, socket){
			appendPageIDs(data);
		});
		
		thillyTemplate.addANewTab();
		
		document.getElementById('comboBox').value = thillyUtil.dateTimeStamp();		
		
		document.getElementById('comboBox').onchange = function(form){
			currentTab = 0;
			if(debug.trace)
				debug.log('in comboBox onChange: ' + form.target.value);////update category also
			var requestObj = {
				pageID : form.target.value,
				category : form.target.value.substring(8)
			};
			if(requestObj.category == ''){
				document.getElementById('templateTextInput').focus();
				return;
			}
			var optionEnum = {
				home : 0,
				games : 1,
				challenge : 2,
				bio : 3,
				neural: 4,
				template: 5
			};
			document.getElementById('categoryBox').selectedIndex = optionEnum[requestObj.category];
			
			thillyUtil.sendReceive(thillyIndex.mainSocket,'getPageDetails', requestObj, function(data){
					tabs = [];
					if(data){
						currentTab = 0;
						document.getElementById('templateView').innerHTML = '';
						document.getElementById('titleBox').value = data.tabs[0].title;
						document.getElementById('functionBox').value = data.tabs[0].functionCall;
						document.getElementById('templateTextInput').value = data.tabs[0].content;
						document.getElementById('templateTextInput').focus();
						var tabList = document.getElementById('templateTabList');
							tabList.innerHTML = '';
						for(var i = 0; i < data.tabs.length; i++){
							thillyTemplate.addANewTab(data.tabs[i], i);
						}
						if(typeof(data.thumb) == 'string')
							thumb.url = data.thumb;
						else
							thumb.url = 'thillys.png';//default pic
						if(data.pictures)
							oldPictures = data.pictures;
						else
							oldPictures = [];
						
						updateContent(data.tabs[currentTab].content, currentTab);
					}
					else{						
						document.getElementById('titleBox').value = '';
						document.getElementById('functionBox').value = '';
						document.getElementById('templateTextInput').value = '';
						document.getElementById('templateTextInput').focus();
						updateContent('', currentTab);
						var tabList = document.getElementById('templateTabList');
							tabList.innerHTML = '';
						tabList.appendChild(addATab({content:'', title:'title', functionCall:''}, 0));
						thumb.url = 'thillys.png';//default pic
						oldPictures = [];
					}
					
					thumb.source = 'old';					
					document.getElementById('aBox1').style.backgroundImage = 'url(/images/' + thumb.url + ')';
			});
		};
		
		document.getElementById('titleBox').onchange = function(){
			propagateChanges();
			document.getElementById('aBox1').innerHTML = this.value;
			document.getElementById('aBox1').title = this.value;
			var tabList = document.getElementById('templateTabList');
				tabList.childNodes[currentTab].innerHTML = this.value;
		};
		
		var textArea = document.getElementById('templateTextInput');
		textArea.onchange = function(){
			propagateChanges();
			updateContent(this.value, currentTab);
		};
		
		textArea.onkeydown = function(event){
			if(event.keyCode == 9){//add the tab to the text area, don't tab away
				textArea.value = textArea.value.insertAt(textArea.selectionStart, '\t');
				event.preventDefault();
			}		
		};
		
		document.getElementById('aBox1').style.backgroundImage = 'url(/images/'+thumb.url+')';
		
		fillOptions();
		document.getElementById('templateOptionsButton').onclick = function(){
			showOptions();		
		};		
	};
	
	/** */ 
	function appendPageIDs(pageIDs){
		if(debug.trace)
			debug.log('in appendPageIDs: ' + pageIDs);
		for(var i = 0; i < pageIDs.length; i++){
			var newOption = document.createElement('option');
			newOption.value = pageIDs[i].pageID;
			document.getElementById('pageIDs').appendChild(newOption);
		}
	};
	
	/** */
	this.addANewTab = function(content, tabIndex){
		var textInput = document.getElementById('templateTextInput');
		var titleBox = document.getElementById('titleBox');
		var functionBox = document.getElementById('functionBox');
			if(content)
				tabs.push({title:content.title, content:content.content, functionCall:content.functionCall});
			else
				tabs.push({title:'', content:'', functionCall:''});
				
		var newTab = document.createElement('span');
			newTab.className = 'inlineButton small' + ((tabIndex === 0)?' selected':'');
			newTab.innerHTML = ((content)?content.title:'title');
			newTab.id = ((typeof tabIndex != 'undefined')?tabIndex:tabs.length-1);
			newTab.onclick = function(){
				propagateChanges();
				thillyUtil.replaceClasses('inlineButton small selected', 'inlineButton small');
				thillyUtil.replaceClasses('tabSpace selected', 'tabSpace');
				document.getElementById('tabSpace' + this.id).className = 'tabSpace selected';
				this.className = 'inlineButton small selected';
				currentTab = this.id;
				retrieveChanges(currentTab);
			};
		var tabSpace = document.createElement('div');
			tabSpace.id = 'tabSpace' + newTab.id;
			tabSpace.className = 'tabSpace' + ((newTab.id == currentTab)?' selected':'');
			tabSpace.innerHTML = ((content)?content.content:'');
		
		document.getElementById('templateView').appendChild(tabSpace);
		document.getElementById('templateTabList').appendChild(newTab);
	};
	
	/** */ 
	this.getPicture = function(element){
		if(debug.trace)
			debug.log('in getPicture');
		preUpload(element, function(image){
			var pictureList = document.getElementById('pictureList');
			pictureList.appendChild(makePreview(image));
		});
	};
	
	/** */
	this.getThumb = function(element){
		if(debug.trace)
			debug.log('in getThumb');
		preUpload(element, function(image){
			 document.getElementById('aBox1').style.backgroundImage = 'url(' + image.src + ')';
			thumb.url = image.src;
			thumb.source = 'new';
			document.getElementById('thumbHandle').innerHTML = 'Change thumbnail';
		});	
	};

	/** */ 
	this.goClick = function(elemID){
		if(debug.trace)
			debug.log('in goClick: ' + elemID);
		var fileButton = document.getElementById(elemID);
		var click = document.createEvent('Event');
		click.initEvent('click', true, true);
		fileButton.dispatchEvent(click);	
	};
	
	/** */
	this.submit = function(){
		propagateChanges();
		if(thillyIndex.user.type == 'admin'){
			thillyAdmin.submit(oldPictures, thumb, tabs)
		}
		else
			thillyAdmin.submit();
	};
	
	/** */	
	function showOptions(){
		document.getElementById('templateOptionsMenu').style.display = 'block';
	}

	/** */
	function propagateChanges(){
		tabs[currentTab].content =  document.getElementById('templateTextInput').value;
		tabs[currentTab].title =  document.getElementById('titleBox').value;
		tabs[currentTab].functionCall = document.getElementById('functionBox').value;
	}
	
	function retrieveChanges(tabIndex){
		document.getElementById('templateTextInput').value = tabs[tabIndex].content;
		document.getElementById('titleBox').value = tabs[tabIndex].title; 
		document.getElementById('functionBox').value = tabs[tabIndex].functionCall;
		updateContent(tabs[tabIndex].content, tabIndex);
	}
	
	/** */	
	function fillOptions(){
		if(debug.trace)
			debug.log('in showOptions');
		
		var options = document.getElementById('templateOptionsMenu');
		var aRow = document.createElement('div');
		
			aRow.appendChild(makeTemplateOption('<p>', 'paragraph tag'));
			aRow.appendChild(makeTemplateOption('<br>', 'line break tag'));
			aRow.appendChild(makeTemplateOption('X', 'close menu', '', function(){
					options.style.display = 'none';
			}));
			
		options.appendChild(aRow);
		aRow = document.createElement('div');
		
			aRow.appendChild(makeTemplateOption('<i>', 'italic text'));
			aRow.appendChild(makeTemplateOption('<b>', 'bold text'));
			aRow.appendChild(makeTemplateOption('<u>', 'underline text'));
		
		options.appendChild(aRow);
		aRow = document.createElement('div');
		
			aRow.appendChild(makeTemplateOption('<pre>', 'remove formatting (code)', 'twoWide'));
		
		options.appendChild(aRow);
		aRow = document.createElement('div');
			
	};
	
	/** */	
	function makeTemplateOption(innerText, titleText, addClass, onclick){
	
		var option = document.createElement('span');
			option.textContent = innerText;
			option.title = titleText;
			option.className = 'templateOption' + ' ' + addClass;
			if(onclick)
				option.onclick = function(event){
				var textArea = document.getElementById('templateTextInput');
					onclick(textArea);
					thillyUtil.stopBubble(event);
					updateContent(textArea.value, currentTab);
				};
			else
				option.onclick = function(event){
					var textArea = document.getElementById('templateTextInput');
					var start = textArea.selectionStart;
					var end = textArea.selectionEnd;
					value = textArea.value;
					value = value.insertAt(end, innerText.insertAt(1, '/'));
					value = value.insertAt(start, innerText);
					textArea.value = value;
					textArea.select();
					textArea.selectionStart = start + innerText.length;
					textArea.selectionEnd = end + innerText.length;
					thillyUtil.stopBubble(event);
					updateContent(textArea.value, currentTab);
				};
		return option;	
	}
	
	/** */ 
	function updateContent(newContent, id){
		if(debug.trace)
			debug.log('in updateContent');
		var templateView = document.getElementById('templateView')
		document.getElementById('tabSpace' + id).innerHTML = newContent;
		document.getElementById('templateTextInput').value = newContent;
		for(var i = 0; i < pictureHolder.length; i++){
			var picInContext = templateView.querySelector('#tempPic' + i);
			if(picInContext)
				if(picInContext.childNodes.length == 0)
					picInContext.appendChild(new controlBox(pictureHolder[i]));
		}
			
		thillyInteraction.reScale();
	}

	/** */ 
	function preUpload(element, callBack){
		if(debug.trace)
			debug.log('in preUpload');
		var files = element.files;
		for(var i = 0; i < files.length; i++){
			if(files[i].type.match('image.*')){
				var reader = new FileReader();
				reader.onload = function(readerEvent){
					var image = new Image();
					image.onload = function(imageEvent){
						callBack(image);
					}
					image.src = readerEvent.target.result;
				}
				reader.readAsDataURL(files[i]);
			}
		}
		element.value = '';
	}
	
	/** */
	function makePreview(image){
		if(debug.trace)
			debug.log('in makePreview');	
		var smallBox = document.createElement('div');
		var maxD = 200, ratio = 0;
		if(image.height> image.width)
			ratio = 200/image.height;
		else
			ratio = 200/image.width;
		image.height *= ratio;
		image.width *= ratio;
	
		smallBox.className = 'imgBox';
		smallBox.appendChild(image);
		smallBox.id = pictureHolder.length;
		smallBox.setAttribute('ratio', ratio);
		
		
		smallBox.onclick = function(){
			document.getElementById('templateTextInput').value += '<div id="tempPic'+pictureHolder.length+'"></div>';
			pictureHolder.push(this);
			updateContent(document.getElementById('templateTextInput').value, currentTab);
		};
		
		return smallBox;
	}
	
	/** */
	function controlBox(pic){
		if(debug.trace)
			debug.log('in controlBox');
		var thisBox = document.createElement('div');
		thisBox = pic.cloneNode(true);
		thisBox.className = 'controlBox';
		
		var containerPic = thisBox.childNodes[0];
		containerPic.height /= thisBox.getAttribute('ratio');
		containerPic.width /= thisBox.getAttribute('ratio');
		
		thisBox.onclick = function(){
			if(this.style['float'] == '')
				this.style['float']='right';
			else if(this.style['float'] == 'right')
				this.style['float']='left';
			else if(this.style['float'] == 'left')
				this.style['float']='';
		};
		
		return thisBox;
	}
	
}).apply(window.thillyTemplate, [window.thillyLogging]);











