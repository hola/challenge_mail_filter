var myEx = function() {
    return true;
};

var testMask = function(mask, value) {
    var wildcardGroup = false;
    var maskCursor = 0;
    var maskSymbol;
    var currentSymbol;
    for (var i = 0; i < value.length; i++) {
        if (maskCursor >= mask.length) {
            return wildcardGroup;
        }
        maskSymbol = mask.charAt(maskCursor);
        currentSymbol = value.charAt(i);
        if (maskSymbol === '*') {
            if (maskCursor == (mask.length - 1)) {
                return true;
            }
            maskCursor++;
            maskSymbol = mask.charAt(maskCursor);
            wildcardGroup = true;
        }
        if (wildcardGroup) {
            if (maskSymbol === '?') {
                maskCursor++;
            } else if (currentSymbol === maskSymbol) {
                wildcardGroup = false;
                maskCursor++;
            }
            continue;
        }
        if (maskSymbol !== '?' && maskSymbol !== currentSymbol) {
            return false;
        }
        maskCursor++;
    };
    return true;
};

var checkToRule = function(message) {
    return testMask(this.to, message.to);
};

var checkFromRule = function(message) {
    return testMask(this.from, message.from);
};

var fullCheck = function(message) {
    return testMask(this.from, message.from) && testMask(this.to, message.to);
};

module.exports = function(messages, rules) {
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        rule.matchFn = myEx;
        if ('from' in rule && 'to' in rule) {
            rule.matchFn = fullCheck;
        } else if ('from' in rule) {
            rule.matchFn = checkFromRule;
        } else if ('to' in rule) {
            rule.matchFn = checkToRule;
        }
    };
    var actions = Array(rules.length);
    var processMessage = function(message) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].matchFn(message)) {
                actions[i] = rules[i].action;
            } else {
                actions[i] = '';
            }
        };
        return actions.filter(function(action) {
            return action !== '';
        });
    };
    var result = {};
    for (messageId in messages) {
        result[messageId] = processMessage(messages[messageId]);
    }
    return result;
};
