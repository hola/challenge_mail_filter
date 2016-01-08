// Filter #5

var REPLACEMENT_REGEX = /[.+^${}()|[\]\\]/g;

var compile_rules = function(rules) {
	var compiled_rules = [];
	rules.forEach(function(rule) {
		var compiled_rule = {
			from: null,
			to: null,
			action: rule.action
		};

		if (rule.from) {
			var regexFrom = rule.from
							.replace(REPLACEMENT_REGEX, "\\$&")
							.replace('*', '.*')
							.replace('?', '.');
			compiled_rule.from = RegExp(regexFrom);
		}

		if (rule.to) {
			var regexTo = rule.to
					.replace(REPLACEMENT_REGEX, "\\$&")
					.replace('*', '.*')
					.replace('?', '.');
			compiled_rule.to = RegExp(regexTo);
		}

		compiled_rules.push(compiled_rule);
	});

	return compiled_rules;
};

module.exports.filter = function(messages, rules) {
	var compiled_rules = compile_rules(rules);
	var results = {};

	Object.keys(messages).forEach(function(msgId) {
		results[msgId] = [];

		compiled_rules.forEach(function(compiled_rule) {
			if (compiled_rule.from != null &&
				!compiled_rule.from.test(messages[msgId].from)) {
				return;
			}

			if (compiled_rule.to != null &&
				!compiled_rule.to.test(messages[msgId].to)) {
				return;
			}

			results[msgId].push(compiled_rule.action);
		});
	});

	return results;
};
