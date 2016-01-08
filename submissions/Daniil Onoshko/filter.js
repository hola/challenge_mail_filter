
function test(pattern, string, pattern_start_index, string_start_index) {

	for (
		var pattern_index = pattern_start_index, 
			string_index = string_start_index, 
			
			pattern_len = pattern.length, 
			string_len = string.length, 

			pattern_last_index = pattern_len - 1, 
			pattern_char = pattern[pattern_index]; 

		pattern_index < pattern_len; 

		++string_index, ++pattern_index
	) {

		if ((pattern_char = pattern[pattern_index]) == "*") {

			if (pattern_index++ == pattern_last_index) {
				return true;
			}

			do {

				if (test(pattern, string, pattern_index, string_index++)) {
					return true;
				}

			} while (string_index < string_len)

			return false;
		} else {

			if (string_index == string_len || pattern_char != "?" && pattern_char != string[string_index]) {
				return false;
			}
		}
	}

	return pattern_len == pattern_index && string_len == string_index;
}

module.exports = 
function filter(messages, rules) {

	var ruleslen = rules.length, index = ruleslen,
		rule,
		from, to,
		_from, _to,
		message, tags = [];

	for (var id in messages) {

		message = messages[id];
		from    = message.from;
		to      = message.to;

		while (index--) {
			
			rule = rules[index];
			_from = rule.from;
			_to = rule.to; 

			if ((typeof _from == "undefined" || test(_from, from, 0, 0)) && (typeof _to == "undefined" || test(_to, to, 0, 0))) {
				tags.unshift(rule.action);
			}
		}

		index = ruleslen;
		messages[id] = tags;
		tags = [];
	}

	return messages;
}