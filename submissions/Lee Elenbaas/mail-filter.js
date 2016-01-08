'use strict';

module.exports = filter;

function filter(messages, rules) {
	var result = {};

	rules = prepareRules(rules);

	// object iteration
	for (var messageName in messages)
		result[messageName] = applyRules(messages[messageName], rules);

	return result;
}

function prepareRules(rules) {
	// array map
	return rules.map(rule => ({
		from: makeRuleCondition(rule.from),
		to: makeRuleCondition(rule.to),
		action: rule.action
	}));
}

var nullMatch = {
	test: () => true
};

// using multiple regExp turned out to be faster then using other methods to classify pattern type
var nullMatchRegExp = /^\**$/;
var exactMatchRegExp = /^[^\?\*]+$/;
var endsWithRegExp = /^\*+[^\*]+$/;
var startsWithRegExp = /^[^\*]+\*+$/;
var containsRegExp = /^\*+[^\?\*]+\*+$/;

function makeRuleCondition(pattern) {
	// null match pattern
	if (!pattern || nullMatchRegExp.test(pattern)) // no pattern
		return nullMatch;

	// exact match
	if (exactMatchRegExp.test(pattern))
		return {
			test: (text) => text === pattern
		};

	// starts with match
	if (startsWithRegExp.test(pattern)) {
		pattern = pattern.replace(/\**/,'');
		var patternLen = pattern.length;

		return {
			test: (text) => {
				var textLen = text.length;

				if (textLen < patternLen)
					return false;

				for(var i = 0; i < patternLen; ++i) {
					var patternChar = pattern.charAt(i);

					if (patternChar === '?')
						continue;

					if (patternChar !== text.charAt(i))
						return false;
				}

				return true;
			}
		};
	}

	// ends with match
	if (endsWithRegExp.test(pattern)) {
		pattern = pattern.replace(/\**/,'');
		var patternLen = pattern.length;

		return {
			test: (text) => {
				var textLen = text.length;

				if (textLen < patternLen)
					return false;

				for(var pi = patternLen, ti = textLen; pi-- > 0 && ti-- > 0;) {
					var patternChar = pattern.charAt(pi);

					if (patternChar === '?')
						continue;

					if (patternChar !== text.charAt(ti))
						return false;
				}

				return true;
			}
		};
	}

	// contains match // TODO: double check timing results for this case - they where not clear enough
	if (containsRegExp.test(pattern)) {
		pattern = pattern.replace(/\*/g,'');
		var patternLen = pattern.length;

		return {
			test: (text) => (text.length >= patternLen) && (text.indexOf(pattern) !== -1)
		};
	}

	// complex pattern
	var regex = pattern
		.replace(/[\.\\\\!\[\]\{\}\(\)]/g, '\\$&') // escape regex special characters
		.replace("*", ".*") // convert * to regex
		.replace("?", "."); // convert ? to regex

	return new RegExp('^' + regex + '$');
}

function applyRules(message, rules) {
	var actions = [];

	// Array iteration
	var rulesCount = rules.length;
	for(var i = 0; i<rulesCount; ++i) {
		var rule = rules[i];

		if (rule.from.test(message.from) && rule.to.test(message.to))
			actions.push(rule.action);
	}

	return actions;
}
