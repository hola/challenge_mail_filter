var cache = {};

var wildcardRegExp = /[*?]/;
var escapeRegExp = /[-[\]{}()*+?.,\\^$|#\s]/g;

function str2re(rule) {
  var chop = rule;
  var regExpString = '^';
  var cursor = 0;
  while (chop.length > 0) {
    var execResult = wildcardRegExp.exec(chop);
    var isFound = (execResult !== null);
    cursor = (isFound) ? execResult.index : chop.length;
    var leftside = chop.slice(0, cursor);
    var wildcard = chop.slice(cursor, cursor + 1);
    var rightside = chop.slice(cursor + 1);
    chop = rightside;
    regExpString += leftside.replace(escapeRegExp, '\\$&');

    if (wildcard === '*') {
      regExpString += '.*';
    } else if (wildcard === '?') {
      regExpString += '.';
    }
  }
  regExpString += '$';
  var res = new RegExp(regExpString);
  cache[rule] = res;
  return res;
}

function filter(messages, rules) {
  var output = {};
  var rule;

  var ruleFromRegex;
  var ruleToRegex;

  var ri;
  var im;

  for (im in messages) {
    output[im] = [];
  }

  if (!rules.length) {
    return output;
  }

  for (ri = 0; ri < rules.length; ri++) {
    var fromMatched = false;
    var toMatched = false;
    rule = rules[ri];

    if (rule.from === undefined || rule.from === '*') {
      fromMatched = true;
    } else {
      ruleFromRegex = cache[rule.from] || str2re(rule.from);
    }

    if (rule.to === undefined || rule.to === '*') {
      toMatched = true;
    } else {
      ruleToRegex = cache[rule.to] || str2re(rule.to);
    }

    for (im in messages) {
      var message = messages[im];

      if ((fromMatched || ruleFromRegex.test(message.from)) &&
          (toMatched || ruleToRegex.test(message.to))) {
        output[im].push(rule.action);
      }
    }
  }
  return output;
}

module.exports = filter;
