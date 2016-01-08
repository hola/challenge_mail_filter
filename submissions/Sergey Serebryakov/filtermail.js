var findFirstIndex = function (haystack, needle) {
    return haystack.indexOf(needle);
};
var contains = function (s, c) {
    return findFirstIndex(s, c) != -1;
};
var normalizePattern = function (s) {
    var o = [];
    for (var i = 0; i < s.length; i++) {
        if (s[i] != '*' || s[i] == '*' && (i == 0 || i > 0 && s[i - 1] != '*')) {
            o.push(s[i]);
        }
    }
    return o.join('');
};
var containsChar = function (s, c) {
    for (var i = 0; i < s.length; i++) {
        if (s[i] == c)
            return true;
    }
    return false;
};
var matchUntil = function (s, p, maxlen) {
    var matchedCount = 0;
    for (var i = 0; i < maxlen; i++) {
        if (s[i] != p[i] && p[i] != '?')
            return matchedCount;
        matchedCount++;
    }
    return matchedCount;
};
var matchUntilBack = function (s, p, n, m, maxlen) {
    var matchedCount = 0;
    for (var i = 0; i < maxlen; i++) {
        if (s[n - i - 1] != p[m - i - 1] && p[m - i - 1] != '?')
            return matchedCount;
        matchedCount++;
    }
    return matchedCount;
};
var quadMatch = function (s, p, n, m) {
    console.log("Quad called", s, p);
    var dp1 = [];
    var dp2 = [];
    for (var j = 0; j <= m; j++) {
        dp1.push(false);
        dp2.push(false);
    }
    dp1[0] = true;
    for (var i = 1; i <= n; i++) {
        for (var j = 1; j <= m; j++) {
            if (p[j] == '*') {
                dp2[j] = dp2[j - 1] || dp1[j];
            }
            else if (p[j] == '?') {
                dp2[j] = dp1[j - 1];
            }
            else {
                dp2[j] = dp1[j - 1] && s[i - 1] == p[j - 1];
            }
        }
        dp1 = dp2;
    }
    return dp2[m];
};
var matches = function (s, p, hasStar) {
    var n = s.length;
    var m = p.length;
    if (hasStar) {
        var p1 = matchUntil(s, p, n);
        if (p[p1] != '*')
            return false;
        if (p1 > 0)
            return matches(s.substring(p1, n), p.substring(p1, m), hasStar);
        var p2 = matchUntilBack(s, p, n, m, n);
        if (p[m - p2 - 1] != '*')
            return false;
        if (p2 > 0)
            return matches(s.substr(0, n - p2), p.substr(0, m - p2), hasStar);
        if (p == "*")
            return true;
        return quadMatch(s, p, n, m);
    }
    else {
        return n == m && matchUntil(s, p, n) == n;
    }
};
var filter = function (messages, rules) {
    var rulesCount = rules.length;
    for (var i = 0; i < rulesCount; i++) {
        var rule = rules[i];
        if ("from" in rule) {
            if (contains(rule.from, '*')) {
                rule.fromstar = true;
                if (contains(rule.from, '**'))
                    rule.from = normalizePattern(rule.from);
            }
            else {
                rule.fromstar = false;
            }
        }
        if ("to" in rule) {
            if (contains(rule.to, '*')) {
                rule.tostar = true;
                if (contains(rule.to, '**'))
                    rule.to = normalizePattern(rule.to);
            }
            else {
                rule.tostar = false;
            }
        }
    }
    var actions = {};
    for (var messageId in messages) {
        var message = messages[messageId];
        var result_actions = [];
        for (var i = 0; i < rulesCount; i++) {
            var rule = rules[i];
            if (!("from" in rule) || matches(message.from, rule.from, rule.fromstar)) {
                if (!("to" in rule) || matches(message.to, rule.to, rule.tostar)) {
                    result_actions.push(rule.action);
                }
            }
        }
        actions[messageId] = result_actions;
    }
    return actions;
};
module.exports = filter;
