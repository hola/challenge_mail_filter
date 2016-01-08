module.exports = function (messages, rules) {
    var rulesCount = rules.length;
    var ruleIndex;
    var rule;
    var message;
    var messageActions;
    var messageReceiver;
    var messageSender;
    var testSender;
    var testReceiver;
    var messageId;

    ruleIndex = 0;
    while (ruleIndex < rulesCount) {
        rule = rules[ruleIndex++];
        rule.testSender = compileMask(rule.from);
        rule.testReceiver = compileMask(rule.to);
    }

    for (messageId in messages) {
        message = messages[messageId];
        messageActions = messages[messageId] = [];
        messageReceiver = message.to;
        messageSender = message.from;
        ruleIndex = 0;
        while (ruleIndex < rulesCount) {
            rule = rules[ruleIndex++];
            testSender = rule.testSender;
            testReceiver = rule.testReceiver;
            if (testSender(messageSender) && testReceiver(messageReceiver)) {
                messageActions.push(rule.action);
            }
        }
    }

    return messages;
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
