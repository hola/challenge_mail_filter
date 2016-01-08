'use strict';

function processRule(rule) {
	rule = rule.replace(/([^\*\?\w])+/g, function (m) { return '\\'+m;});
	rule = rule.replace(/\*/, '.*');
	return rule.replace(/\?/, '.');
}

module.exports = function filter(messages, rules) {
	for (var i in rules) {
		if (typeof rules[i].from == 'undefined') {
			rules[i].from = "*";
		}

		if (typeof rules[i].to == 'undefined') {
			rules[i].to = "*";
		}

		rules[i].filter = new RegExp('^'+processRule(rules[i].from) + '\\|' + processRule(rules[i].to) + '$');
	}

	var result = {};
	var actions = [];
	var row;
	var test;

	for (var key in messages) {
		actions = [];
		row = messages[key].from+'|'+messages[key].to;
		for (i in rules) {
			test = rules[i].filter.test(row);

			if (test) {
				actions.push(rules[i].action);
			}
		}

		result[key] = actions;
	}

	return result;
}
