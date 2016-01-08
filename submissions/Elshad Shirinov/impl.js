function generateStartsWithTest(pattern, prefix, start) {
	var l = pattern.length;

	if (!start) {
		return 'value.substring(0, ' + l + ') !== "' + pattern + '"';
	}

	return '!value.startsWith("' + pattern + '", ' + prefix + start + ')';
}

function compile(pattern) {
	// Naive implementation 
	// var regex = RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
	// return regex.test.bind(regex);

	var length = pattern.length;

	var code = '';
	var begin = 0;
	var end = begin;

	var c = pattern.charAt(end);
	while (end < length && (c !== '?') && (c !== '*')) {
		c = pattern.charAt(++end);
	}

	if (end >= length) {
		return function(value) { return pattern === value; };
	}

	var sinceLastPos = end - begin;
	if (begin < end) {
		code += '\tif (' + generateStartsWithTest(pattern.slice(begin, end)) + ') { return false; }\n';
		begin = end;
	}

	var starPresent = false;
	var questionMarkPresent = false;
	var havePos = false;

	while (end < length) {
		starPresent = false;
		questionMarkPresent = false;

		while (end < length && (c === '?' || c === '*')) {
			if (c === '?') {
				questionMarkPresent = true;
				sinceLastPos++;
			}
			if (c === '*') { starPresent = true; }
			c = pattern.charAt(++end);
		};

		begin = end;
		if (end >= length) { break; }

		while (end < length && c !== '?' && c !== '*') {
			c = pattern.charAt(++end);
		}

		if (end >= length) { break; }

		if (starPresent) {
			code += havePos ? '\t' : '\tvar ';
			code += 'pos = value.indexOf("' + pattern.slice(begin, end) + '", ' + (havePos ? 'pos + ' : '') + sinceLastPos + ')\n';
			code += '\tif (pos < 0) { return false; }\n';

			havePos = true;
			sinceLastPos = 0;
		} else {
			var pre = (havePos ? 'pos + ' : '');
			code += '\tif (' + generateStartsWithTest(pattern.slice(begin, end), pre, sinceLastPos) + ') { return false; }\n';
		}
		sinceLastPos += end - begin;
	};

	code += '\treturn';
	if (questionMarkPresent) {
		code += ' (value.length ' + (starPresent ? '>=' : '===') + (havePos ? ' pos + ' : ' ') + (sinceLastPos + end - begin) + ')';

		if (begin < end) {
			code += ' && value.endsWith("' + pattern.slice(begin, end) + '")';
		}

		code += ';\n'
	} else if (begin < end) {
		code += ' value.endsWith("' + pattern.slice(begin, end) + '");\n';
	} else {
		code += ' true;\n';
	}

	// console.log('"' + pattern + '" ->\n' + code);

	return new Function('value', code);
}

module.exports = function filter(messages, rules) {
	var currentArray = 0;

	var result = messages;

	var rulesCount = rules.length;

	for (var i = 0; i < rulesCount; i++) {
		var rule = rules[i];
		rule.fromTest = compile(rule.from || '*');
		rule.toTest = compile(rule.to || '*');
	}

	for (var key in messages) {
		var message = messages[key];

		var res = [];

		var count = 0;
		for (var i = 0; i < rulesCount; i++) {
			var rule = rules[i];
			if (rule.fromTest(message.from) && rule.toTest(message.to)) {
				res[count++] = rule.action;
			}
		}
		res.length = count;

		result[key] = res;
	}

	return result;
}
