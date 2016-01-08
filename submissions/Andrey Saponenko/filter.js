module.exports = {
	filter: function (messages, _rules) {
		var rl, m, i, t, l,
			maskReplace = [
				[/\./g, '\\.'],
				[/\*/g, '.*'],
				[/\?/g, '.{1}']
			],
			maskCache = [],
			res = {},
			msgDict = {},
			fromRulesMap = {},
			toRulesMap = {},
			anyRule = [],
			rules = _rules.map(function (r, i) {
				rt = Object.assign({
					i
				}, r)
				if (r.from) {
					rt.f = mask(r.from)
					dict(r.from, rt, fromRulesMap)
				}
				if (r.to) {
					rt.t = mask(r.to)
					dict(r.to, rt, toRulesMap)
				}
				if (!r.from && !r.to)
					anyRule.push(rt)
				return rt
			})
		anyRule = anyRule
			.concat(fromRulesMap['*'] || [], toRulesMap['*'] || [])
		for (i in messages) {
			m = messages[i]
			l = m.from[0]
			t = m.to[0]
			rl = msgDict[l + t]
			if (!rl)
				msgDict[l + t] = rl = anyRule
				.concat(fromRulesMap[l] || [], toRulesMap[t] || [])
				.filter((v, i, a) => a.indexOf(v) === i)
				.sort((a, b) => a.i < b.i ? -1 : a.i > b.i ? 1 : 0)
			res[i] = (rl || rules).reduce(function (r, c) {
				if (!c.from && !c.to)
					t = 1
				else if (c.from && !c.to) {
					c.f.lastIndex = 0
					t = c.f.test(m.from)
				} else if (!c.from && c.to) {
					c.t.lastIndex = 0
					t = c.t.test(m.to)
				} else {
					c.f.lastIndex = c.t.lastIndex = 0
					t = c.f.test(m.from) && c.t.test(m.to)
				}
				if (t)
					r.push(c.action)
				return r
			}, [])

		}
		return res

		function dict(text, rule, map) {
			var l, e
			if (!text)
				return
			l = letter(text)
			if (l === false)
				return
			if (e = map[l])
				return e.push(rule)
			return map[l] = [rule]
		}

		function letter(text) {
			var l = text[0],
				c = text.charCodeAt(0)
			if ((c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A))
				return l
			else if (c === 0x2A || c === 0x3F)
				return '*'
			return false
		}

		function mask(m) {
			return maskCache[m] || (maskCache[m] = new RegExp('^' + maskReplace.reduce((r, c) => r.replace(...c), m) + '$', 'g'))
		}
	}
}