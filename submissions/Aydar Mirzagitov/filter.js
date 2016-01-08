'use strict';

module.exports = function filter(messages, rules) {
    var i;
    var e;
    var j;
    var to;
    var from;
    var messageId;
    var froms;
    var result = {};
    var messagesNormalized = {};
    var rulesCount = rules.length;
    var message;
    var keys;
    var rule;

    for (e = 0; e < rulesCount; e++) {
        rule = rules[e];

        if (rule.from && rule.from !== '*' && rule.from !== '**' && rule.from !== '***') {
            rule.fromTester = getTester(rule.from);
        } else {
            rule.passFrom = true;
        }

        if (rule.to && rule.to !== '*' && rule.to !== '**' && rule.to !== '***') {
            rule.toTester = getTester(rule.to);
        } else {
            rule.passTo = true;
        }
    }

    keys = Object.keys(messages);
    i = keys.length;
    while (i--) {
        messageId = keys[i];
        result[messageId] = [];
        message = messages[messageId];

        if (messagesNormalized[message.to]) {
            messagesNormalized[message.to][message.from] = messagesNormalized[message.to][message.from] || {};
            messagesNormalized[message.to][message.from].reverse = messagesNormalized[message.to][message.from].reverse || [];
            messagesNormalized[message.to][message.from].reverse.push(messageId);
            continue;
        }

        messagesNormalized[message.from] = messagesNormalized[message.from] || {};
        messagesNormalized[message.from][message.to] = messagesNormalized[message.from][message.to] || {};
        messagesNormalized[message.from][message.to].direct = messagesNormalized[message.from][message.to].direct || [];
        messagesNormalized[message.from][message.to].direct.push(messageId);
    }

    messages = null;

    keys = Object.keys(messagesNormalized);
    i = keys.length;
    while (i--) {
        from = keys[i];

        var fromMessages = messagesNormalized[from];
        froms = Object.keys(fromMessages);
        j = froms.length;

        while (j--) {
            to = froms[j];
            messages = fromMessages[to];

            e = -1;
            while (++e < rulesCount) {
                rule = rules[e];

                if (messages.direct && testRule(from, to, rule)) {
                    addRulesToMessages(result, messages.direct, rule.action);
                }

                if (messages.reverse && testRule(to, from, rule)) {
                    addRulesToMessages(result, messages.reverse, rule.action);
                }
            }
        }
    }

    return result;
};

function testRule(from, to, rule) {
    return (rule.passTo || rule.toTester.test(to)) && (rule.passFrom || rule.fromTester.test(from));
}

function addRulesToMessages(result, messageIds, action) {
    var i = messageIds.length;
    while (i--) {
        result[messageIds[i]].push(action);
    }
}

function getTester(mask) {
    var maskLength = mask.length;
    var aCount = (mask.match(/\*/g) || []).length;
    var qCount = (mask.match(/\?+/g) || []).length;
    var startsWithA = mask.charAt(0) === '*';
    var endsWithA = mask.charAt(maskLength - 1) === '*';

    if (qCount === 0 && aCount === 0) {
        // blabla
        return new EqualsTester(mask);
    }

    if (qCount === 1 && aCount === 0) {
        // bl??la
        return new StartsAndEndsWithTester(mask, true);
    }

    if (qCount === 0 && aCount === 1) {
        // bl*la
        return new StartsAndEndsWithTester(mask, false);
    }

    if (startsWithA && qCount == 0 && aCount === 1) {
        // *blabla
        return new EndsWithTester(mask.substr(1));
    }

    if (endsWithA && qCount == 0 && aCount === 1) {
        // blabla*
        return new EndsWithTester(mask.substr(1));
    }

    if (startsWithA && qCount == 1 && aCount === 1) {
        // *bl?bla
        return new EndsWithTester(new StartsAndEndsWithTester(mask.substr(1), true));
    }

    if (endsWithA && qCount == 1 && aCount === 1) {
        // bl?bla*
        return new StartsWithTester(new StartsAndEndsWithTester(mask.substr(0, maskLength - 1), true));
    }

    if (endsWithA && startsWithA && qCount == 0 && aCount === 2) {
        // *blabla*
        return new ContainsTester(mask.substr(1, maskLength - 2));
    }

    // for complex masks just use regular expression
    return new RegExp('^' + mask.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&").replace(/\*/g, '.*').replace(/\?/g, '.{1}') + '$', 'i');
}

/**
 * Tests that given string equals to the mask
 * @param mask
 * @constructor
 */
function EqualsTester(mask) {
    return {mask, test: testEquals};
}

function testEquals(text) {
    return text === this.mask;
}

/**
 * Tests that given string contains the 'mask'
 * @param mask
 * @constructor
 */
function ContainsTester(mask) {
    return {mask, test: testContains};
}

function testContains(text) {
    return text.indexOf(this.mask) > -1;
}

/**
 * Tests that given string ends with the 'mask'
 * @param mask
 * @constructor
 */
function EndsWithTester(mask) {
    var isMaskString = typeof mask === 'string';
    var length = mask.length;
    return {mask, isMaskString, length, test: testEndsWith};
}

function testEndsWith(text) {
    if (this.isMaskString) {
        return text.lastIndexOf(this.mask) === text.length - this.length;
    } else {
        return this.mask.test(text.substr(-this.length));
    }
}

/**
 * Tests that given string starts with the 'mask'
 * @param mask
 * @constructor
 */
function StartsWithTester(mask) {
    var isMaskString = typeof mask === 'string';
    var length = mask.length;
    return {mask, isMaskString, length, test: testStartsWith};
}

function testStartsWith(text) {
    if (this.isMaskString) {
        return text.charAt(0) === this.mask.charAt(0) && text.indexOf(this.mask) === 0;
    } else {
        return this.mask.test(text.substr(0, this.length));
    }
}

/**
 * Tests that given string starts and ends with substrings separated with ? or * in the 'mask'
 * @param mask
 * @param checkLength
 * @constructor
 */
function StartsAndEndsWithTester(mask, checkLength) {
    var start = mask.substr(0, mask.indexOf(checkLength ? '?' : '*'));
    var end = mask.substr(mask.lastIndexOf(checkLength ? '?' : '*') + 1);
    var startLength = start.length;
    var endLength = end.length;
    var length = mask.length;
    return {mask, checkLength, endLength, length, startLength, end, start, test: testStartsAndEndsWith};
}

function testStartsAndEndsWith(text) {
    return (!this.checkLength || text.length === this.length) && text.substr(0, this.startLength) === this.start
        && (this.endLength === 0 || text.substr(-this.endLength) === this.end);
}