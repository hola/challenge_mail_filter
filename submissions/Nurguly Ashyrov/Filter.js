var 
  messageKeys, 
  resultObj, 
  regex = '',
  ZERO_OR_MORE = '*',
  ONE_EXACTLY = '?',
  REGEX_RANGE = "[\\x20-\\x7F]"
;

function matcherToRegex (matcher) {
  if (!matcher) return false;
  if (matcher === '*') return false;
  
  regex = "^";
  for (var i = 0; i < matcher.length; i++) {
    if (matcher[i] === ZERO_OR_MORE) {
      regex += REGEX_RANGE + ZERO_OR_MORE;
    } else if (matcher[i] === ONE_EXACTLY) {
      regex += REGEX_RANGE;
    } else {
      regex += '[' + matcher[i] + ']';
    }
  }
  return regex += '$';
}

function getMatcherFunc (from, to) {
  var fromRegex, toRegex;
  from = matcherToRegex(from);
  to = matcherToRegex(to);

  // If there is only `from` rule that needs to be applied
  if (from && !to) {
    fromRegex = new RegExp(from);
    return function matchFrom (message) {
      return fromRegex.test(message.from);
    };
  }

  // If there is only `to` rule that needs to be applied
  if (!from && to) {
    toRegex = new RegExp(to);
    return function matchTo (message) {
      return toRegex.test(message.to);
    };
  }

  // If there are both `from` and `to` rules ...
  if (from && to) {
    fromRegex = new RegExp(from);
    toRegex = new RegExp(to);
    return function matchFromTo (message) {
      return fromRegex.test(message.from) && toRegex.test(message.to);
    };
  }

  // If there are no rules, all should match
  if (!from && !to) {
    return function matchAll () {
      return true;
    };
  }
}

function getResultObj (messageKeys) {
  var result = {};
  for (var i = 0; i < messageKeys.length; i++) {
    result[messageKeys[i]] = [];
  }
  return result;
}

function filterMatch (resultObj, messages, matcher, action) {
  var resultItem, key;
  for (key in messages) {
    if (matcher(messages[key])) {
      resultItem = resultObj[key];
      resultItem[resultItem.length] = action;      
    }
  }
}

function filter (messages, rules) {
  var rule, matcher;
  messageKeys = Object.keys(messages);
  resultObj = getResultObj(messageKeys);

  for (var i = 0; i < rules.length; i++) {
    rule = rules[i];
    filterMatch(resultObj, messages, getMatcherFunc(rule.from, rule.to), rule.action);
  }

  return resultObj;
}

module.exports = filter;