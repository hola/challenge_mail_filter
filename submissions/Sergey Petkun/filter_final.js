(function () {

    "use strict";

    var maskToRegexEscape = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
    var maskToRegexStar = /\\\*/g;
    var maskToRegexQuestion = /\\\?/g;

    var detectWildcards = /\*|\?/;

    var regexCache = {};
    var detectWildcardsCache = {};

    exports.filter = function (messages, rules) {
        var results = {};
        var msgNames = Object.keys(messages);
        var messagesCount = msgNames.length;
        if (messagesCount == 0) {
            return results;
        }

        var rulesCount = rules.length;
        if (rulesCount == 0) {
            var messageIndex;
            var tmp = [];
            for (messageIndex = 0; messageIndex < messagesCount; messageIndex++) {
                results[msgNames[messageIndex]] = tmp;
            }
            return results;
        }

        var fromWildcardsSet = new Set();
        var toWildcardsSet = new Set();

        var noWildcardsFromRulesCount = 0;
        var noWildcardsToRulesCount = 0;
        var wildcardsFromRulesCount = 0;
        var wildcardsToRulesCount = 0;
        for (var ruleIndex = 0; ruleIndex < rulesCount; ruleIndex++) {
            var rule = rules[ruleIndex];
            var ruleFrom = rule.from;
            var ruleTo = rule.to;
            var wildcardsDetected;
            if (ruleFrom) {
                if ((wildcardsDetected = detectWildcardsCache[ruleFrom]) == undefined) {
                    detectWildcardsCache[ruleFrom] = wildcardsDetected = detectWildcards.test(ruleFrom);
                }
                if (wildcardsDetected) {
                    wildcardsFromRulesCount++;
                    fromWildcardsSet.add(ruleIndex);
                } else {
                    noWildcardsFromRulesCount++;
                }
            }
            if (ruleTo) {
                if ((wildcardsDetected = detectWildcardsCache[ruleTo]) == undefined) {
                    detectWildcardsCache[ruleTo] = wildcardsDetected = detectWildcards.test(ruleTo);
                }
                if (wildcardsDetected) {
                    wildcardsToRulesCount++;
                    toWildcardsSet.add(ruleIndex)
                } else {
                    noWildcardsToRulesCount++;
                }
            }
        }

        var messageFromIndex = {};
        var messageToIndex = {};
        var messagesFromArray = [];//'';
        var messagesToArray = [];//'';
        var resultsArray = [];
        for (messageIndex = 0; messageIndex < messagesCount; messageIndex++) {
            var msgName = msgNames[messageIndex];
            var message = messages[msgName];
            var result = [];
            results[msgName] = result;
            resultsArray[messageIndex] = result;

            if (wildcardsFromRulesCount) {
                messagesFromArray[messagesFromArray.length] = message.from;
            }

            if (wildcardsToRulesCount) {
                messagesToArray[messagesToArray.length] = message.to;
            }

            if (noWildcardsFromRulesCount) {
                if (!(tmp = messageFromIndex[message.from])) messageFromIndex[message.from] = tmp = [];
                tmp[tmp.length] = messageIndex;
            }

            if (noWildcardsToRulesCount) {
                if (!(tmp = messageToIndex[message.to])) messageToIndex[message.to] = tmp = [];
                tmp[tmp.length] = messageIndex;
            }
        }

        for (ruleIndex = 0; ruleIndex < rulesCount; ruleIndex++) {
            rule = rules[ruleIndex];
            var action = rule.action;

            var fromMessagesSet = null;
            var toMessagesSet = null;

            var fromHasWildcards = false;
            var toHasWildcards = false;

            ruleFrom = rule.from;
            ruleTo = rule.to;

            if (ruleFrom) {
                fromHasWildcards = fromWildcardsSet.has(ruleIndex);
                if (!fromHasWildcards) {
                    fromMessagesSet = messageFromIndex[ruleFrom];
                    if (!fromMessagesSet) continue;
                }
            }

            if (ruleTo) {
                toHasWildcards = toWildcardsSet.has(ruleIndex);
                if (!toHasWildcards) {
                    toMessagesSet = messageToIndex[ruleTo];
                    if (!toMessagesSet) continue;
                }
            }

            if (ruleFrom && fromHasWildcards) {
                var ruleFromRegex;
                if (!(ruleFromRegex = regexCache[ruleFrom])) {
                    regexCache[ruleFrom] = ruleFromRegex = new RegExp('^' + ruleFrom.replace(maskToRegexEscape, "\\$&").replace(maskToRegexStar, '.*').replace(maskToRegexQuestion, '.') + '$');
                }
                fromMessagesSet = [];
                if (toMessagesSet) {
                    var toMessagesCount = toMessagesSet.length;
                    for (messageIndex = 0; messageIndex < toMessagesCount; messageIndex++) {
                        tmp = toMessagesSet[messageIndex];
                        if (ruleFromRegex.test(messagesFromArray[tmp])) {
                            fromMessagesSet[fromMessagesSet.length] = tmp;
                        }
                    }
                    toMessagesSet = null;
                } else {
                    for (messageIndex = 0; messageIndex < messagesCount; messageIndex++) {
                        if (ruleFromRegex.test(messagesFromArray[messageIndex])) {
                            fromMessagesSet[fromMessagesSet.length] = messageIndex;
                        }
                    }
                }
                if (!fromMessagesSet.length) continue;
            }

            if (ruleTo && toHasWildcards) {
                var ruleToRegex;
                if (!(ruleToRegex = regexCache[ruleTo])) {
                    regexCache[ruleTo] = ruleToRegex = new RegExp('^' + ruleTo.replace(maskToRegexEscape, "\\$&").replace(maskToRegexStar, '.*').replace(maskToRegexQuestion, '.') + '$');
                }
                toMessagesSet = [];
                if (fromMessagesSet) {
                    var fromMessagesCount = fromMessagesSet.length;
                    for (messageIndex = 0; messageIndex < fromMessagesCount; messageIndex++) {
                        tmp = fromMessagesSet[messageIndex];
                        if (ruleToRegex.test(messagesToArray[tmp])) {
                            toMessagesSet[toMessagesSet.length] = tmp;
                        }
                    }
                    fromMessagesSet = null;
                } else {
                    for (messageIndex = 0; messageIndex < messagesCount; messageIndex++) {
                        if (ruleToRegex.test(messagesToArray[messageIndex])) {
                            toMessagesSet[toMessagesSet.length] = messageIndex;
                        }
                    }
                }
                if (!toMessagesSet.length) continue;
            }

            if (fromMessagesSet && toMessagesSet) {
                var ai = 0, bi = 0;
                while (ai < fromMessagesSet.length && bi < toMessagesSet.length) {
                    var av = fromMessagesSet[ai], bv = toMessagesSet[bi];
                    if (av < bv) {
                        ai++;
                    } else if (av > bv) {
                        bi++;
                    } else {
                        tmp = resultsArray[av];
                        tmp[tmp.length] = action;
                        ai++;
                        bi++;
                    }
                }
            } else if (fromMessagesSet) {
                var count = fromMessagesSet.length;
                for (ai = 0; ai < count; ai++) {
                    tmp = resultsArray[fromMessagesSet[ai]];
                    tmp[tmp.length] = action;
                }
            } else if (toMessagesSet) {
                count = toMessagesSet.length;
                for (ai = 0; ai < count; ai++) {
                    tmp = resultsArray[toMessagesSet[ai]];
                    tmp[tmp.length] = action;
                }
            } else {
                count = resultsArray.length;
                for (ai = 0; ai < count; ai++) {
                    tmp = resultsArray[ai];
                    tmp[tmp.length] = action;
                }
            }
        }
        return results;
    };

})();