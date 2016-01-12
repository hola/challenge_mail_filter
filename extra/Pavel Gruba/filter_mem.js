"use strict";

function escape(str) {
	return str.replace(/([\\^$+.\[\]{}()])/g, "\\$1").replace(/\?/g, ".").replace(/\*+/g, ".*?");
}

function getTestFunc(rule) {
	var re;
	if(!rule){
		return;
	} else if(rule.indexOf("?") !== -1 || rule.indexOf("*") !== -1) {
		re = new RegExp("^" + escape(rule) + "$");
		return str => re.test(str);
	} else {
		return str => rule === str;
	}
}

function composeRules(rules) {
	return rules.map(rule => {
		return {
			fromTest: getTestFunc(rule.from),
			toTest: getTestFunc(rule.to),
			action: rule.action
		};
	});
}

module.exports = function (messages, rules) {
	var cache = Object.create(null),
		cache_key,
		key,
		keys = Object.getOwnPropertyNames(messages),
		j = keys.length,
		i,
		re = composeRules(rules),
		len = re.length,
		rule,
		msg;
	
	while(j--) {		
		key = keys[j];
		msg = messages[key];		
		cache_key = msg.to + '±' + msg.from;
		
		i = len;		
		messages[key] = cache[cache_key];
		if (messages[key] === undefined) {
			messages[key] = [];
			while(i) {
				rule = re[len - i];
				if((!rule.toTest || rule.toTest(msg.to))
					&& (!rule.fromTest || rule.fromTest(msg.from))) {
					messages[key].push(rule.action);					
				}
				i--;
			}
			cache[cache_key] = messages[key];
		}
    }
	return messages;
};