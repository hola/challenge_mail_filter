/*
	Date: Dec 25, 2015
	Author: Hayk.Martirosyan@gmail.com
*/
(function(exports){
	 var MULTICHAR_MATCH_SYMBOL_CODE = '*'.charCodeAt();
	 var SIMPLECHAR_MATCH_SYMBOL_CODE = '?'.charCodeAt();

	
	var IntegerSet_arrayForClone = [];

	var IntegerSet = function(){
		this.clear();
	}
	IntegerSet.prototype = {

		addAll : function(items){
			for(var i=0; i<items.length; i++){
				var item = items[i];
				this.set[item]=1;
			}
			
		},

		contains : function(item) {
			return this.set[item]===1;
		},

 		
		clear : function(){
			this.set = IntegerSet_arrayForClone.slice(0);
		}

	}
	
	var FilteredSortedList = function(integerSet){
		this.filter = integerSet;
		this.clear();
	}
	FilteredSortedList.prototype = {
		/**
			keeping our items sorted
			items: sorted array
		*/
		addAll : function(items){
			//check if second list items are all biger than ours, in that case no sorting needed
			if(items.length>0){
				if(this.items.length==0 || items[0]>this.items[this.items.length - 1]){
					for(var i=0; i<items.length; i++){
						// this.add(integerSet.items[i]);	
						var item = items[i];
						if(this.filter.contains(item)){
							// this.set[item]=1;
							this.items.push(item);	
						}
						
					}
					//z++;

				}
				// check if second list items are all smaller than ours, in that case no sorting needed
				else if(items[items.length - 1]<this.items[0]){
					//console.log(1)

					var filteredItems = [];
					for(var i=0; i<items.length; i++){
						// this.add(integerSet.items[i]);	
						var item = items[i];
						if(this.filter.contains(item)){
							// this.set[item]=1;
							filteredItems.push(item);	
						}
					}
					this.items = filteredItems.concat(this.items);
					

				}
				else {

					var sourceListIndex = 0;
					var sortedItems = [];
					for(var i=0; i<items.length; i++){
						var item = items[i];
						if(/*this.set[item]!==1 && */this.filter.contains(item)){
							// this.set[item]=1;
							while(sourceListIndex<this.items.length && this.items[sourceListIndex]<item){
								sortedItems.push(this.items[sourceListIndex]);
								sourceListIndex++;
							}
							sortedItems.push(item);
						}
					}
					//copy remainings
					while(sourceListIndex<this.items.length){
						sortedItems.push(this.items[sourceListIndex]);
						sourceListIndex++;
					}
					this.items = sortedItems;

				}	
			}
		},


		toArray : function(){
			return this.items;
		},

		size : function(){
			return this.items.length;
		},

		clear : function(){
			this.items = [];
		}

	}

	

	var RuleTreeRootNode_arrayForClone = [];
	for(var i=0; i<=0x7F; i++){
		RuleTreeRootNode_arrayForClone.push(undefined);
	}
	var RuleTreeRootNode = function(){
		//child rules are kept under their characters code's index for faster select		
		this.childSimpleRules = RuleTreeRootNode_arrayForClone.slice(0);//fast array initialization with 'realy' undefined values
		this.childMultiCharMatchRule = undefined;
		this.childSimpleCharMatchRule = undefined;

		this.ruleIds = [];//rule ids that finish here (ordered!)
		// this._name="root";
		this.hasCharacterRuleChild = false;//for search speed optimisation
	}

	RuleTreeRootNode.prototype = {

		/**

		*/
		processChildRules : function(address, lookupCharacterIndex, matchingRules){
			if(this.childMultiCharMatchRule!==undefined){
				this.childMultiCharMatchRule.findMatchingRules(address, lookupCharacterIndex, matchingRules);
			}
			if(this.childSimpleCharMatchRule!==undefined){
				this.childSimpleCharMatchRule.findMatchingRules(address, lookupCharacterIndex, matchingRules);
			}
			var c = address.charCodeAt(lookupCharacterIndex);
			var childRule = this.childSimpleRules[c];
			if(childRule!==undefined){
				childRule.findMatchingRules(address, lookupCharacterIndex, matchingRules);
			}
		},

		/**
		*	chars array
		*	matchingRules array of matching rules - out like parameter, filled by this method
		*/
		findMatchingRules: function(address, lookupCharacterIndex, matchingRules){
			if(address.length==0){//empty address
				throw new Error('Invalid input, address cannot be empty')
			}
			
			return this.processChildRules(address, lookupCharacterIndex, matchingRules);	
		},

		addChildRule : function(address, index, ruleId) {
			

			if(index===address.length){//rule text finished
				this.ruleIds.push(ruleId);
			}
			else {
				var c = address.charCodeAt(index);
				if(c===MULTICHAR_MATCH_SYMBOL_CODE){//*
					//double ** case, ignore second *
					if(this instanceof MultiCharacterMatchRule){
						this.addChildRule(address, index + 1, ruleId);
					}
					else {
						if(this.childMultiCharMatchRule===undefined){
							this.childMultiCharMatchRule = new MultiCharacterMatchRule();
						}
						this.childMultiCharMatchRule.addChildRule(address, index + 1, ruleId);

					}
					
				}
				else if(c===SIMPLECHAR_MATCH_SYMBOL_CODE){//?
					if(this.childSimpleCharMatchRule===undefined){
						this.childSimpleCharMatchRule = new AnyCharacterMatchRule();
					}
					this.childSimpleCharMatchRule.addChildRule(address, index + 1, ruleId);
				}
				else {

					if(this.childSimpleRules[c]===undefined){
						this.childSimpleRules[c] = new CharacterRule(c);
						this.hasCharacterRuleChild = true;
					}
					this.childSimpleRules[c].addChildRule(address, index + 1, ruleId);
				}
				
			}
		}


		// printNode : function printNode(tab){
		// 	var s = tab + this._name+ (this.ruleIds.length>0?'!':'') + "{\n";
		// 	if(this.childMultiCharMatchRule){
		// 		s+=this.childMultiCharMatchRule.printNode(tab+' ');
		// 	}
		// 	if(this.childSimpleCharMatchRule){
		// 		s+=this.childSimpleCharMatchRule.printNode(tab+' ');
		// 	}
		// 	for(var i=32; i<=128; i++){
		// 		var c = i;//String.fromCharCode(i);
		// 		if(this.childSimpleRules[c]){
		// 			s+=this.childSimpleRules[c].printNode(tab+' ');
		// 		}	
		// 	}
		// 	s+=tab + '}\n'
		// 	return s;
			
		// },

		// toString: function(){
		// 	return this.printNode('');
		// }
	};

	////////////////////////////	character rule
	var CharacterRule = function(char){
		RuleTreeRootNode.call(this);
		this.simpleCharacter = char;
		// this._name=char;
	}
	CharacterRule.prototype = new RuleTreeRootNode();
	CharacterRule.prototype.findMatchingRules = function (address, lookupCharacterIndex, matchingRules){
		// if(address.length==0){//empty address
		// 	throw new Error('Invalid input')
		// }
		if(lookupCharacterIndex===address.length - 1){//this is last character in input(text finished),  use current rules
			matchingRules.addAll(this.ruleIds);//tricky addall /to not use arrays concat
			if(this.childMultiCharMatchRule){
				matchingRules.addAll(this.childMultiCharMatchRule.ruleIds);
			}
		}
		else {//continue for next character under children
			this.processChildRules(address, lookupCharacterIndex+1, matchingRules);
		}

		
	}
	///////////////////////////////		* rule
	var MultiCharacterMatchRule = function(){
		RuleTreeRootNode.call(this);
		// this._name="*";
		
	}
	MultiCharacterMatchRule.prototype = new RuleTreeRootNode();
	MultiCharacterMatchRule.prototype.findMatchingRules = function (address, lookupCharacterIndex, matchingRules){
		if(this.hasCharacterRuleChild===true){
			for(var index = lookupCharacterIndex; index<address.length; index++){
				var c = address.charCodeAt (index);
				var childRule = this.childSimpleRules[c];
				if(childRule!==undefined){
					childRule.findMatchingRules(address, index, matchingRules);
				} 

				
			}	
		}
		if(this.childSimpleCharMatchRule!==undefined){
			for(var index = lookupCharacterIndex; index<address.length; index++){
				this.childSimpleCharMatchRule.findMatchingRules(address, index, matchingRules);
			}
		
		}
		
		//if there was rules that finish here add them also (rules that finish with *)
		if(this.ruleIds.length>0){
			matchingRules.addAll(this.ruleIds);
		}
	}

	///////////////////////////////		? rule
	var AnyCharacterMatchRule = function(){
		RuleTreeRootNode.call(this);
		// this._name="?";
	}
	AnyCharacterMatchRule.prototype = new RuleTreeRootNode();
	AnyCharacterMatchRule.prototype.findMatchingRules = function (address, lookupCharacterIndex, matchingRules){
		if(lookupCharacterIndex===address.length - 1){//text finished use current rules
			matchingRules.addAll(this.ruleIds);
			if(this.childMultiCharMatchRule){
				matchingRules.addAll(this.childMultiCharMatchRule.ruleIds);
			}
		}
		else {//continue for next character under children
			this.processChildRules(address, lookupCharacterIndex+1, matchingRules);
		}
		
	}
		

	var RuleTree = function(ruleIds){
		this.rootNode = new RuleTreeRootNode();
		this.ruleIds = ruleIds;
	}

	RuleTree.prototype = {
		getMatchingRules : function(address){
			this.ruleIds.clear();//reuse objects instead recreation
			this.rootNode.findMatchingRules(address, 0, this.ruleIds);
			return this.ruleIds;
		},

		addRule : function(address, ruleId){
			this.rootNode.addChildRule(address, 0, ruleId);
		}

		//for debug
		// printTree: function(){
		// 	return this.rootNode.printNode('');
		// }	
	}



	exports.filter = function(messages, rules){
		for(var i=IntegerSet_arrayForClone.length; i<rules.length; i++){
			IntegerSet_arrayForClone.push(undefined);
		}


		var fromRuleIds = new IntegerSet();
		var fromRuleTree = new RuleTree(fromRuleIds);
		var toRuleTree = new RuleTree(new FilteredSortedList(fromRuleIds));

		for(var i=0; i<rules.length; i++){				//performance:130ms
			fromRuleTree.addRule(rules[i].from===undefined?"*":rules[i].from, i);
			toRuleTree.addRule(rules[i].to===undefined?"*":rules[i].to, i);		
		}
		


		
		var result = messages;//{};//reuse messages object as return value, this gives us 400ms 
		for(var msgId in messages){
			var msg = messages[msgId];
			//two trees are linked(see constructor arguments). searching first tree affects on results of search from second tree
			fromRuleTree.getMatchingRules(msg.from);//performance:0.7s
			
			var matchingToRuleIds = toRuleTree.getMatchingRules(msg.to);	//performance:0.6s

			var sordetRuleIds = matchingToRuleIds.toArray();//already intersected and sorted
			var actions = [];
			for(var i=0; i<sordetRuleIds.length; i++){//performance:100ms
				var rule = rules[sordetRuleIds[i]];
				actions.push(rule.action);
				
			}
			
			result[msgId] = actions;//performance:100ms
			
		}

		

		return result;

	}




})(exports);
