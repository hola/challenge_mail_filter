module.exports.filter = filter;

function filter(messages, rules) {

	// Convert filters to regular expressions
	var filters = [];
	for (var i = 0; i < rules.length; i++) {
		var rule = rules[i];

		var filter = {action: rule.action};

		if (rule.from)
			filter.from = getRegExp(rule.from);

		if (rule.to)
			filter.to = getRegExp(rule.to);

		filters.push(filter);
	}

	var result = {};

	for (var key in messages) {
		if (!messages.hasOwnProperty(key))
			continue;

		var message = messages[key];

		result[key] = [];
		for (var j = 0; j < filters.length; j++) {
			filter = filters[j];

			if (filter.from && !filter.from.test(message.from))
				continue;
			if (filter.to && !filter.to.test(message.to))
				continue;

			result[key].push(filter.action);
		}
	}

	return result;
}

// This function translate rule to regular expression
function getRegExp(filterString) {
	// Escape backslashes: *john@exam\ple.??? -> *john@exam\\ple.???
	filterString = filterString.replace(/\\/g, '\\\\');

	// Escape dots: *john@example.??? -> *john@example\.???
	filterString = filterString.replace(/\./g, '\\.');

	// Replace ? with dot: *john@example\....
	filterString = filterString.replace(/\?/g, '.');

	// *john@example\.... -> *john@example\....
	if (filterString.charAt(0) !== '*')
		filterString = '^' + filterString;

	// *john@example\.... -> *john@example\....*$
	if (filterString.charAt(filterString.length - 1) !== '*')
		filterString += '$';
	
	// Remove * from start and end: *john@example\....*$ -> john@example\....$
	filterString = filterString.replace(/(^\*|\*$)/g, '');
	// Replace '*' with '.*' in middle of filter: someone*who@mail.net -> someone.*who@mail.net
	filterString = filterString.replace(/\*/g, '.*');

	return new RegExp(filterString);
}