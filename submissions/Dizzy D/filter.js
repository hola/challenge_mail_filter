// by Pavel Kopytin (todizzy@gmail.com)

function filter(messages, oldRules) {
  var result = {};

  var rulesLength = oldRules.length;
  var rules = new Array(rulesLength);
  for (var i = 0; i < rulesLength; i++) {
    var oldRule = oldRules[i];
    rules[i] = {
      from: oldRule.from ? new RegExp('^' + oldRule.from.replace(/(\*|\?)/g, '.$1') + '$') : undefined,
      to: oldRule.to ? new RegExp('^' + oldRule.to.replace(/(\*|\?)/g, '.$1') + '$') : undefined,
      action: oldRule.action
    };
  }

  var keys = Object.keys(messages);
  var keysLength = keys.length;
  for (i = 0; i < keysLength; i++) {
    var key = keys[i];
    var message = messages[key];
    var rk = result[key] = [];
    for (var j = 0; j < rulesLength; j++) {
      var rule = rules[j];
      if ((!rule.from || rule.from.test(message.from)) && (!rule.to || rule.to.test(message.to)))
        rk.push(rule.action);
    }
  }

  return result;
}

module.exports = filter;