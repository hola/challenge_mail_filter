module.exports = filter;

function filter(msgs, rules) {
    var msgsKeys = Object.keys(msgs),
        msgsLength = msgsKeys.length,
        rulesLength = rules.length,
        msgsMatchedRules = {},
        msgKey,
        matcher,
        ruleIndex,
        rule,
        i;

    for (i = 0; i < msgsLength; i++) {
        msgsMatchedRules[msgsKeys[i]] = [];
    }

    for (ruleIndex = rulesLength; ruleIndex--;) {
        rule = rules[ruleIndex];
        matcher = createRuleMatcher(rule);

        for (i = msgsLength; i--;) {
            msgKey = msgsKeys[i];
            if (matcher(msgs[msgKey])) {
                msgsMatchedRules[msgKey].unshift(rule.action);
            }
        }
    }

    return msgsMatchedRules;
}

function createRuleMatcher(rule) {
    if (isAnyMatcher(rule.to) && isAnyMatcher(rule.from)) {
        return returnTrue;
    }

    var matchToField = createMatcher(rule.to);
    var matchFromField = createMatcher(rule.from);

    return match;

    function match(msg) {
        return matchToField(msg.to) && matchFromField(msg.from);
    }
}

function createMatcher(pattern) {
    if (isAnyMatcher(pattern)) {
        return returnTrue;
    }

    var ruleRegExp = patternToRegExp(pattern);

    return match;

    function match(email) {
        return ruleRegExp.test(email);
    }
}

function isAnyMatcher(pattern) {
    return !pattern || pattern === '*';
}

function returnTrue() {
    return true;
}

function patternToRegExp(pattern) {
    var regExpString = pattern
        .replace(/\./g, '\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.{1}');

    return new RegExp('^'+regExpString + '$');
}