function notNull(x) { return x; }

function compileFilter(mask) {
	var regexp = new RegExp('^' + mask.replace('.', '\\.').replace('*', '.*').replace('?', '.') + '$');
	return function (value) {
		return regexp.test(value);
	}
}

function compileRule(rule) {
	var action = rule.action;

	if (!rule.to && !rule.from) {
		return function () { return action; };
	} else if (!rule.from) {
		var toTest = compileFilter(rule.to);
		return function (msg) {
			if (toTest(msg.to)) {
				return action;
			}
		}
	} else if (!rule.to) {
		var fromTest = compileFilter(rule.from);
		return function (msg) {
			if (fromTest(msg.from)) {
				return action;
			}
		}
	} else {
		var toTest = compileFilter(rule.to);
		var fromTest = compileFilter(rule.from);
		return function (msg) {
			if (toTest(msg.to) && fromTest(msg.from)) {
				return action;
			}
		}
	}
}

function filter(messages, rules) {
	var ruleMatchers = rules.map(compileRule);
	for (var id in messages) {
		messages[id] = ruleMatchers.map(function(rm) { return rm(messages[id]); }).filter(notNull)
	}
	return messages;
}

module.exports = filter;