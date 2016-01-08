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
	var key,
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
		
		messages[key] = [];		
		i = len;
		
		while(i) {
			rule = re[len - i];
			if((!rule.toTest || rule.toTest(msg.to))
				&& (!rule.fromTest || rule.fromTest(msg.from))) {
				messages[key].push(rule.action);
			}
			i--;
		}
    }
	return messages;
};