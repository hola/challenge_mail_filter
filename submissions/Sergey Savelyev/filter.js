// https://hola.org/challenge_mail_filter

exports.filter = function (messages, rules) {
	compileRules(rules);
	
	var temp = {
		from: {},
		to: {}
	};
	
	var from, to, fromTo, tempFrom, tempTo;
	
	for (prop in messages) {
		from = messages[prop].from;
		to = messages[prop].to;
		
		delete messages[prop].from;
		delete messages[prop].to;
		
		
		var fromTo = from + "\u00A6" + to;
		
		if (temp[fromTo] !== undefined) {
			messages[prop] = temp[fromTo];
			continue;
		}
		
		
		messages[prop] = [];
		
		
		tempFrom = temp.from[from];
		tempTo = temp.to[to];
		
		if (tempFrom !== undefined) {
			if (tempTo !== undefined) {
				for (var i = 0, tfLength = tempFrom.length; i < tfLength; i++) {
					for (var j = 0, ttLength = tempTo.length; j < ttLength; j++) {
						if (tempFrom[i] < tempTo[j]) {
							break;
						}
						else if (tempFrom[i] === tempTo[j]) {
							messages[prop].push(rules[tempFrom[i]].action);
							break;
						}
					}
				}
			}
			else {
				tempTo = [];
				
				for (var i = 0, rulesCount = rules.length, rTo, startFrom = 0; i < rulesCount; i++) {
					rTo = rules[i].to;
					
					if (rTo !== undefined && !rTo.test(to)) {
						continue;
					}
					
					tempTo.push(i);
					
					for (var j = startFrom, tfLength = tempFrom.length; j < tfLength; j++) {
						if (i === tempFrom[j]) {
							messages[prop].push(rules[i].action);
							startFrom = j + 1;
							break;
						}
						else if (i < tempFrom[j]) {
							break;
						}
					}
				}
				
				temp.to[to] = tempTo;
			}
		}
		else if (tempTo !== undefined) {
			tempFrom = [];
			
			for (var i = 0, rulesCount = rules.length, rFrom, startTo = 0; i < rulesCount; i++) {
				rFrom = rules[i].from;
				
				if (rFrom !== undefined && !rFrom.test(from)) {
					continue;
				}
				
				tempFrom.push(i);
				
				for (var j = startTo, ttLength = tempTo.length; j < ttLength; j++) {
					if (i === tempTo[j]) {
						messages[prop].push(rules[i].action);
						startTo = j + 1;
						break;
					}
					else if (i < tempTo[j]) {
						break;
					}
				}
			}
			
			temp.from[from] = tempFrom;
		}
		else {
			tempFrom = [];
			tempTo = [];
			
			for (var i = 0, rulesCount = rules.length, rFrom, rTo, fromOk, toOk; i < rulesCount; i++) {
				fromOk = false;
				toOk = false;
				
				rFrom = rules[i].from;
				
				if (rFrom === undefined || rFrom.test(from)) {
					tempFrom.push(i);
					fromOk = true;
				}
				
				rTo = rules[i].to;
				
				if (rTo === undefined || rTo.test(to)) {
					tempTo.push(i);
					toOk = true;
				}
				
				if (fromOk && toOk) {
					messages[prop].push(rules[i].action);
				}
			}
			
			temp.from[from] = tempFrom;
			temp.to[to] = tempTo;
		}
		
		temp[fromTo] = messages[prop];
	}
	
	return messages;
};

function compileRules (rules) {
	var replacements = [
		{ re: /\\/g, s: "\\\\" },
		{ re: /\./g, s: "\\." },
		{ re: /\?/g, s: "." },
		{ re: /\*/g, s: ".*?" },
		{ re: /\[/g, s: "\\[" },
		{ re: /\^/g, s: "\\^" },
		{ re: /\$/g, s: "\\$" },
		{ re: /\(/g, s: "\\(" },
		{ re: /\)/g, s: "\\)" },
		{ re: /\+/g, s: "\\+" },
		{ re: /\|/g, s: "\\|" },
		{ re: /\{/g, s: "\\{" },
		{ re: /\}/g, s: "\\}" }
	];
	var replCount = replacements.length;

	for (var i = 0, rCount = rules.length, from, to; i < rCount; i++) {
		from = rules[i].from;
		
		if (from !== undefined) {
			for (var j = 0; j < replCount; j++) {
				from = from.replace(replacements[j].re, replacements[j].s);
			}
			
			rules[i].from = new RegExp("^" + from + "$");
		}
		
		to = rules[i].to;
		
		if (to !== undefined) {
			for (var j = 0; j < replCount; j++) {
				to = to.replace(replacements[j].re, replacements[j].s);
			}
			
			rules[i].to = new RegExp("^" + to + "$");
		}
	}
}