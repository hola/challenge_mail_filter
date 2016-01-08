'use strict';

function _convertToRegexp(query) {
  return new RegExp(
    query
      .replace('*', '.*')
      .replace('?', '.?')
  );
}

function filter(messages, _rules) {

  var result = {};
  var rules = _rules;
  var messageIds = Object.keys(messages);

  // Convert 'from' and 'to' in rules to RegExp
  for (var i = 0, len = rules.length; i < len; i++) {
    rules[i].from = _convertToRegexp(rules[i].from || '*');
    rules[i].to   = _convertToRegexp(rules[i].to || '*');
  }

  for (i = 0, len = messageIds.length; i < len; i++) {

    var appliedRules = [];
    var message = messages[messageIds[i]];

    for (var ruleIndex = 0, rulesLength = rules.length; ruleIndex < rulesLength; ruleIndex++) {
      if (message.from.match(rules[ruleIndex].from) && message.to.match(rules[ruleIndex].to)) {
        appliedRules.push(rules[ruleIndex].action);
      }
    }

    result[messageIds[i]] = appliedRules;
  }

  return result;
}

module.exports = { filter: filter };
