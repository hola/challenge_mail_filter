'use strict'

var globalAnyNonSpecialCharacter = /[\(\)\[\]\{\}\\\.\^\$\|\+]/g;
function createMatcherRegexp(string) {
	return new RegExp('^' +
		string
			.replace(globalAnyNonSpecialCharacter, '\\$&')
			.replace(/\*/g, '.*')
			.replace(/\?/g, '.{1}')
		+ '$');
}


function preprocessRules(originalRules) {
	var preprocessedRules = [];
	var preprocessedRule;
	var originalRule;
	var specialChars = /[\*\?]/;

	for (var i = 0, len = originalRules.length; i < len; i++) {
		originalRule = originalRules[i];
		preprocessedRule = {
			action: originalRule.action
		};
		if (originalRule.from) {
			preprocessedRule.isRuleFromSimple = !specialChars.test(originalRule.from);
			preprocessedRule.from = preprocessedRule.isRuleFromSimple ? originalRule.from : createMatcherRegexp(originalRule.from)
		}
		if (originalRule.to) {
			preprocessedRule.isRuleToSimple = !specialChars.test(originalRule.to);
			preprocessedRule.to = preprocessedRule.isRuleToSimple ? originalRule.to : createMatcherRegexp(originalRule.to)
		}
		preprocessedRules.push(preprocessedRule);
	}
	return preprocessedRules;
}


function filter(messages, rules) {
	var results = {};
	var preprocessedRules = preprocessRules(rules);
	var rule
	var matches

	for (var messageId in messages) {
		results[messageId] = [];
		for (var ruleIndex = 0, rulesLength = preprocessedRules.length; ruleIndex < rulesLength; ruleIndex++) {
			matches = true;
			rule = preprocessedRules[ruleIndex];
			if (rule.from) {
				if (rule.isRuleFromSimple) {
					matches = messages[messageId].from === rule.from;
				} else {
					matches = rule.from.test(messages[messageId].from);
				}
				if (!matches) {
					continue;
				}
			}
			if (rule.to) {
				if (rule.isRuleToSimple) {
					matches = messages[messageId].to === rule.to;
				} else {
					matches = rule.to.test(messages[messageId].to);
				}
				if (!matches) {
					continue;
				}
			}
			results[messageId].push(rule.action);
		}
	}
	return results;
}

exports.filter = filter
