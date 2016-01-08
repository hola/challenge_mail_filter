/*
 * Dmitry Egorov <mail@degorov.com>
 *
 * https://hola.org/challenge_mail_filter
 * http://habrahabr.ru/company/hola/blog/270847/
 *
 */

exports.filter = function (messages, rules) {

    var result = {},

        i, j,

        rules_l = rules.length,
        rule,
        rule_f = [],
        rule_t = [],
        rule_fl = [],
        rule_tl = [],
        rule_a = [],

        keys, key, keys_l,

        msg,
        msg_f, msg_t,
        msg_fl, msg_tl,

        res;


    function parse_rule (str) {
        if (str) {
            str = str.replace(/\*+/g, '*');
            if (str === '*') {
                return false;
            } else {
                return str.split('');
            }
        } else {
            return false;
        }
    }


    // plain arrays are our best friends

    for (i = 0; i < rules_l; i++) {
        rule = rules[i];
        rule_f[i] = parse_rule(rule.from);
        rule_t[i] = parse_rule(rule.to);
        rule_fl[i] = rule_f[i].length;
        rule_tl[i] = rule_t[i].length;
        rule_a[i] = rule.action;
    }


    // arrays are waaaaaay faster than strings in this case because they are passed by reference
    // thus not creating a copy of value on each recursive function call

    function wildcard (string, pattern, string_l, pattern_l, string_i, pattern_i) {

        var pattern_c;

        if (string_i >= string_l) {
            if (pattern_i >= pattern_l) {
                return true;
            } else {
                while (pattern_i < pattern_l) {
                    if (pattern[pattern_i] !== '*') return false;
                    pattern_i++;
                }
                return true;
            }
        } else {
            if (pattern_i >= pattern_l) {
                return false;
            }
        }

        pattern_c = pattern[pattern_i];

        if (pattern_c === '?' || pattern_c === string[string_i]) {
            return wildcard(string, pattern, string_l, pattern_l, string_i + 1, pattern_i + 1);

        } else if (pattern_c === '*') {
            return wildcard(string, pattern, string_l, pattern_l, string_i, pattern_i + 1) ||
                   wildcard(string, pattern, string_l, pattern_l, string_i + 1, pattern_i);

        } else
            return false;

    }


    keys = Object.keys(messages);

    for (j = 0, keys_l = keys.length; j < keys_l; j++) {

        key = keys[j];
        msg = messages[key];

        msg_f = msg.from.split('');
        msg_t = msg.to.split('');
        msg_fl = msg_f.length;
        msg_tl = msg_t.length;

        res = result[key] = [];

        for (i = 0; i < rules_l; i++) {

            if ((!rule_f[i] || wildcard(msg_f, rule_f[i], msg_fl, rule_fl[i], 0, 0)) &&
                (!rule_t[i] || wildcard(msg_t, rule_t[i], msg_tl, rule_tl[i], 0, 0)))
            {
                res[res.length] = rule_a[i];
            }

        }

    }

    return result;

};
