/// Author: Aleksey Sergey

'use strict';

function MatchEverything() {
	return true;
}

// takes a pattern with '*' and '?' chars and returns
// a function that results into 'true' if input string
// matches pattern; false otherwise
function generateMatchFunction(pattern) {
	if (pattern === undefined || /^[*]+$/.test(pattern)) return MatchEverything;
	
	var hasStar = /[*]/.test(pattern);
	var hasQuestion = /[?]/.test(pattern);
	if (hasStar || hasQuestion) {
		// construct and use regex!
		var orig_length = pattern.length;
		pattern = pattern
			.replace(/[^a-zA-Z0-9?*]/g, '\\$&') // escape non-{leter, digit, '?', '*'} chars
			.replace(/\?/g, '.')
			.replace(/\*+/g, '.*?');
		
		pattern = ['^', pattern, '$'].join('');
		var regex = new RegExp(pattern);

		// apply additional input.length test if pattern doesn't contain '*' char
		return hasStar
			? (input) => regex.test(input)
			: (input) => (input.length === orig_length) && regex.test(input);
	}

	// use direct string comparison if pattern doesn't contain '*' or '?'
	return (input) => (input === pattern);
}

function buildCache(messages, rules) {
	// generates Map with the followig contents:
	// uniqEmail -> { rules_id_that_satisfy_from: [], rules_id_that_satisfy_to: [] }

	// such scheme allows to quickly find rules_id for each particular message
	// by computing intersections between corresponding arrays.

	var cache = new Map();

	var addEmail = (address) => {
		var rules_from = [];
		var rules_to = [];

		for (var j = 0, rules_length = rules.length; j < rules_length; j += 1) {
			var rule = rules[j];

			// note: rules_from and rules_to grow up in sorted arrays!!!
			if (rule.match_from(address)) rules_from.push(j);
			if (rule.match_to(address)) rules_to.push(j);
		}

		cache.set(address, {
			rules_from: Int32Array.from(rules_from),
			rules_to: Int32Array.from(rules_to)
		});
	}

	for (var i = 0, len = messages.length; i < len; i += 1) {
		var message = messages[i];
		if (!cache.has(message.from)) {
			addEmail(message.from);
		}
		if (!cache.has(message.to)) {
			addEmail(message.to);
		}
	}

	return cache;
}

function filter(messages, rules) {
	// let's use original 'messages' object for storing results
	var result = messages;
	var result_keys = Object.keys(result);

	// I assume that amount of uniq emails should be significantly
	// smaller then total amount of messages
	// So the main idea is to test rules matching only on UNIQ addresses

	// If the assumption above is false, this solution is DOOMED!

	// optimize rules by generating match_from and match_to functions
	for (var i = 0, len = rules.length; i < len; i += 1) {
		var rule = rules[i];

		rules[i] = {
			match_from: generateMatchFunction(rule.from),
			match_to: generateMatchFunction(rule.to),
			action: rule.action
		};
	}

	// // build uniq-addresses cache and populate results
	var messages = arrayMap(result_keys, key => result[key]);
	var cache = buildCache(messages, rules);
	for (var i = 0, len = result_keys.length; i < len; i += 1) {
		var key = result_keys[i];
		var message = messages[i];

		var arr_1 = cache.get(message.from).rules_from;
		var arr_2 = cache.get(message.to).rules_to;

		var actions = [];

		// intersection betwen arr_1 and arr_2 will result into rules id's
		// arrays arr_1 and arr_2 are sorted and contain actions in correct order
		var len_arr_1 = arr_1.length | 0;
		var len_arr_2 = arr_2.length | 0;

		var j = 0 | 0;
		var k = 0 | 0;

		while ((j < len_arr_1) && (k < len_arr_2)) {
			var x = arr_1[j] | 0;
			var y = arr_2[k] | 0;

			if (x > y) { k += 1; }
			else if (x < y) { j += 1; }
			else {
				k += 1;
				j += 1;

				actions.push(rules[x].action);
			}
		}

		result[key] = actions;
	}

	return result;
}

function arrayMap(source, transform) {
	var source_length = source.length;
	var result = new Array(source_length);
	for (var i = 0; i < source_length; i += 1) {
		result[i] = transform(source[i]);
	}
	return result;
}

module.exports.filter = filter;