module.exports = function(messages, rules) {

    var makeRegexp = function(s) {
        return new RegExp('^' + s.replace(/[-\/\\^$+.(){}]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.') + '$');
    }

    for (var i = 0; i < rules.length; ++i) {
        var rule = rules[i];
        rule.to = rule.to ? makeRegexp(rule.to) : 0;
        rule.from = rule.from ? makeRegexp(rule.from) : 0;
    }

    var keys = Object.keys(messages);
    for (var i = 0; i < keys.length; ++i) {
        var msg = keys[i];
        var message = messages[msg];

        var result = [];

        for (var ri = 0; ri < rules.length; ++ri) {
            var rule = rules[ri];

            if ((!rule.from || rule.from.test(message.from)) && (!rule.to || rule.to.test(message.to)))
                result.push(rule.action);
        }
        messages[msg] = result;
    }

    return messages;
};
