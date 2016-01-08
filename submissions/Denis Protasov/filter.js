// protasov.de@gmail.com

function filterBuilder() {
	"use strict";

	var isMatch = function(data, pattern) {
			var data_index = 0;
			var pattern_index = 0;
			var starIndex = -1;
			var iIndex = -1;
			var a = 0;
		
			while (data_index < data.length) {
				if (pattern_index < pattern.length && (pattern[pattern_index] == '?' || pattern[pattern_index] == data[data_index])) {
					++data_index;
					++pattern_index;
				} else if (pattern_index < pattern.length && pattern[pattern_index] == '*') {
					starIndex = pattern_index++;
					iIndex = data_index;

					if(pattern_index == pattern.length)
						return true;
				} else if (starIndex != -1) {
					pattern_index = starIndex + 1;
					data_index = ++iIndex;
				} else {
					return false;
				}
		
				a++;
			}
		
			while (pattern_index < pattern.length && pattern[pattern_index] == '*') {
				++pattern_index;
			}
		
			return pattern_index == pattern.length;
		},
		ruleApply = function(rule, value) {
			if(!rule || rule == '*') {
				return true;
			} else {
				return isMatch(value, rule);
			}
		};

	this.filter = function(messages, rules) {
		var result = {},
			rLength = rules.length,
			i, msgId;

		for(msgId in messages) {
			result[msgId] = [];
			for(i = 0; i<rLength ; i++) {
				if( ruleApply(rules[i]['from'], messages[msgId]['from']) && ruleApply(rules[i]['to'], messages[msgId]['to']) )
					result[msgId].push( rules[i].action );
			}
		}

		return result;
	}

}

var filterHandle = new filterBuilder();

exports.filter = filterHandle.filter;