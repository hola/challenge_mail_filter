function createRegExp(p) {
    if (!p || p === "*")
        return null;
    var rx = p
        .replace(/(\.|\+|\[|\]|\(|\)|\^|\$|\||\\|\{|\})/g, "$&")
        .replace(/\*/, ".*")
        .replace(/\?/, ".");
    return new RegExp("^" + rx + "$");
}
function filter(messages, rules) {
    var rxRules = [];
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        rxRules.push({
            fromRx: createRegExp(rule.from),
            toRx: createRegExp(rule.to),
            action: rule.action
        });
    }
    var result = {};
    for (var messageKey in messages) {
        var actions = [];
        var message = messages[messageKey];
        for (var _a = 0, rxRules_1 = rxRules; _a < rxRules_1.length; _a++) {
            var rule = rxRules_1[_a];
            if ((!rule.fromRx || rule.fromRx.test(message.from)) &&
                (!rule.toRx || rule.toRx.test(message.to))) {
                actions.push(rule.action);
            }
        }
        result[messageKey] = actions;
    }
    return result;
}
exports.filter = filter;
