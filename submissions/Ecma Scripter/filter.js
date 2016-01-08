module.exports = function (messages, rules) {
    var result = {};
    for (var messageId in messages) {
        Object.defineProperty(result, messageId, {
            enumerable: true,
            get: makeActionsGetter(messageId)
        });
    }
    return result;

    function makeActionsGetter(messageId) {
        return function () {
            var message = messages[messageId];
            return message.actions || (
                message.actions = getMessageActions(message)
            );
        }
    }

    function getMessageActions(message) {
        var actions = [];
        var messageFrom = message.from;
        var messageTo = message.to;
        for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
            var rule = rules[ruleIndex];
            var testSender = rule.testSender || (
                rule.testSender = compileMask(rule.from)
            );
            var testReceiver = rule.testReceiver || (
                rule.testReceiver = compileMask(rule.to)
            );
            if (testSender(messageFrom) && testReceiver(messageTo)) {
                actions.push(rule.action);
            }
        }
        return actions;
    }
}

function compileMask(mask) {
    if (!mask || mask == '*') {
        return function allpass() {
            return true;
        };
    }

    var pattern = '';
    for (var i = 0; i < mask.length; i++) {
        var char = mask[i];
        pattern += char == '*' ? '.*?' :
                   char == '?' ? '.' :
                   '\\^$+.()|{}[]'.indexOf(char) >= 0 ? '\\' + char :
                   char;
    }
    var regexp = new RegExp('^' + pattern + '$');
    return function (testingStr) {
        return regexp.test(testingStr);
    };
}
