;(function(undefined) {
    'use strict';

    function patternToRegexp(pattern) {
        return pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
    }

    function filter(messages, rules) {
        for(var j = 0; j < rules.length; ++j) {
            rules[j].from = rules[j].from && new RegExp(patternToRegexp(rules[j].from));
            rules[j].to = rules[j].to && new RegExp(patternToRegexp(rules[j].to));
        }
        var result = {};
        for(var messageId in messages) {
            var message = messages[messageId];
            result[messageId] = result[messageId] || [];
            for(var j = 0; j < rules.length; ++j) {
                var rule = rules[j];
                if (rule.from && ! rule.from.test(message.from)) {
                    continue;
                }
                if (rule.to && ! rule.to.test(message.to)) {
                    continue;
                }
                result[messageId].push(rule.action);
            }
        }

        return result;
    }

    module.exports = filter;
})();
