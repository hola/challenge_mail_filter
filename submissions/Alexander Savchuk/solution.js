"use strict";
function filter(messages, rules) {
	var messageIdToActionsMap = {}, ruleLength = rules.length, ruleRegexps = [];
	var keys = Object.keys(messages);
	var froms = "";	
	var fromStarts = {};
	var prevFroms = 0;

	var tos = "";	
	var toStarts = {};
	var reverseToStarts = [];
	var prevTo = 0;
	var messageLength = keys.length;
	for (let j = 0; j < messageLength; j++) {
		var index = keys[j];
		messageIdToActionsMap[index] = [];
		var message = messages[index];
		fromStarts[prevFroms] = j;
		prevFroms += message.from.length + 2;
		froms += "Ж" + message.from + "Ж";

		toStarts[prevTo] = j;
		reverseToStarts.push(prevTo);
		prevTo += message.to.length + 2;		
		tos += "Ж" + message.to + "Ж";
	}
			
	for (let i = 0; i < ruleLength; i++) {
		var fromRegexp = rules[i].from == null
					? /Ж[^Ж]*Ж/g
					: new RegExp("Ж" + rules[i].from
							.replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&')
							.replace(/\?/g, "[^Ж]")
							.replace(/\*+/g, "[^Ж]*") + "Ж", "g");
        var toRegexp = rules[i].to == null
					? /Ж[^Ж]*Ж/g
					: new RegExp("Ж" + rules[i].to
							.replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&')
							.replace(/\?/g, "[^Ж]")
							.replace(/\*+/g, "[^Ж]*") + "Ж", "g");

		var flags = {};
		var minIndex = null;
		var maxIndex = null;

		var result = fromRegexp.exec(froms);
		if (result) {
			var k = fromStarts[result.index];
			flags[k] = true;
			maxIndex = k;
			minIndex = k;
		}

		while (result = fromRegexp.exec(froms)) {		  									
			k = fromStarts[result.index];
			flags[k] = true;
			maxIndex = k;
		}	
		if (minIndex == null) {
			continue;
		}
		toRegexp.lastIndex = reverseToStarts[minIndex];
		var indexInTos = reverseToStarts[maxIndex];
		var slicedTo = tos.slice(0, indexInTos + messages[keys[maxIndex]].to.length + 2);
		var action = rules[i].action;		
		while (result = toRegexp.exec(slicedTo)) {
			var flagIndex = toStarts[result.index];
		  	if (flags[flagIndex]) {		  		
		  		messageIdToActionsMap[keys[flagIndex]].push(action)
		  	}					  	
		}					
	}	
	return messageIdToActionsMap;
}

//noinspection JSUnresolvedVariable
module.exports = filter;
