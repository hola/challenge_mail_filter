function filter(messages, rules) {
  var compiledRules = compileRules(rules);
  var result = {};
  for (id in messages) {
    result[id] = matchedRuleActions(compiledRules, messages[id]);
  }
  return result;
}

function matchedRuleActions(compiledRules, message) {
  var actions = [];
  for (var i = 0; i < compiledRules.length; i++) {
    var maybeAction = compiledRules[i](message);
    if (maybeAction !== null) {
      actions.push(maybeAction);
    }
  }
  return actions;
}

var ALL = 'ALL';

function compileRules(rules) {
  var compiled = [];
  for (var i = 0; i < rules.length; i++) {
    // create a scope to solve the loop closure problem
    // http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/
    compiled.push(function(rule) {
      var fromPattern = compilePattern(rule.from),
          toPattern = compilePattern(rule.to),
          action = rule.action;

      if (fromPattern === ALL) {
        if (toPattern === ALL) {
          return function() { return action; };
        } else {
          return function(message) {
            if (toPattern.test(message.to)) {
              return action;
            }
            return null;
          };
        }
      } else if (toPattern === ALL) {
        return function(message) {
          if (fromPattern.test(message.from)) {
            return action;
          }
          return null;
        };
      } else {
        return function(message) {
          if (fromPattern.test(message.from) && toPattern.test(message.to)) {
            return action;
          }
          return null;
        };
      }
    }(rules[i]));
  }
  return compiled;
}
function compilePattern(pattern) {
  return (pattern === undefined || pattern === '*') ? ALL : globToRegExp(pattern);
}

function globToRegExp(string) {
  return new RegExp([
    '^',
    string
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\?/g, ".")
      .replace(/\\\*/g, ".*?"),
    '$'].join(''));
}

module.exports = {
  filter: filter
};
