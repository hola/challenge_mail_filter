'use strict';

/**
 * Solution to Hola! JS challenge winter 2015
 *
 * Vladimir Barbarosh
 */

// https://github.com/ljharb/regexp.escape/blob/master/index.js
function quote(s)
{
    return s.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g, '\\$&');
}

function returnTrue()
{
    return true;
}

function makePatternMatcher(pattern)
{
    var m, re, prefix, suffix, prefixLength, suffixLength, prefixAndSuffixLength;

    // foobar (match)
    if (/^[^*?]*$/.test(pattern)) {
        return function (s) {
            return s == pattern;
        };
    }

    // *foobar* (contains)
    if (/^\*[^*?]*\*$/.test(pattern)) {
        prefix = pattern.substr(1, pattern.length - 2);
        return function (s) {
            return s.indexOf(prefix) != -1;
        };
    }

    m = pattern.match(/^([^*?]*)\*([^*?]*)$/);
    if (m) {
        prefix = m[1];
        suffix = m[2];
        prefixLength = prefix.length;
        suffixLength = suffix.length;
        // foo*bar
        if (prefixLength && suffixLength) {
            prefixAndSuffixLength = prefixLength + suffixLength;
            return function (s) {
                var len = s.length;
                return len >= prefixAndSuffixLength && s.substr(0, prefixLength) == prefix && s.substr(len - suffixLength) == suffix;
            };
        }
        // foobar* (begins with)
        if (prefixLength) {
            return function (s) {
                var len = s.length;
                return len >= prefixLength && s[0] == prefix[0] && s.substr(0, prefixLength) == prefix;
            };
        }
        // *foobar (ends with)
        if (suffixLength) {
            return function (s) {
                var len = s.length;
                return len >= suffixLength && s.substr(len - suffixLength) == suffix;
            };
        }
        // * (any)
        return returnTrue;
    }

    re = new RegExp('^' + quote(pattern).replace(/\\\*/g, '.*').replace(/\\\?/g, '.') + '$');
    return function (s) {
        return re.test(s);
    };
}

function makeRuleMatcher(rule)
{
    var from = returnTrue,
        to = returnTrue,
        action = rule.action;

    if (typeof rule.from !== 'undefined') {
        from = makePatternMatcher(rule.from);
    }

    if (typeof rule.to !== 'undefined') {
        to = makePatternMatcher(rule.to);
    }

    return function (message) {
        if (from(message.from) && to(message.to)) {
            return action;
        }
        return false;
    };
}

function filter(messages, rules)
{
    var ret = {},
        keys = Object.keys(messages),
        keysLength = keys.length,
        rulesLength = rules.length,
        matchers = new Array(rulesLength),
        i, j, key, message, row, action;

    for (i = 0; i < rulesLength; ++i) {
        matchers[i] = makeRuleMatcher(rules[i]);
    }

    for (i = 0; i < keysLength; ++i) {
        key = keys[i];
        message = messages[key];
        for (j = 0, row = []; j < rulesLength; ++j) {
            action = matchers[j](message);
            if (action !== false) {
                row.push(action);
            }
        }
        ret[key] = row;
    }

    return ret;
}

module.exports = filter;
