function filter(messages, rules) {
	var result = {};
	Object.keys(messages).forEach(function(key) {
		result[key] = [];
		rules.forEach(function(rule) {
			var fromResult,
				toResult;
			if (rule.from) {
				var fromRegExpString = rule.from.replace(/\?/g, '.').replace(/\*/g, '.*');
				var fromRegExp = new RegExp('\\b'+fromRegExpString+'\\b');
				fromResult = fromRegExp.test(messages[key].from);
			} else {fromResult = true;}
			if (rule.to) {
				var toRegExpString = rule.to.replace(/\?/g, '.').replace(/\*/g, '.*');
				var toRegExp = new RegExp('\\b'+toRegExpString+'\\b');
				toResult = toRegExp.test(messages[key].to);
			} else {toResult = true;}
			if (fromResult && toResult) {
				result[key].push(rule.action);
			}
		});
	});
	return result;
}

module.exports.filter = filter;