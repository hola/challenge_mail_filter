var regexpify = function(rule) {
  if (rule.from == '*') {
    rule.from = undefined;
  }
  if (rule.to == '*') {
    rule.to = undefined;
  }

  if (rule.from) {
    var newFrom = rule.from
    .replace(/\?/g, '[^+]{1}')
    .replace(/[\*]+/g, '[^+]*');
    if (rule.from !== newFrom) {
      rule.from = new RegExp('^' + newFrom + '$');
    }
  }

  if (rule.to) {
    var newTo = rule.to
    .replace(/\?/g, '[^+]{1}')
    .replace(/[\*]+/g, '[^+]*');
    if (rule.to !== newTo) {
      rule.to = new RegExp('^' + newTo + '$');
    }
  }

};

var isRuleApplies = function(data, rule) {
  if (typeof rule === 'string') {
    return data == rule;
  }
  return rule.test(data);
};

var cache = {};

var filter = function(messages, rules) {
  var result = {};
  var keys = Object.keys(messages);
  for (i = 0; i < keys.length; i++) {
    var key = keys[i];
    var m = messages[key];

    if (!m.from) {
      m.from = undefined;
    }
    if (!m.to) {
      m.from = undefined;
    }
    var fromTo = m.from + m.to;
    var cachedResult = cache[fromTo];
    if (cachedResult) {
      result[key] = cachedResult;
      continue;
    }

    var resultArray = [];
    for (var j = 0; j < rules.length; j++) {
      var r = rules[j];
      if (i === 0) {
        regexpify(r);
      }

      if (m.from && r.from) {
        if (!isRuleApplies(m.from, r.from)) {
          continue;
        }
      }
      if (m.to && r.to) {
        if (!isRuleApplies(m.to, r.to))
          continue;
      }
      resultArray.push(r.action);
    }
    cache[fromTo] = resultArray;
    result[key] = resultArray;
  }

  cache = {};
  return result;
};

exports.filter = filter;
