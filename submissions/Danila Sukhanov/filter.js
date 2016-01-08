
"use strict";

function filter (messages, rules) {

    function compileRule (rule) {

        var charsToQuote = ".,!:()+$[]{}/\\^|";
        
        function compile (rule, rulePos, curChar, result, isRegexp) {
            curChar = curChar || rule[rulePos];

            if (!curChar) {
                if (isRegexp) {
                    if (result === "\\*") {
                        return function (str) { return true; };
                    } else {
                        var regexp = new RegExp('^' + result + '$');
                        return function (str) { return regexp.test(str); };
                    }
                } else {
                    return function (str) { return str === rule; };
                }
            }

            if (curChar === '?') {
                return compile(rule, rulePos + 1, null, result + '.', true);            
            }
            
            if (curChar === '*') {
                var ruleNext = rule[rulePos + 1];

                if (ruleNext === '*') {
                    return compile(rule, rulePos + 1, null, result, true);
                }
                if (ruleNext === '?') {
                    return compile(rule, rulePos + 1, '*', result + '.', true);
                }
                /* else */ return compile(rule, rulePos + 1, null, result + '.*', true);
            }

            return compile(rule, rulePos + 1, null,
                           result + (charsToQuote.includes(curChar) ? '\\' + curChar : curChar),
                           isRegexp);
        }

        return compile(rule === undefined ? "*" : rule, 0, null, '', false);
    }

    for (var i = 0; i < rules.length; i += 1) {
        rules[i].from = compileRule(rules[i].from);
        rules[i].to   = compileRule(rules[i].to);
    }

    var result = {};
    
    for (var key in messages) {
        if (messages.hasOwnProperty(key)) {
            var curMessage = messages[key];
            var actsOfCurMessage = [];

            for (i = 0; i < rules.length; i += 1) {
                if (rules[i].from(curMessage.from) && rules[i].to(curMessage.to)) {
                    actsOfCurMessage.push(rules[i].action);
                }
            }
            result[key] = actsOfCurMessage;
        }
    }

    return result;
}

module.exports = filter;
