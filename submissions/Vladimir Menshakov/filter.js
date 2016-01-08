'use strict'

var Node = function() {
	this.next = new Map()
}

var Aho = function() {
	if (!(this instanceof Aho))
		return new Aho()

	this.root = new Node()
	this.patterns = []
}

Aho.prototype.add = function(pattern) {
	var node = this.root
	var n = pattern.length
	if (!n)
		throw 'empty strings are not allowed'

	for(var i = 0; i < n; ++i) {
		var code = pattern.charCodeAt(i)
		var nextNode = node.next.get(code)
		if (nextNode === undefined) {
			nextNode = new Node()
			node.next.set(code, nextNode)
		}
		node = nextNode
	}
	if (node.patternIndex)
		return node.patternIndex

	var p = this.patterns.length
	this.patterns.push(pattern)
	node.patternIndex = p
	return p
}

Aho.prototype.build_fail = function() {
	var root = this.root

	var queue = []
	root.next.forEach(function(node) {
		node.fail = root
		queue.push(node)
	})

	while(queue.length) {
		var node = queue.shift()
		node.next.forEach(function(next, code) {
			queue.push(next)

			var fail = node.fail
			while (fail !== root && fail.next.get(code) === undefined)
				fail = fail.fail

			var newFail = fail.next.get(code)
			if (newFail === undefined && fail === root)
				newFail = root
			next.fail = newFail
		})
	}
}

Aho.prototype.search = function(text, callback)
{
	var root = this.root
	var node = root
	var n = text.length

	for(var i = 0; i < n; ++i) {
		var code = text.charCodeAt(i)
		while(node !== root && node.next.get(code) === undefined)
			node = node.fail

		node = node.next.get(code)
		if (node === undefined)
			node = root

		for(var fail = node; fail !== root; fail = fail.fail) {
			var patternIndex = fail.patternIndex
			if (patternIndex !== undefined) {
				var pattern = this.patterns[patternIndex]
				callback(pattern, patternIndex, 1 + i - pattern.length)
			}
		}
	}
}

var pattern2regexp = function(pattern) {
	var reStr =
		'^' + pattern
			// TODO check what symbols can actually be in email
			.replace(/([.\)\(\]\[\+])/g, '\\$1')
			.replace(/\*/g, '.*')
			.replace(/\?/g, '.') +
		'$';
	return new RegExp(reStr, "");
}

function filter_aho(messages, rules) {

	function add(aho, wordMap, rule, re) {
		//console.log('splitting re', re)
		var words = re.split(/[\\?\\*]/)
		var longestWord = ''
		for(var i = 0; i < words.length; ++i) {
			var word = words[i]
			if (word.length > longestWord.length)
				longestWord = word
		}

		var word = longestWord
		//console.log('adding word', word, 'from rule', '#' + rule)
		if (word.length)
			aho.add(word)

		if (wordMap.has(word))
			wordMap.get(word).add(rule)
		else
			wordMap.set(word, new Set([rule]))
		//console.log(wordMap)
		return pattern2regexp(re)
	}

	function match(rulesList, aho, map, str) {
		var rules = new Set()

		if (!str)
			return rules

		//console.log(map)
		aho.search(str, function(word, data, offset) {
			var match = map.get(word)
			if (match !== undefined)
				match.forEach(function(ruleIndex) {
					rules.add(ruleIndex)
				})
		})
		if (map.has('')) {
			var any = map.get('')
			any.forEach(function(ruleIndex) {
				rules.add(ruleIndex)
			})
		}

		return rules
	}

	function matchRule(re, str) {
		var m = str.match(re)
		//console.log(re, str, m)
		return Boolean(m)
	}

	//console.log(messages, rules)

	var searcher = new Aho()
	var fromMap = new Map(), toMap = new Map()
	var results = {}

	rules = rules.map(function(rule, index) {
		var r = Object.create(null)
		if (rule.from)
			r.from = add(searcher, fromMap, index, rule.from)
		if (rule.to)
			r.to = add(searcher, toMap, index, rule.to)
		r.action = rule.action
		return r
	})
	searcher.build_fail()

	for(var id in messages) {
		var actions = []
		var msg = messages[id]

		var fromRules = match(rules, searcher, fromMap, msg.from)
		var toRules = match(rules, searcher, toMap, msg.to)

		//console.log('from', fromRules)
		//console.log('to', toRules)
		var matchList = []
		fromRules.forEach(function(ruleIndex) {
			var rule = rules[ruleIndex]
			if (rule.to && !toRules.has(ruleIndex)) //'to' does not match
				return

			toRules.delete(ruleIndex) //fixme: this might be more expensive then extra iteration at lower loop
			matchList.push(ruleIndex)
		})

		toRules.forEach(function(ruleIndex) {
			var rule = rules[ruleIndex]
			//if we got from here, it does not match in first loop
			if (!rule.from)
				matchList.push(ruleIndex)
		})
		matchList.sort(function(a, b) { return a - b } )
		//console.log(matchList)

		matchList.forEach(function(ruleIndex) {
			var rule = rules[ruleIndex]
			if ((!rule.from || matchRule(rule.from, msg.from)) && (!rule.to || matchRule(rule.to, msg.to)))
				actions.push(rule.action)
		})

		//console.log('AHO', id, actions)
		results[id] = actions
	}
	return results
}


//naive
function filter_naive(messages, rules) {

	function match(re, str) {
		return Boolean(str.match(re));
	}

	function applyRule(actions, rule, message) {
		if (rule.from(message.from) && rule.to(message.to)) {
			actions.push(rule.action);
		}
	}

	var ok = function() { return true }

	var result = Object.create(null);
	rules = rules.map(function(rule) {
		var r = {}
		if (rule.from) {
			var from_re = pattern2regexp(rule.from)
			r.from = function(str) { return Boolean(str.match(from_re)) }
		}
		else
			r.from = ok

		if (rule.to) {
			var to_re = pattern2regexp(rule.to)
			r.to = function(str) { return Boolean(str.match(to_re)) }
		}
		else
			r.to = ok

		r.action = rule.action
		return r
	})
	Object.keys(messages).forEach(function(msgKey) {
		var message = messages[msgKey]
		var actions = []
		rules.forEach(function(rule) {
			applyRule(actions, rule, message)
		})
		result[msgKey] = actions
	});
	return result;
}

var filter = function(messages, rules) {
	var mn = Object.keys(messages).length //slow
	var rn = rules.length
	var n = mn * (rn - 25)
	return (n < 120000)? filter_naive(messages, rules): filter_aho(messages, rules)
}

module.exports = filter
module.exports.filter = filter
