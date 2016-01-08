exports.filter = function (messages, rules) {
	var r = {}, msgs = Object.keys(messages), compiled = compileRules(rules);
	for (var i = 0, len = msgs.length, cache = {}, cacheFrom = {}, compLen = compiled.length; i < len; ++i) {
		var msg = msgs[i];
		var message = messages[msg];
		var ident = [message.from, message.to].join('|');
		var actions = cache[ident];

		if (!actions) {
			var rulesFrom = cacheFrom[message.from];
			if (rulesFrom)
				actions = testRulesTo(rules, rulesFrom, message.to, compiled);
			else
				actions = testRules(rules, cacheFrom, message.from, message.to, compiled, compLen);
			cache[ident] = actions;
		}
		r[msg] = actions;
	}
	return r;
}

function testRulesTo(rules, rulesFrom, to, compiled) {
	var r = [];
	for (var j = 0, cacheLen = rulesFrom.length; j < cacheLen; ++j) {
		var index = rulesFrom[j];
		var rule = rules[index];
		if (testRule(to, rule.to, compiled[index + index + 1])) {
			r.push(rule.action);
		}
	}
	return r;
}

function testRules(rules, cacheFrom, from, to, compiled, compLen) {
	var r = [], rulesFrom = [];
	for (var j = 0, j2 = 0; j2 < compLen; ++j, j2 += 2) {
		var rule = rules[j];
		if (testRule(from, rule.from, compiled[j2])) {
			rulesFrom.push(j);
			if (testRule(to, rule.to, compiled[j2 + 1])) {
				r.push(rule.action);
			}
		}
	}
	cacheFrom[from] = rulesFrom;
	return r;
}

function testRule(str, pattern, cards) {
	return (!pattern) || cards && match(str, cards) || str === pattern;
}

function compileRules(rules) {
	var len = rules.length;
	var len2 = len + len;
	var r = new Array(len2);
	for (var i = 0, ic = 0; i < len; ++i) {
		var rule = rules[i];
		var str = rule.from;
		if (str == '*') {
			rule.from = null;
			r[ic] = null;
		}
		else {
			r[ic] = compile(str);
		}
		ic++;
		str = rule.to;
		if (str == '*') {
			rule.to = null;
			r[ic] = null;
		}
		else {
			r[ic] = compile(str);
		}
		ic++;
	}

	return r;
}

function compile(pattern) {
	if (!pattern)
		return null;
	var len = pattern.length;
	if (len == 0 || !isPattern(pattern, len))
		return null;

	return genCards(pattern, len);
}

function genCards(pattern, len) {
	var r = [];

	i = 0;
	while (pattern[i] == '*' && i < len)
		i++;

	if (i > 0)
		r.push('');

	var isInCard = true, cardStart = i;
	for (; i < len; i++) {
		if (pattern[i] == '*') {
			if (isInCard) {
				r.push(pattern.substr(cardStart, i - cardStart));
				isInCard = false;
			}
		} else if (!isInCard) {
			isInCard = true;
			cardStart = i;
		}
	}
	if (!isInCard)
		r.push('');
	else if (i - cardStart > 0)
		r.push(pattern.substr(cardStart, i - cardStart));

	return r;
}

function isPattern(pattern, len) {
	for (var i = 0; i < len; i++) {
		var c = pattern[i];
		if (c == '?' || c == '*')
			return true;
	}
	return false;
}

function match(str, cards) {
	var count = cards.length;
	var card0 = cards[0];
	var lb = card0.length;
	var len = str.length;

	if (count == 1)
		return ((lb == 0) || (len == lb && matchCard(str, card0, 0, lb)));

	var bound = count - 1;
	var cardN = cards[bound];
	var cardNlen = cardN.length;
	var cardNstart = len - cardNlen;
	var rb = cardNstart - 1;

	if (lb > cardNstart
		|| !matchCard(str, card0, 0, lb)
		|| !matchCard(str, cardN, cardNstart, cardNlen))
		return false;
	else if (count == 2)
		return true;

	return matchDeep(str, cards, bound, lb, rb);
}

function matchDeep(str, cards, bound, lb, rb) {
	for (var i = 1; i < bound; i++) {
		lb = searchForCard(str, cards[i], lb, rb);
		if (lb < 0)
			return false;
	}
	return true;
}

function matchCard(str, card, pos, len) {
	for (var i = 0; i < len; i++, pos++) {
		var c = card[i];
		if (c != '?' && str[pos] != c)
			return false;
	}
	return true;
}

function searchForCard(str, card, lb, rb) {
	var len = card.length;
	rb -= len - 1;
	for (; lb <= rb; lb++)
		if (matchCard(str, card, lb, len))
			return lb + len;
	return -1;
}