/**
 * @fileoverview Mail filtering module.
 * @author arthur.khusaenov@gmail.com (Arthur Khu)
 */

/**
 * Function that check if rule has some specific symbols. If yes, creates
 * regexp, else return false.
 * With `*` in the rule matching any number of characters.
 * With `?` matching exactly one arbitrary character.
 *
 * @param {String} address `from` or `to` property of email.
 * @param {String} rule `from` or `to` property of filtering rule.
 * @returns {Boolean}
 */
function isMatchUsingRegexp(address, rule) {
    var isRuleHasSpecialTarget = false;

    var regexp = rule.replace(/\./g, '\\.');

    if (rule.indexOf('*') > -1) {
        regexp = regexp.replace(/\*/g, '.+');
        isRuleHasSpecialTarget = true;
    }

    if (rule.indexOf('?') > -1) {
        regexp = regexp.replace(/\?/g, '.');
        regexp += '$';
        isRuleHasSpecialTarget = true;
    }

    if (isRuleHasSpecialTarget) {
        return !!address.match(new RegExp(regexp, 'gi'));
    }

    return false;
}

/**
 * A function that call helpers to check if rule match a message.
 *
 * @param {Object.<String, String>} message An object with string properties:
 * from and to.
 * @param {Object.<String, String>} rule An object with string properties:
 * from (optional), to (optional), and action (mandatory).
 * @returns {Boolean}
 */
function isMatch(message, rule) {
    if (rule.hasOwnProperty('from') && rule.hasOwnProperty('to')) {
        if (rule.from === message.from && rule.to === message.to) {
            return true;
        }

        if (rule.to === message.to &&
            isMatchUsingRegexp(message.from, rule.from)) {
            return true;
        }

        if (rule.from === message.from &&
            isMatchUsingRegexp(message.to, rule.to)) {
            return true;
        }

        if (isMatchUsingRegexp(message.from, rule.from) &&
            isMatchUsingRegexp(message.to, rule.to)) {
            return true;
        }
    }

    if (rule.hasOwnProperty('from') && !rule.hasOwnProperty('to')) {
        if (isMatchUsingRegexp(message.from, rule.from) ||
            rule.from === message.from) {
            return true;
        }
    }

    if (rule.hasOwnProperty('to') && !rule.hasOwnProperty('from')) {
        if (isMatchUsingRegexp(message.to, rule.to) ||
            rule.to === message.to) {
            return true;
        }
    }

    // A rule that has neither from nor to, matches all messages.
    if (!rule.hasOwnProperty('from') && !rule.hasOwnProperty('to')) {
        return true;
    }

    return false;
}

/**
 * Mail filtering function.
 *
 * @param {Object.<String, Object>} messages Is a mapping of unique message
 * IDs to objects
 * with string properties: from and to.
 * @param {Array.<Object>} rules Is an array of objects with
 * string properties: from (optional), to (optional), and action (mandatory).
 * @returns {Object|Boolean} A mapping of message IDs to arrays of actions. Or
 * false, if arguments is undefined.
 */
module.exports = function filter(messages, rules) {
    if (!messages && !rules) {
        return false;
    }

    var result = {};

    for (var message in messages) {
        if (messages.hasOwnProperty(message)) {
            result[message] = [];
        }
    }

    var rulesLength = rules.length;

    for (message in messages) {
        if (messages.hasOwnProperty(message)) {
            for (var i = 0; i < rulesLength; ++i) {
                if (isMatch(messages[message], rules[i])) {
                    result[message].push(rules[i].action);
                }
            }
        }
    }

    return result;
};
