// Slava Shklyaev <shk.slava@gmail.com>

function match(wildcard, str, wildcardPos, strPos) {
  for (; wildcardPos < wildcard.length; ++wildcardPos, ++strPos) {
    if (wildcard[wildcardPos] === '*') {
      for (var nextStrPos = strPos; nextStrPos <= str.length; ++nextStrPos) {
        if (match(wildcard, str, wildcardPos + 1, nextStrPos)) {
          return true;
        }
      }
      return false;
    }

    if (wildcard[wildcardPos] !== '?' && str[strPos] !== wildcard[wildcardPos]) {
      return false;
    }
  }
  return strPos === str.length;
}

function filter(messages, rules) {
  var result = {};
  var messageIds = Object.keys(messages);
  for (var i = 0, messageId; messageId = messageIds[i]; ++i) {
    var message = messages[messageId];
    var actions = [];
    for (var j = 0, rule; rule = rules[j]; ++j) {
      if ((typeof rule.from === 'undefined' || match(rule.from, message.from, 0, 0))
       && (typeof rule.to   === 'undefined' || match(rule.to,   message.to,   0, 0))) {
        actions.push(rule.action);
      }
    }
    result[messageId] = actions;
  }
  return result;
}

module.exports = filter;
