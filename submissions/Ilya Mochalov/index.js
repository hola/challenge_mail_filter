
module.exports.filter = function (messages, rules) {
	var rulesLen = rules.length;
	var result = {};

	for (var ruleId = 0; ruleId < rulesLen; ruleId++) {
		var rule = rules[ruleId];

		if (rule.from) {
			var fromReducedAsterisks = rule.from.toString().replace(/\*{2,}/g, '*');
			if (rule.from != '*') {
				var fromRegExp = '^';
				fromRegExp += fromReducedAsterisks
					.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
					.replace(/\*{2,}/g, '*')
					.replace(/\*(\?+)/g, '$1*')
					.replace(/\*/g, '.*')
					.replace(/\?/g, '.');
				fromRegExp += '$';
				rule.from = new RegExp(fromRegExp);
			}
			else {
				delete rule.from;
			}
		}

		if (rule.to) {
			var toReducedAsterisks = rule.to.toString().replace(/\*{2,}/g, '*');

			if (rule.to != '*') {
				var toRegExp = '^';
				toRegExp += toReducedAsterisks
					.toString()
					.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
					.replace(/\*{2,}/g, '*')
					.replace(/\*(\?+)/g, '$1*')
					.replace(/\*/g, '.*')
					.replace(/\?/g, '.');
				toRegExp += '$';

				rule.to = new RegExp(toRegExp);
			}
			else {
				delete rule.to;
			}
		}
	}

	Object.keys(messages).forEach(function (msgId) {
		result[msgId] = [];
		var msg = messages[msgId];

		for (var ruleId = 0; ruleId < rulesLen; ruleId++) {
			var rule = rules[ruleId];

			if (!rule.from || rule.from.test(msg.from)) {
				if (!rule.to || rule.to.test(msg.to)) {
					result[msgId].push(rule.action);
				}
			}
		}
	});

	return result;
};
