
'use strict';

var ast = '*', qst = '?';

function match(email, rule) {
  var i = email.length, j = rule.length, prev;
  while (i--, j--) {
    if (rule[j] === ast) {
      if (j === 0) return true;
      prev = rule[j - 1];
      if (prev === ast) {
        i++;
        continue;
      }
      if (prev === qst) {
        do {
          i--;
          j--;
          prev = rule[j - 1];
        } while (prev === qst);
      }
      i = email.lastIndexOf(prev, i);
      if (i >= j) {
        i++;
        continue;
      }
      return false;
    }
    if (rule[j] === qst) continue;
    if (rule[j] === email[i]) continue;
    return false;
  }
  return true;
}

function test(email, rule) {
  if (rule === undefined) return true;
  return match(email, rule);
}

function buildRules(rules) {
  var i, length = rules.length;
  return function(message) {
    var arr = [];
    for (i = 0; i < length; i++) {
      if (test(message.from, rules[i].from) && test(message.to, rules[i].to)) {
        arr.push(rules[i].action);
      }
    }
    return arr;
  };
}

module.exports.filter = function(messages, rules) {
  var build = buildRules(rules), obj = {}, prop;
  for (prop in messages) {
    obj[prop] = build(messages[prop]);
  }
  return obj;
};
