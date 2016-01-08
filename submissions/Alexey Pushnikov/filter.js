/*
на регулярках

Скрипт выполнялся <7604> ms.

*/
exports.filter = function(messages, rules){
	var results = {};
	var i, j;
	var message;
	var rule;
	var result;

	function createRegExp (inputstring) {
		return new RegExp('^' + inputstring.replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&').replace(/\?/g, '.').replace(/\*/g, '.*') + '$');
	}

	for (j in rules) {
		rule = rules[j];
		if (rule.from) {
			rules[j].from = createRegExp(rule.from);
		}
		if (rule.to) {
			rules[j].to = createRegExp(rule.to);
		}
	}
	for (i in messages) {
		message = messages[i];
		result = [];
		for (j in rules) {
			rule = rules[j];
			if (rule.from && rule.to) {
				if (rule.from.test(message.from) && rule.to.test(message.to)) {
					result.push(rule.action);
				}
			} else if (rule.from) {
				if (rule.from.test(message.from)) {
					result.push(rule.action);
				}
			} else if (rule.to) {
				if (rule.to.test(message.to)) {
					result.push(rule.action);
				}
			} else {
				result.push(rule.action);
			}
		}
		if (result) {
			results[i] = result;
		}
	}
	return results;
}