exports.filter = function(messages, rules) {

  function translateRuleToRegex(rule) {
    // Substitution for regex special characters.
    // The values keept in array to keep the order.
    var subs = [
      '\\', '\\\\',
      '$', '\\$',
      '(', '\\(',
      '+', '\\+',
      '/', '\\/',
      '?', '\\?',
      '[', '\\[',
      ']', '\\]',
      '^', '\\^',
      '|', '\\|',
      '.', '\\.',
      '*', '[\\!-~]*',
      '?', '[\\!-~]'
    ];

    var regExRule = rule;
    for (var index = 0; index < subs.length; index += 2) {
      var key = subs[index];
      var sub = subs[index + 1];

      if (regExRule.indexOf(key) !== -1) {
        regExRule = regExRule.split(key).join(sub);
      }
    }

    return new RegExp(regExRule);
  }

  function translateRulesToRegex() {
    var fixedRules = [];
    for (var index = 0; index < rules.length; index++) {
      var rule = rules[index];
      var fixedRule = {
        action: rule.action
      };

      fixedRule.from = translateRuleToRegex(rule.from || '*');
      fixedRule.to = translateRuleToRegex(rule.to || '*');

      fixedRules.push(fixedRule);
    }

    return fixedRules;
  }

  function getMessageActions(message, rules) {
    var actions = [];
    for (var index = 0; index < rules.length; index++) {
      var rule = rules[index];

      if (rule.to.test(message.to) &&
          rule.from.test(message.from)) {
            actions.push(rule.action);
          }
    }

    return actions;
  }

  var rulesRegex = translateRulesToRegex();

  var messageIds = Object.keys(messages);

  var results = {};
  for (var index = 0; index < messageIds.length; index++) {
    var msgId = messageIds[index];
    var msg = messages[msgId];
    var actions = getMessageActions(msg, rulesRegex);
    results[msgId] = actions;
  }

  return results;
};
