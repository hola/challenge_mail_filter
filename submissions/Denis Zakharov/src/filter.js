var isPassed = function (msg, rule) {
    var ruleAnyChar = '*';
    var ruleOneChar = '?';
    var exprAnyChar = '^.+';
    var exprOneChar = '^.';
    var exprFrom = new RegExp((rule.from || ruleAnyChar).replace(ruleAnyChar, exprAnyChar).replace(ruleOneChar, exprOneChar));
    var exprTo = new RegExp((rule.to || ruleAnyChar).replace(ruleAnyChar, exprAnyChar).replace(ruleOneChar, exprOneChar));

    return exprTo.test(msg.to) && exprFrom.test(msg.from);
};
// or you mean?: module.exports = function () {...}
module.exports.filter = function (messages, rules) {
    var result = {};
    for (var msgKey in messages) {
        if (messages.hasOwnProperty(msgKey)) {
            result[msgKey] = [];
            rules.forEach(function (rule) {
                if (isPassed(messages[msgKey], rule)) {
                    rule.action ? result[msgKey].push(rule.action) : null;
                }
            });
        }
    }
    return result;
};