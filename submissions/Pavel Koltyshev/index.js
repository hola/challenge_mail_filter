'use strict';

var
    cacheRegExp = {},
    escapeRegExp = /[-[\]{}()+.,\\^$|#\s]/g;


function isPattern(str) {
    return str.indexOf('*') !== -1 || str.indexOf('?') !== -1;
}


function patternToRegExp(patt) {
    patt = patt
        .replace(escapeRegExp, '\\$&')
        .split('*').join('[\x20-\x7f]*')
        .split('?').join('[\x20-\x7f]{1}');
    return new RegExp('^' + patt + '$');
}


function compare(msgEmail, ruleEmail) {
    if (isPattern(ruleEmail)) {
        var regExp = cacheRegExp[ruleEmail];
        if (!regExp) {
            regExp = patternToRegExp(ruleEmail);
            cacheRegExp[ruleEmail] = regExp;
        }
        return regExp.test(msgEmail);
    }
    return msgEmail === ruleEmail;
}


function filter(messages, rules) {
    var
        i,
        msgId,
        msg,
        key,
        actions,
        rule,
        cache = {},
        result = {};

    for (msgId in messages) {
        msg = messages[msgId];

        key = msg.from + '\x00' + msg.to;
        actions = cache[key];

        if (!actions) {
            actions = [];

            for (i = 0; i < rules.length; i++) {
                rule = rules[i];

                if (compare(msg.from, rule.from || '*') && compare(msg.to, rule.to || '*')) {
                    actions.push(rule.action);
                }
            }

            cache[key] = actions;
        }

        result[msgId] = actions;
    }
    return result;
}

exports.filter = filter;