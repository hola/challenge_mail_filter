'use strict';

var escapeStrPattern = /[|\\{}()[\]^$+*?.]/g;

function escapeStrReplace(c) {
	if (c === '?') {
		return '.?';
	}
	if (c === '*') {
		return '.*';
	}
	return '\\' + c;
}

function getMaskTest(mask) {
	var regexp;

	if (mask.indexOf('*') < 0 && mask.indexOf('?') < 0) {
		return function(value) {
			return mask === value;
		};
	}

	regexp = new RegExp('^' + mask.replace(escapeStrPattern, escapeStrReplace) + '$');

	return function(value) {
		return regexp.test(value);
	};

}

function keyMapper(){
	var map = new Map();
	return function(str){
		var key;
		if((key = map.get(str)) === undefined){
			map.set(str, key = map.size);
		}
		return key;
	}
}

function filter(messages, rules) {
	var result = {};
	var messagesArr = [], idsArr = [], i, l, j, m, testFrom, testTo, rule, message, messageActions;
	var matched, ruleFromKey, ruleToKey;
	var messagesCache = [], rulesCache = [];
	var getAddressKey = keyMapper();
	var getMaskKey = keyMapper();
	
	for (i in messages) {
		
		l = idsArr.length;
		idsArr[l] = i;
		messagesArr[l] = message = messages[i];
		result[i] = [];
		
		message.fromKey = getAddressKey(message.from);
		if(messagesCache.length <= message.fromKey){
			messagesCache[messagesCache.length] = [];
		}
		
		message.toKey = getAddressKey(message.to);
		if(messagesCache.length <= message.toKey){
			messagesCache[messagesCache.length] = [];
		}
		
	}
	
	m = messagesArr.length;
	l = rules.length;
	
	for (i = 0; i < l; i++) {
		rule = rules[i];
		
		if(rule.from === undefined || rule.from === '*'){
			ruleFromKey = testFrom = null;
		}else{
			ruleFromKey = getMaskKey(rule.from);
			testFrom = getMaskTest(rule.from);
		}
		
		if(rule.to === undefined || rule.to === '*'){
			ruleToKey = testTo = null;
		}else{
			ruleToKey = getMaskKey(rule.to);
			testTo = getMaskTest(rule.to);
		}

		for (j = 0; j < m; j++) {
			message = messagesArr[j];
			
			if(ruleFromKey === null){
				matched = true;
			}else if((matched = messagesCache[message.fromKey][ruleFromKey]) === undefined){
				messagesCache[message.fromKey][ruleFromKey] = matched = testFrom(message.from);
			}
			
			if(matched === true){
				
				if(ruleToKey === null){
					matched = true;
				}else if((matched = messagesCache[message.toKey][ruleToKey]) === undefined){
					messagesCache[message.toKey][ruleToKey] = matched = testTo(message.to);
				}
				
				if(matched === true){
					messageActions = result[idsArr[j]];
					messageActions[messageActions.length] = rule.action;
				}
				
			}

		}

	}

	return result;
}

module.exports = filter;
