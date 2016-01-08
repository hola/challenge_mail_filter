var _messages;
var _rules;
var _result = new Object()

function filter(messages,rules) {
	_messages = messages;
	_rules = regexArray(rules);
	Object.keys(messages).forEach(msgForEachFunc);
	return _result;
}

function msgForEachFunc(key) {
	var msgObj = _messages[key];
	var from = msgObj.from;
	var to = msgObj.to;
	var ruleArray = new Array();
	for (var i=0; i < _rules.length; i++) {
		testMsgRule(_rules[i],msgObj,ruleArray);
	}
	_result[key] = ruleArray;
}

function testMsgRule(rule,msgObj,ruleArray) {
	if (testRuleRegEx(msgObj.from,rule.from) && testRuleRegEx(msgObj.to,rule.to)){
			ruleArray.push(rule.action);
	}
}

function regexArray(rules) {
	var newRules = new Array();
	rules.forEach(function(element, index, array) {
  		var fromRegExp = element.from ?  new RegExp(element.from.split("*").join(".*").split("?").join(".")) : new RegExp(".*");
		var toRegExp = element.to ? new RegExp(element.to.split("*").join(".*").split("?").join(".")) : new RegExp(".*");
		newRules.push({"from":fromRegExp,"to":toRegExp,"action":element.action});
	});
	return newRules;
}

function testRuleRegEx(str,regExp) {
	return str.search(regExp) == 0;
}

exports.filter = filter;