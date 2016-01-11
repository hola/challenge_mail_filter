'use strict';


// cache

const checkersCache = {};


// functions with 'this' access

const isApplicable = function(rule) {return rule.check(this)}
function test(str) {return this.rule === str}
function _no_from(message) {return this.to.test(message.to)}
function _no_to(message) {return this.from.test(message.from)}
function _from_to(message) {return this.from.test(message.from) && this.to.test(message.to)}


// functions without 'this' access

const _no_all = () => true;

const safe = s => s
	.replace(/([^?*\w])/g, '\\$1')
	.replace(/\?/g, '.{1}')
	.replace(/\*+/g, '.*');

const reg = rule => !rule || /^\*+$/.test(rule)
	? null
	: typeof rule === 'string'
		? rule in checkersCache
			? checkersCache[rule]
			: /^[^?*]+$/g.test(rule)
				? checkersCache[rule] = {rule, test}
				: checkersCache[rule] = new RegExp('^' + safe(rule) + '$')
		: rule;

const prepareRule = rule => {
	rule.from = reg(rule.from);
	rule.to = reg(rule.to);

	rule.check = !rule.from && !rule.to
		? _no_all
		: !rule.from
			? _no_from
			: !rule.to
				? _no_to
				: _from_to;
}

const getAction = rule => rule.action;


// export

module.exports = (messages, rules) => {
	let result = {};

	rules.forEach(prepareRule);

	Object.keys(messages).forEach(key => {
		result[key] = rules.filter(isApplicable, messages[key]).map(getAction);
	});

	return result;
}
