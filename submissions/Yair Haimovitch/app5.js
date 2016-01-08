// some bad practices in this code were done for performance reasons.
// the rest are just proper bad practices :-}
function __parseRules(rules) {
  for (var i = 0, len = rules.length; i < len; i++) {
    if (rules[i].to) { rules[i].to = __changeRuleToRegex(rules[i].to);}
    if (rules[i].from) {rules[i].from = __changeRuleToRegex(rules[i].from);}
  }
}

function __filter(messages, rules) {
  __parseRules(rules);

  var out = {};
  for (var messageKey in messages) {
    // if (messages.hasOwnProperty(messageKey)) {
      var msgActions = [];
      for (var i = 0, len = rules.length; i < len; i++) {
        var matchto = rules[i].to ? rules[i].to.test(messages[messageKey].to) : true;
        var matchfrom = rules[i].from ? rules[i].from.test(messages[messageKey].from) : true;
        if (matchto && matchfrom) {
          msgActions.push(rules[i].action);
        }
      }
      out[messageKey] = msgActions;
    // }
  }

  return out;
};

function __changeRuleToRegex(str) {
  // return new RegExp(str.replace('*', '.*').replace('?', '.'));
  return new RegExp(str.replace(/([*?])/g, '\.$1'));
}

module.exports = __filter;
