function filter(messages, rules) {

    var keys = Object.keys(messages),
        keysLength = keys.length,
        rulesLengh = rules.length,
        key, i;

    for (i = 0; i < rulesLengh; ++i) {
        compileRule(rules[i]);
    };

    for (i = 0; i < keysLength; ++i) {
        key = keys[i];

        messages[key] = filterMessage(messages[key], rules, rulesLengh);
    };

    return messages;
};

function compileRule(rule) {
    if (rule.to) {
        rule.toMatcher = rule.to.indexOf('*') === -1 ? simpleMatch : hardMatch;
    }

    if (rule.from) {
        rule.fromMatcher = rule.from.indexOf('*') === -1 ? simpleMatch : hardMatch;
    }

    return rule;
}

function filterMessage(message, rules, rulesLengh) {

    var matched = new Array(),
        rule;

    for (var i = 0; i < rulesLengh; i++) {
        rule = rules[i];

        if (isMatchedMessage(message, rule)) {
            matched.push(rule.action);
        }
    };

    return matched;
};

function isMatchedMessage(message, rule) {

    if (rule.toMatcher && !rule.toMatcher(message.to, rule.to)) {
        return false;
    }

    if (rule.fromMatcher && !rule.fromMatcher(message.from, rule.from)) {
        return false;
    }

    return true;
};

function simpleMatch(string, pattern) {
    var stringLength = string.length;

    if (stringLength !== pattern.length) {
        return false;
    } else {
        for (var i = 0; i < stringLength; ++i) {
            if (string[i] !== pattern[i] && pattern[i] !== '?') {
                return false;
            }
        }
    }

    return true;
};

function hardMatch(string, pattern) {

    var stringLastPosition, patternLastPosition, currentPatternChar,
        stringLength = string.length,
        patternLength = pattern.length,
        stringCurrentPosition = 0,
        patternCurrentPosition = 0;

    while (stringCurrentPosition < stringLength) {

        currentPatternChar = pattern[patternCurrentPosition];

        if (currentPatternChar === '*') {

            stringLastPosition = stringCurrentPosition + 1;
            patternLastPosition = patternCurrentPosition;

            patternCurrentPosition++;

        } else if (string[stringCurrentPosition] === currentPatternChar || currentPatternChar === '?') {

            stringCurrentPosition++;
            patternCurrentPosition++;

        } else {

            if (stringLastPosition) {
                stringCurrentPosition = stringLastPosition;
                patternCurrentPosition = patternLastPosition;
            } else {
                return false;
            }

        }

    }

    for (var i = patternCurrentPosition; i < patternLength; i++) {
        if (pattern[i] !== '*') return false;
    };

    return true;
};

exports.filter = filter;
