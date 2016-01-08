/**
 * Created by sirnornur on 12/20/2015.
 */




function match(pattern, str) {
	//console.log('fB pattern:'+pattern+' str:'+str);
	if(pattern.length==0) {
		return true;
	}
	var pattern_length = pattern.length;
	var str_length = str.length;

	var pat_i=0, str_i=0;
	while(true) {
		if(pat_i==pattern_length || str_i==str_length) {
			if(pat_i<pattern_length) {
				if(pattern[pat_i]=='*') {
					return ((pat_i+1)==pattern_length);
				}
				return false;
				// while (pattern[pat_i] == '*') {
				// 	pat_i++;
				// 	if (pat_i == pattern_length) return true;
				// }
			}

			return (pat_i==pattern_length && str_i==str_length);
		}
		//if(pattern[pat_i]==str[str_i]) {
		//if(((pat_i+1)==pattern_length) && ((str_i+1)==str_length)) return true;


		//} else
		if(pattern[pat_i]=='*') {
			// MATCHED! -- if * is the last char in the pattern
			pat_i++;
			if(pat_i == pattern_length) return true;
			var pat_next_char = pattern[pat_i];

			// while(pat_next_char=='*') {
			// 	pat_i++;
			// 	if(pat_i==pattern_length) return true;
			// 	pat_next_char = pattern[pat_i];
			// }
			var pattern_sub_str = pattern.substr(pat_i);
			while(str_i<str_length) {
				if(pat_next_char==str[str_i]||pat_next_char=='?') {
					if(match(pattern_sub_str, str.substr(str_i))) return true;
				}
				str_i++;
			}
			return false;
		//} else if() {
		} else if(pattern[pat_i] != str[str_i]) {
		 	if(pattern[pat_i] != '?') return false;
		}
		str_i++;
		pat_i++;
	}
}

var filter = function (messages, rules) {
	msg_keys = Object.keys(messages);
	var msg_keys_length = msg_keys.length;
	var rules_length = rules.length;
	var c_msg_key, c_msg, result = {}, c_rule;
	// var msg_i, rule_i;
	for(var rule_i=0; rule_i<rules_length; rule_i++) {
		c_rule = rules[rule_i];
		if(c_rule.from!=null) {
			while(c_rule.from.indexOf('**')!=-1) {
				c_rule.from = c_rule.from.replace('**', '*');
			}
			rules[rule_i].from = c_rule.from;
		}
		if(c_rule.to!=null) {
			while(c_rule.to.indexOf('**')!=-1) {
				c_rule.to = c_rule.to.replace('**', '*');
			}
			rules[rule_i].to = c_rule.to;
		}
	}

	for(var msg_i = 0; msg_i<msg_keys_length; msg_i++) {
		c_msg_key = msg_keys[msg_i];
		c_msg = messages[c_msg_key];
		result[c_msg_key] = [];
		for(var rule_i=0; rule_i<rules_length; rule_i++) {
			c_rule = rules[rule_i];
			if(c_rule.from!=null) {
				if(!match(c_rule.from, c_msg.from)) continue;
			}
			if(c_rule.to!=null) {
				if(!match(c_rule.to, c_msg.to)) continue;
			}
			result[c_msg_key].push(c_rule.action);
		}
	}
	return result;
};

module.exports = {filter: filter};