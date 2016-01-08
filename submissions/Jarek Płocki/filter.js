module.exports = function(messages, rules) {
  var i, l, messageId, message, rule,
      result = {},
      regExpCache = {};

  function makeRegExp(pattern) {
    pattern = pattern || '*';
    var i, l, chr, str = [];
    for (i = 0, l = pattern.length; i !== l; i++) {
      chr = pattern.charAt(i);

      if (chr === '?') {
        str.push('.');
      } else if (chr === '*') {
        str.push('.*');
      } else {
        if (
          chr === '{' ||
          chr === '}' ||
          chr === '(' ||
          chr === ')' ||
          chr === '[' ||
          chr === ']' ||
          chr === '^' ||
          chr === '$' ||
          chr === '|' ||
          chr === '\\' ||
          chr === '+' ||
          chr === '.'
        ) str.push('\\');
        str.push(chr);
      }
    }
    return new RegExp([
      '^',
      str.join(''),
      '$'
    ].join(''));
  }

  for (i = 0, l = rules.length; i !== l; i++) {
    rule = rules[i];
    if (!regExpCache.hasOwnProperty(rule.from)) regExpCache[rule.from] = makeRegExp(rule.from);
    if (!regExpCache.hasOwnProperty(rule.to)) regExpCache[rule.to] = makeRegExp(rule.to);
  }

  for (messageId in messages) {
    if (messages.hasOwnProperty(messageId)) {
      message = messages[messageId];
      result[messageId] = [];
      for (i = 0, l = rules.length; i !== l; i++) {
        rule = rules[i];
        if (regExpCache[rule.from].test(message.from) && regExpCache[rule.to].test(message.to))
          result[messageId].push(rule.action);
      }
    }
  }

  return result;
};
