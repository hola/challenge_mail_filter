"use strict";
//everything is written in 1 function to minimize overhead of calling functions alot
module.exports = function(messages, rules) {
	var rules_len = rules.length, i, j;
	var result = Object.create(null);
	for(var message in messages) {
		var message_actions = [], from_field = messages[message].from, from_field_length = from_field.length, to_field = messages[message].to,
			to_field_length = to_field.length;
		for(i = 0;i < rules_len; i++) {
			var from_rule = rules[i].from || "*", from_rule_length = from_rule.length, to_rule = rules[i].to || "*", 
				to_rule_length = to_rule.length, from_match = true, to_match = true, k, l, p_pos, s_pos;
			if(from_rule != "*") {
				k = l = 0;
				s_pos = 0;
				p_pos = -1;
				while(k < from_field_length) {
					if(l < from_rule_length && from_rule[l] != "*" && (from_field[k] == from_rule[l] || from_rule[l] == "?") ) {
						k++;
						l++;
					}
					else if(l < from_rule_length && from_rule[l] == "*") {
						p_pos = l;
						s_pos = k;
						l++;
					}
					else if(p_pos >= 0) {
						k = s_pos + 1;
						s_pos++;
						l = p_pos;
					}
					else {
						from_match = false;
						break;
					}
				}

				while(l < from_rule_length && from_rule[l] == "*") {
					l++;
				}

				from_match = from_match && l == from_rule_length;
			}

			if(to_rule != "*") {
				k = l = 0;
				s_pos = 0;
				p_pos = -1;
				while(k < to_field_length) {
					if(l < to_rule_length && to_rule[l] != "*" && (to_field[k] == to_rule[l] || to_rule[l] == "?") ) {
						k++;
						l++;
					}
					else if(l < to_rule_length && to_rule[l] == "*") {
						p_pos = l;
						s_pos = k;
						l++;
					}
					else if(p_pos >= 0) {
						k = s_pos + 1;
						s_pos++;
						l = p_pos;
					}
					else {
						to_match = false;
						break;
					}
				}

				while(l < to_rule_length && to_rule[l] == "*") {
					l++;
				}

				to_match = to_match && l == to_rule_length;
			}

			if(from_match && to_match) {
				message_actions.push(rules[i].action);
			}
		}
		result[message] = message_actions;
	}
	return result;
}
