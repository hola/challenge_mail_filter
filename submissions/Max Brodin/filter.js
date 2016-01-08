"use strict";

const separator = String.fromCharCode(19);

/**
 * Matchses string against wildcard pattern with support for '?' and '*'.
 * @param {string} source
 * @param {string} wild
 * @returns {boolean}
 */
function matchString(source, wild) {
    var mp = 0,
        cp = 0,
        s = 0,
        w = 0,
        n = source.length,
        m = wild.length;

    // while no * in wild just compare char by char
    while (s < n && wild[w] !== '*') {
        // chars are not equal and no ? wild char in template
        if (wild[w] !== source[s] && wild[w] !== '?') {
            return false;
        }

        s += 1;
        w += 1;

        // template is shorter than text
        if (s < n && w >= m) {
            return false;
        }
    }

    // we found * in template
    while (s < n) {
        if (wild[w] === '*') {
            if (w === m - 1) {
                // if * is the last char in template
                return true;
            }
            w += 1;
            mp = w;
            cp = s + 1;
        } else if (wild[w] === source[s] || wild[w] === '?') {
            w += 1;
            s += 1;
        } else {
            w = mp;
            s = cp;
            cp += 1;
        }
    }

    // the last char in template is *
    while (w < m && wild[w] === '*') {
        w += 1;
    }

    // end of wild
    return w === m;
}


/**
 * Checks if message passes rule.
 * @param {Object} message
 * @param {Object} rule
 * @returns {boolean}
 */
function checkRule(message, rule) {
    var isFrom,
        isTo;

    if (!rule.from && !rule.to) {
        return true;
    }

    if (rule.to) {
        isTo = matchString(message.to, rule.to);
        if (!isTo) {
            return false;
        }
    }

    if (rule.from) {
        isFrom = matchString(message.from, rule.from);
        if (!isFrom) {
            return false;
        }
    }

    return isFrom || isTo;
}


/**
 * Applies rules to message.
 * @param {Object} message
 * @param {Array} rules
 * @param {Object} cache
 * @returns {Object} List of actions.
 */
function applyRules(message, rules, cache) {
    var i,
        result = [],
        key = message.from + separator + message.to;

    if (cache[key]) {
        return cache[key];
    }

    for (i = 0; i < rules.length; i += 1) {
        if (checkRule(message, rules[i])) {
            result.push(rules[i].action);
        }
    }

    cache[key] = result;

    return result;
}


/**
 * Filters emails messages with rules.
 * @param {Object} messages
 * @param {Array} rules
 * @returns {Object}
 */
function filter(messages, rules) {
    var i,
        cache = {},
        keys = Object.keys(messages);

    for (i = 0; i < keys.length; i += 1) {
        messages[keys[i]] = applyRules(messages[keys[i]], rules, cache);
    }

    return messages;
}


module.exports = filter;