exports.filter = function(messages, rules) {
	var rulesLength = rules.length;
	for (var i = 0; i < rulesLength; i++) {
		rules[i].to = analyzeRule(rules[i].to);
		rules[i].from = analyzeRule(rules[i].from);
	}
	var filtered = {};
	var messageKeys = Object.keys(messages);
	for (var j = messageKeys.length - 1; j > -1; j--) {
		var key = messageKeys[j];
		var from = messages[key].from;
		var to = messages[key].to;
		var result = [];
		var ruleCounter = 0;
		for (i = 0; i < rulesLength; i++) {
			var rule = rules[i];
			var ruleFrom = rule.from;
			var ruleTo = rule.to;
			var fromOk = ruleFrom.autoFit || parse(ruleFrom.regexp, from);
			if (fromOk && (ruleTo.autoFit || parse(ruleTo.regexp, to))) {
				result[ruleCounter++] = rule.action;
			}
		}
		filtered[key] = result;
	}
	return filtered;
};

function analyzeRule(rule) {
	var result = {autoFit: false};
	if (!rule || rule === '*') {
		result.autoFit = true;
	} else {
		result.regexp = prepareRuleInfo(rule);
	}
	return result;
}

function parse(ruleInfo, address) {
	var lengthDiff = address.length - ruleInfo.stringLength;
	if (lengthDiff === 0 || (lengthDiff > 0 && ruleInfo.longer)) {
		return parseString(ruleInfo.split, address);
	}
	return false;
}

function parseString(splitRegexp, address, startIndex) {
	var wasWild = false;
	var wasAny = false;
	var ok = true;
	var storedIndex = 0;
	var i = 0;
	var spareIndex;

	var addressLength = address.length;
	var splitLength = splitRegexp.length;

	if (startIndex) {
		wasWild = true;
		i = startIndex.i;
		storedIndex = startIndex.index;
	}
	for (i; i < splitLength; i++) {
		var sub = splitRegexp[i];
		if (sub === '*') {
			wasWild = true;
			wasAny = false;
		} else {
			if (sub === '?') {
				wasAny = wasWild || wasAny;
				storedIndex++;
			} else {
				var indexOf = address.indexOf(sub, storedIndex);
				if ((wasWild || wasAny) && indexOf > -1) {
					var spare = !spareIndex ? address.indexOf(sub, indexOf + 1) : -1;

					if (spare > -1) {
						spareIndex = {i: i, index: spare};
					}
					storedIndex = sub.length + indexOf;
				} else {
					if (indexOf === storedIndex) {
						storedIndex += sub.length;
					} else {
						ok = false;
						break;
					}
				}
				wasAny = false;
			}
			wasWild = false
		}

		if (storedIndex > addressLength) {
			ok = false;
			break;
		}
	}
	var result = ok && (wasWild || wasAny || storedIndex === addressLength);
	if (!!spareIndex && !result) {
		return parseString(splitRegexp, address, spareIndex)
	}
	return result;
}

function prepareRuleInfo(rule) {
	var split = [];
	var buff = '';
	var length = 0;
	var longer = false;
	var wasWild = false;
	var splitCounter = 0;
	var regLength = rule.length;

	function flushBuff() {
		if (buff) {
			split[splitCounter++] = buff;
			buff = '';
		}
	}

	for (var i = 0; i < regLength; i++) {
		var char = rule.charAt(i);
		if (char === '*') {
			longer = true;
			flushBuff();
			if (!wasWild) {
				split[splitCounter++] = char;
			}
			wasWild = true;
		} else {
			if (char === '?') {
				flushBuff();
				split[splitCounter++] = char;
			} else {
				buff += char;
			}
			wasWild = false;
			length++;
		}
	}

	if (buff) {
		split[splitCounter++] = buff;
	}

	return {
		stringLength: length,
		longer: longer,
		split: split
	};
}
