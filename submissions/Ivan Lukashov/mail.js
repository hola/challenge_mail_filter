// Author: Ivan Lukashov
// i@wayx.ru

"use strict";

module.exports = function(messages, rules) {
    var rule, item, mail, iM, iF = 0,
        filter = Array(Object.keys(rules).length);

    for (rule of rules) {
        filter[iF++] = [
            rule.from ? (new RegExp('^' + rule.from.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$')) : null,
            rule.to ? (new RegExp('^' + rule.to.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$')) : null,
            rule.action
        ];
    }

    for (iM in messages) {
        mail = messages[iM];
        rule = [];
        iF = 0;

        for (item of filter) {
            ( !item[0] || item[0].test(mail.from)) &&
            ( !item[1] || item[1].test(mail.to)) &&
                (rule[iF++] = item[2]);
        }

        messages[iM] = rule;
    }

    return messages;
};
