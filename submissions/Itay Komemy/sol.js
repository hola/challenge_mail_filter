(function(module) {

    module.exports = {};

    var makeRegex = function(rule) {
        return new RegExp((rule && '^' + rule.replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&').replace('?','.').replace("*", ".*") + '$') || ".*");
    };

    var convertRulesToRegexes = function(rules) {
      return rules.map(function(rule) {
          return {to: makeRegex(rule.to), from: makeRegex(rule.from), action: rule.action};
      });
    };

    module.exports.filter = function(messages, rules) {

        var msgNames = [];
        var regexRules = convertRulesToRegexes(rules);

        var results = {};

        for (var key in messages) {
            results[key] = [];
            for (var index in regexRules) {
                var rule = regexRules[index];
                if (rule.to.test(messages[key].to) && rule.from.test(messages[key].from)) {
                    results[key].push(rule.action);
                }
            }
        }

        return results;
    };
})(module);