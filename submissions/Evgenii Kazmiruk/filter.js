var symbols_map = {'*': '.*', '?': '.'},
    transform_regexp = /([\$\(\)\+\.\/\?\[\]\\\^\|\{\}\-\*\?])/g,
    prepare_rules = function(s) {
	return symbols_map[s] || ("\\" + s);
    },
    cache_regexp = {},
    memoized_test = function(rule, email) {
	if (rule === undefined) {
		return true;
	}

	if (cache_regexp[rule] === undefined) {
		transform_regexp.lastIndex = 0;
		cache_regexp[rule] = new RegExp("^" + rule.replace(transform_regexp, prepare_rules) + "$");
	}

	return cache_regexp[rule].test(email);
    };

exports.filter = function(messages, rules) {
	var cache_pairs = {};
	var r_l = rules.length;

	Object.keys(messages).forEach(function(k) {
		var key_pairs = messages[k].from + "\0" + messages[k].to;
		var actions = cache_pairs[key_pairs];

		if (actions === undefined) {
			actions = [];
			for (var i = 0; i < r_l; i++) {
				if (memoized_test(rules[i].from, messages[k].from) && memoized_test(rules[i].to, messages[k].to)) {
					actions.push(rules[i].action);
				}
			}
			cache_pairs[key_pairs] = actions;
		}
		messages[k] = actions;
	});

	return messages;
};