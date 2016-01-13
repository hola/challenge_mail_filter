/**
 * Hola JS challenge
 * Version: 3 (hors concours)
 * Comment: regexp correctness fixed, caching added
 */

'use strict';


module.exports.filter = function (messages, rules) {
	var keys = Object.keys(messages);
	var total = keys.length;
	var cache = {};
	var message;
	var key;

	prepareRules(rules);

	while (total--) {
		message = messages[keys[total]];
		key = message.from + '\n' + message.to;

		if (cache[key]) {
			messages[keys[total]] = cache[key];
		} else {
			messages[keys[total]] = cache[key] = filterActions(message, rules);
		}
	}

	return messages;
};


function prepareRules (rules) {
	var rule;
	var total = rules.length;

	while (total--) {
		rule = rules[total];

		if (rule.from !== undefined) {
			rule.from = prepareRule(rule.from);
		}

		if (rule.to !== undefined) {
			rule.to = prepareRule(rule.to);
		}
	}
}


function prepareRule (rule) {
	var hasAny = rule.indexOf('*') !== -1;
	var hasOne = rule.indexOf('?') !== -1;

	if (hasAny && !hasOne) {
		if (rule.search(/[^*]/) === -1) {
			return undefined;
		}

		let splitted = rule.split(/\*+/);

		if (splitted.length === 2) {
			return prepareDynamicLength(splitted);
		}
	}

	if (hasAny) {
		return prepareRegexp(rule);
	}

	if (hasOne) {
		return prepareStrongLength(rule);
	}

	return prepareEqual(rule);
}


function prepareDynamicLength (splitted) {
	return {
		dynamic: true,
		start: splitted[0],
		startLength: splitted[0].length,
		end: splitted[1],
		endLength: splitted[1].length
	};
}


function prepareEqual (rule) {
	return {
		equal: true,
		length: rule.length,
		data: rule
	};
}


function prepareStrongLength (rule) {
	var splitted = rule.split(/(\?)/).filter(function (item) {
		return item !== '';
	});

	var result = [];
	var i = 0;
	var total = splitted.length;
	var idx = 0;
	var item;

	for (; i < total; i++) {
		item = splitted[i];

		if (item !== '?') {
			result.push({
				idx: idx,
				length: idx + item.length,
				data: item
			});
		}

		idx += item.length;
	}

	return {
		length: rule.length,
		data: result,
		dataLength: result.length
	};
}


function prepareRegexp (rule) {
	var starts;
	var ends;

	if (rule[0] === '*') {
		rule = rule.replace(/^\*+/, '');
		starts = true;
	}

	if (rule[rule.length - 1] === '*') {
		rule = rule.replace(/\*+$/, '');
		ends = true;
	}

	rule = rule
		.replace(/([\(\)\{\}\[\]\^\$\|\+.\\])/g, '\\$1')
		.replace(/\?+/g, function (matched) {
			return '.{' + matched.length + '}';
		})
		.replace(/\*+/g, '.{0,}?')
	;

	return {
		regexp: true,
		data: new RegExp((starts ? '' : '^') + rule + (ends ? '' : '$'))
	};
}


function filterActions (message, rules) {
	var result = [];
	var i = 0;
	var total = rules.length;

	for (; i < total; i++) {
		if (checkActions(message, rules[i])) {
			result[result.length] = rules[i].action;
		}
	}

	return result;
}


function checkActions (message, rule) {
	var passed = true;

	if (rule.from !== undefined) {
		passed = checkAction(message.from, rule.from);
	}

	if (passed && rule.to !== undefined) {
		passed = checkAction(message.to, rule.to);
	}

	return passed;
}


function checkAction (str, rule) {
	if (rule.dynamic) {
		return checkDynamicLength(str, rule);
	}

	if (rule.regexp) {
		return checkRegexp(str, rule.data);
	}

	return checkStrongLength(str, rule);
}


function checkDynamicLength (str, rule) {
	return str.substring(0, rule.startLength) === rule.start &&
		str.substring(str.length - rule.endLength, str.length) === rule.end;
}


function checkRegexp (str, rule) {
	return str.search(rule) !== -1;
}


function checkStrongLength (str, rule) {
	if (rule.length !== str.length) {
		return false;
	}

	if (rule.equal) {
		return str === rule.data;
	}

	return checkParts(str, rule);
}


function checkParts (str, rule) {
	var total = rule.dataLength;
	var item;
	var piece;

	while (total--) {
		item = rule.data[total];
		piece = str.substring(item.idx, item.length);

		if (item.data !== piece) {
			return false;
		}
	}

	return true;
}
