'use strict';

/***********************************************************
 * The challenge: write mail filtering engine, http://hola.org/challenge_mail_filter
 * Description: http://hola.org/challenge_mail_filter
 * Copyright 2015 Danil Baibak <danil.baibak@gmail.com>
 * MIT License, http://shps.mit-license.org
 ************************************************************/

/**
 * Filter for the emails
 *
 * @param messages - list of the emails
 * @param rules - list of the rules for filtering
 * @returns {{}}
 */
var filter = function (messages, rules) {
    var results = {},
        message,
        rulesConfirm,
        rule,
        i,
        rules_len = rules.length;

    //prepare rules
    rules = prepare_rules(rules);
    for (var messageKey in messages) {
        message = messages[messageKey];
        rulesConfirm = 0;
        results[messageKey] = [];

        for (i = 0; i < rules_len; i++) {
            rule = rules[i];

            if (rule.from.test(message.from) && rule.to.test(message.to)) {
                results[messageKey][rulesConfirm++] = rule.action;
            }
        }
    }

    return results;
};

/**
 * Prepare rules as regexp
 *
 * @param array rules - list of the rules
 * @returns {*}
 */
function prepare_rules(rules) {
    var getAll = new RegExp('.*'),
        rule,
        i = 0,
        rules_len = rules.length;

    for (i; i < rules_len; i++) {
        rule = rules[i];

        if (rule.from) {
            rule.from = new RegExp(rule.from.replace('*', '.*').replace('?', '.?'));
        } else {
            rule.from = getAll;
        }

        if (rule.to) {
            rule.to = new RegExp(rule.to.replace('*', '.*').replace('?', '.?'));
        } else {
            rule.to = getAll;
        }
    }

    return rules;
}

module.exports = filter;