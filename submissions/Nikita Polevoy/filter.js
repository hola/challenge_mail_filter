module.exports = function(messages, rules) {
	var result = {}, s = new RegExp('\\*','g'), q = new RegExp('\\?','g'), rs = '[\x20-\x7F]*', rq = '[\x20-\x7F]{1}';
	for (var r in rules) {
		var from, to, re_from, re_to;
		r = rules[r];
		if (r.from) {
			from = [];
			if (r.from.indexOf('*') != -1 || r.from.indexOf('?') != -1)
				re_from = new RegExp('^' + r.from.replace(s,rs).replace(q,rq) + '$');
		};
		if (r.to) {
			to = [];
			if (r.to.indexOf('*') != -1 || r.to.indexOf('?') != -1)
				re_to = new RegExp('^' + r.to.replace(s,rs).replace(q,rq) + '$');
		};
		for (var m in messages) {
			var i = m;
			if (!result[i]) result[i] = [];
			m = messages[i];
			if (from && from.indexOf(m.from) == -1)
				if (!(re_from && re_from.test(m.from) || m.from === r.from)) continue;
			if (to && to.indexOf(m.to) == -1)
				if (!(re_to && re_to.test(m.to) || m.to === r.to)) continue;
			result[i].push(r.action);
			if (from) from.push(m.from);
			if (to) to.push(m.to);
		};
		from = to = re_from = re_to = null;
	};
	return result;
};
