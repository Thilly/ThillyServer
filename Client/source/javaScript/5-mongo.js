/** 
 *
 */

/** */
window.thillyMongo = {};

/** */
(function(debug){

	/** */
	var get = [getCollections, getOneDocument, showSchema, showSchema, showSchema, showSchema, showSchema, showSchema];
	
	/** */
	var typeMap = ['database','collection','field','nested','nested','nested','nested','nested'];
	
	/** */
	this.init = function(){
		if(debug.trace)
			debug.log('in mongoInit');
			
		thillyUtil.sendReceive(thillyIndex.mainSocket,'getDBs',{}, function(dbList){
			var depth = 0;
			fillColumn(dbList, depth);
		});
	};
	
	/** */	
	this.find = function(){
	
	};	

	/** */	
	this.update = function(){
	
	};	

	/** */	
	this.insert = function(){
	
	};	

	/** */	
	this.remove = function(){
	
	};
	
	/** */
	function submitSchema(){
		if(debug.trace)
			debug.log('in submitSchema');
			
		var submitObj = {
			path : document.getElementById('schemaPath').textContent.replace('Path: ', ''),
			pattern : document.getElementById('schemaEditPattern').value,
			description : document.getElementById('schemaEditDesc').value,
			value : document.getElementById('schemaEditValue').value,
			readonly : document.getElementById('schemaEditReadonly').checked
		};
			
		thillyAdmin.pushSchema(submitObj);
	}
	
	/** */	
	function getCollections(dbName){
		if(debug.trace)
			debug.log('in getCollections: ' + dbName);
			
		var parent = dbName;
		
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getCollections', {'db':dbName}, function(collList){
			var depth = 1;
			fillColumn(collList, depth, parent);
		});		
	}

	/** */	
	function getOneDocument(path){
		if(debug.trace)
			debug.log('in getOneDocument: ' + path.split('.')[0] + ' : ' + path.split('.')[1]);

		var parent = path;
		
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getOneDocument', {db: path.split('.')[0], coll: path.split('.')[1]}, function(doc){
			var depth = 2;
			fillColumn(doc, depth, parent);		
		});
	}
	
	/** */	
	function showSchema(DBpath){
		if(debug.trace)
			debug.log('in showSchema: ' + DBpath);
		thillyUtil.sendReceive(thillyIndex.mainSocket, 'getSchema', {path:DBpath}, function(result){
			if(result === false){
				debug.log('error in getSchema response');
				return;				
			}
			var output = document.getElementById('mongoSchema');
				output.innerHTML = '';
				output.className = 'mongoSchema filled';
			
			var path = document.createElement('div');
				path.textContent = 'Path: ' + DBpath;
				path.id = 'schemaPath';
				path.className = 'schema path';
				
			var pattern = document.createElement('div');
				pattern.textContent = 'Pattern: ' + (result.pattern || 'none');
				pattern.id = 'schemaPattern';
				pattern.className = 'schema pattern';
				
			var description = document.createElement('div');
				description.textContent = 'Description: ' + (result.description || 'none');
				description.id = 'schemaDescription';
				description.className = 'schema description';
				
			var value = document.createElement('div');
				value.textContent = 'Ex value: ' + (result.value || 'none');
				value.id = 'schemaValue';
				value.className = 'schema value';
		
			
			var editButton = document.createElement('span');
				editButton.className = 'inlineButton small' +((result.readonly)?' disabled':'');
				editButton.innerHTML = ((result.readonly)?'Read only':'Edit Schema');
				editButton.onclick = function(){
					if(this.innerHTML == 'Edit Schema'){
						getSchemaEditBoxes(result.readonly);
						this.innerHTML = 'Cancel';
					}
					else{
						this.innerHTML = 'Edit Schema';
						description.removeChild(description.lastChild);
						pattern.removeChild(pattern.lastChild);
						value.removeChild(value.lastChild);
						output.removeChild(output.lastChild);//readonly
						output.removeChild(output.lastChild);//submit
					}
				};			
			output.appendChild(path);
			output.appendChild(description);
			output.appendChild(pattern);
			output.appendChild(value);
			thillyUtil.createLoginWall(false, editButton, function(logWall){
				output.appendChild(logWall);
			});
		});
	}

	/** */
	function getSchemaEditBoxes(readonly){
		if(debug.trace)
			debug.log('in getSchemaEditBoxes');
		var output = document.getElementById('mongoSchema');
		var description = document.getElementById('schemaDescription');
		var pattern = document.getElementById('schemaPattern');
		var value = document.getElementById('schemaValue');
		
		var checkLabel = document.createElement('label');
			checkLabel.innerHTML = 'Read Only:';
		var checkBox = document.createElement('input');
			checkBox.type = 'checkbox';
			checkBox.id = 'schemaEditReadonly';
			checkBox.checked = readonly;
			checkBox.onchange = function(){
				if(this.checked)
					thillyUtil.replaceClasses('schemaEdit', 'schemaEditDisabled');
				else
					thillyUtil.replaceClasses('schemaEditDisabled', 'schemaEdit');
			};
			checkLabel.appendChild(checkBox);
			
		
		var submitButton = document.createElement('span');
			submitButton.textContent = 'Submit';
			submitButton.id = 'submitSchema';
			submitButton.className = 'inlineButton small' + ((readonly)?' disabled':'');
			submitButton.onclick = function(){
				if(valueEdit.validity.valid)
					submitSchema();
			};
	
		var descEdit = document.createElement('textArea');
			descEdit.rows = 5;
			descEdit.cols = 20;
			descEdit.value = description.textContent.replace('Description: ', '');
			descEdit.className = 'schemaEdit' + ((readonly)?'Disabled':'');
			descEdit.id = 'schemaEditDesc';
		
		var patternEdit = document.createElement('input');
			patternEdit.type = 'text';
			patternEdit.value = pattern.textContent.replace('Pattern: ', '');
			patternEdit.className = 'schemaEdit' + ((readonly)?'Disabled':'');
			patternEdit.id = 'schemaEditPattern';
			patternEdit.onchange = function(){
				if(patternEdit.value != 'none'){
					valueEdit.pattern = patternEdit.value;
					if(valueEdit.validity.valid)
						submitButton.className = 'inlineButton small';
					else
						submitButton.className = 'inlineButton small disabled';					
				}
			};
			
		var valueEdit = document.createElement('input');
			valueEdit.type = 'text';
			valueEdit.value = value.textContent.replace('Ex value: ', '');
			valueEdit.className = 'schemaEdit' + ((readonly)?'Disabled':'');
			valueEdit.id = 'schemaEditValue';
			valueEdit.onchange = function(){
				if(patternEdit.value != 'none'){
					valueEdit.pattern = patternEdit.value;
					if(valueEdit.validity.valid)
						submitButton.className = 'inlineButton small';
					else
						submitButton.className = 'inlineButton small disabled';
				}
			};
		
		output.appendChild(submitButton);
		output.appendChild(checkLabel);
		pattern.appendChild(patternEdit);
		description.appendChild(descEdit);
		value.appendChild(valueEdit);	
	}
	
	/** */	
	function clearAhead(depth){
		if(debug.trace)
			debug.log('in clearAhead: ' + depth);
			
		var output = document.getElementById('mongoSchema');
			output.className = 'mongoSchema';
			output.innerHTML = '';
			
		var box = document.getElementById('schemaWrapper');
		for(var i = depth+1; i < box.children.length; i++){
			box.children[i].innerHTML = '';
			box.children[i].className = box.children[i].className.replace('filled', '');
		}
	}
	
	/** */	
	function addAddNewButton(depth){//thats such a stupid name
		if(debug.trace)
			debug.log('in addAddNewButton: ' + depth);
		var plusButton = document.createElement('div');
			plusButton.className = 'mongoClickable ' + depth;
			plusButton.id = depth + 'plus';
			plusButton.textContent = '+';
			plusButton.style.textAlign = 'center';
			plusButton.onclick = function(){
				thillyUtil.replaceClasses('mongoClickable ' + depth + ' selected', 'mongoClickable ' + depth);
				clearAhead(depth);
				//create new type, append ahead of the plus
			};
		return plusButton;
	}
	
	/** */
	function fillColumn(data, depth, parent){
		if(debug.trace)
			debug.log('in fillColumn: ' + depth);
		var currCol = document.getElementById('List' + depth);
			currCol.className = 'mongoList filled';
			currCol.innerHTML = 'Select ' + typeMap[depth];
			
		for(var eachType in data){
			var aType = document.createElement('div');
				aType.className = 'mongoClickable ' + depth;
				
				if(depth > 1){//if doc instead of names of db/collection
					aType.textContent = eachType;
					aType.id = ((parent)?(parent + '.' + eachType):eachType);
					aType.value = data[eachType];
				}
				else{//0, 1 DB/collection
					aType.textContent = data[eachType];
					aType.id = ((parent)?(parent + '.' + data[eachType]):data[eachType]);
				}
				aType.onclick = function(){
					nextLayer.call(this, depth);
				};
			currCol.appendChild(aType);
		}
		currCol.appendChild(addAddNewButton(depth));	
	}
	
	/** */
	function nextLayer(depth){
		if(debug.trace)
			debug.log('in nextLayer: ' + depth);
		if(this.className == 'mongoClickable ' + depth + ' selected'){
			this.className = 'mongoClickable ' + depth;
			clearAhead(depth);
		}
		else{
			thillyUtil.replaceClasses('mongoClickable ' + depth + ' selected', 'mongoClickable ' + depth);
			this.className = 'mongoClickable ' + depth + ' selected';	
			clearAhead(depth);
			if(typeof this.value == 'object'){//if not terminating doc
				if(this.value.length && typeof this.value[0] == 'object')//if array of non-terminating doc
					fillColumn(this.value[0], depth+1, this.id);
				else
					get[depth](this.id, this.value[0]);//if array of terminating doc
			}
			else//get next layer
				get[depth](this.id, this.value);
		}	
	}
	
}).apply(window.thillyMongo, [window.thillyLogging]);


/* add a schema specific database
		each collection will represent a database
		each document will represent a specific collection
		each record will be a mapping of a field name onto a regex pattern for pre-validation
			before submit or changes
		
*/		