exports.filter = function (messages, rules) {

    var matchMessageRule = function (message, rule) {
        return matchMailMask(message[0], rule[0]) && matchMailMask(message[1], rule[1]);
    };

    var matchMailMask = function (mail, mask) {
        if (mask === undefined) {
            return true;
        }

        var regexp_str = mask.replace(/([.\[\]()\\+{}^<>|$])/g, '\\$1').replace(/\*/g, '.*').replace(/\?/g, '.{1}');
        regexp_str = '^(' + regexp_str + ')$';

        return mail.match(new RegExp(regexp_str)) !== null;
    };

    /* Prepare input messages data as array instead of object */
    var messagesKeys = Object.keys(messages);
    var messagesLength = messagesKeys.length;
    var newMessages = [];
    var curKey = '';
    var curMessage = '';
    var curRule = '';

    for (var i = 0; i < messagesLength; i += 1) {
        curKey = messagesKeys[i];
        curMessage = messages[curKey];
        newMessages[i] = [curMessage.from, curMessage.to, curKey];
    }

    /* Prepare input rules data as array instead of object */
    var newRules = [];
    var rulesLength = rules.length;

    for (var i = 0; i < rulesLength; i += 1) {
        curRule = rules[i];
        newRules[i] = [curRule.from, curRule.to, curRule.action];
    }

    /* Initialize out object */
    var out = {};
    for (var i = 0; i < messagesLength; i += 1) {
        out[messagesKeys[i]] = [];
    }

    /* Find our mailbox*/
    var obj = {};
    var max = 9; // 'undefined'.length
    var tObj = '';
    var tLen = 9;
    var myMail = '';

    for (var i = 0; i < messagesLength; i += 1) {
        tObj = newMessages[i][1];
        obj[tObj] += '0';
        tLen = obj[tObj].length;
        if (tLen > max) {
            max = tLen;
            myMail = tObj;
        }
    }

    /* Generate myMail rule masks */
    var fromMask = [];
    var toMask = [];

    for (var i = 0; i < rulesLength; i += 1) {
        curRule = newRules[i];
        fromMask[i] = matchMailMask(myMail, curRule[0]);
        toMask[i] = matchMailMask(myMail, curRule[1]);
    }

    /* Processing */
    for (var i = 0; i < rulesLength; i += 1) {
        curRule = newRules[i];
        for (var p = 0; p < messagesLength; p += 1) {
            curMessage = newMessages[p];

            if (curMessage[1] === myMail) {
                if (toMask[i] && matchMailMask(curMessage[0], curRule[0])) {
                    out[curMessage[2]].push(curRule[2]);
                }
            } else if (curMessage[0] === myMail) {
                if (fromMask[i] && matchMailMask(curMessage[1], curRule[1])) {
                    out[curMessage[2]].push(curRule[2]);
                }
            } else if (matchMessageRule(curMessage, curRule)) {
                out[curMessage[2]].push(curRule[2]);
            }
        }
    }

    return out;
};
