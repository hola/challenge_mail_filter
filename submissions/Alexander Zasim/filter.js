'use strict';

module.exports = filter;

const TYPES = {
    function: 1,
    regexp: 2,
    string: 3
};

function filter(messages, rules) {
    var compiledRules = compileRules(rules);
    //console.log(compiledRules.toString());
    for (var messageKey in messages) {
        messages[messageKey] = compiledRules(messages[messageKey], patternCheck, patternCheckFromEnd, checkFromStart, checkStartAndEnd, checkForTwoStars);
    }
    return messages;
}

function compileRules(rules) {
    //function (msg, check, checkFromEnd, checkFromStart, checkStartAndEnd) {
    var finalFunction = `
        var result = [];
        var from = msg.from;
        var to = msg.to;
    `;
    for (var i = 0, len = rules.length; i < len; i++) {
        var rule = rules[i];
        if (noNeedToGenerate(rule.from)) {
            rule.from = undefined;
        }
        if (noNeedToGenerate(rule.to)) {
            rule.to = undefined;
        }
        if (rule.from && !rule.to) {
            var fromRule = generateTestExpression(rule.from);
            finalFunction += `
                if (${generateIfCondition(fromRule, 'from')}) {
                    result.push('${rule.action}');
                }
            `;
        } else if (!rule.from && rule.to) {
            var toRule = generateTestExpression(rule.to);
            finalFunction += `
                if (${generateIfCondition(toRule, 'to')}) {
                    result.push('${rule.action}');
                }
            `;
        } else if (rule.from && rule.to) {
            toRule = generateTestExpression(rule.to);
            fromRule = generateTestExpression(rule.from);
            finalFunction += `
                if (${generateIfCondition(fromRule, 'from')} && ${generateIfCondition(toRule, 'to')}) {
                    result.push('${rule.action}');
                }
            `;
        } else {
            finalFunction += `
                result.push('${rule.action}');
            `;
        }
    }
    finalFunction += 'return result;';
    return new Function('msg', 'check', 'checkFromEnd', 'checkFromStart', 'checkStartAndEnd', 'checkForTwoStars', finalFunction);
}

function generateIfCondition (rule, field) {
    switch (rule.type) {
        case TYPES.function:
            return `${rule.name}(${field}, ${JSON.stringify(rule.value)})`;
        case TYPES.string:
            return `'${rule.value}' === ${field}`;
        case TYPES.regexp:
            return `${rule.value.toString()}.test(${field})`;
    }
}

var checkRegexp = /[\*\?]/g;
var testRegexp = /[\*\?]/;
var map = {'*': '[\\s\\S]*', '?': '[\\s\\S]'};
var escapeRegExp = /[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g;
function generateTestExpression(string) {
    if (testRegexp.test(string)) {
        var indexOfStar = string.indexOf('*');
        if (indexOfStar < 0) {
            return {
                value: string,
                name: 'check',
                type: TYPES.function
            };
        } else {
            var strLenMinusOne = string.length - 1;
            if (indexOfStar === strLenMinusOne) {
                return {
                    value: string.slice(0, strLenMinusOne),
                    name: 'checkFromStart',
                    type: TYPES.function
                };
            } else {
                var lastIndexOfStar = string.lastIndexOf('*');
                if (lastIndexOfStar === 0) {
                    return {
                        value: string.slice(1),
                        name: 'checkFromEnd',
                        type: TYPES.function
                    };
                } else if (indexOfStar === lastIndexOfStar) {
                    return {
                        value: {
                            begin: string.slice(0, indexOfStar),
                            end: string.slice(indexOfStar + 1)
                        },
                        name: 'checkStartAndEnd',
                        type: TYPES.function
                    }
                } else {
                    var nextStartIndex = string.indexOf('*', indexOfStar+1);
                    if (nextStartIndex === lastIndexOfStar && string.slice(indexOfStar+1, lastIndexOfStar).indexOf('?') < 0) {
                        return {
                            type: TYPES.function,
                            name: 'checkForTwoStars',
                            value: {
                                begin: string.slice(0, indexOfStar),
                                middle: string.slice(indexOfStar+1, lastIndexOfStar),
                                end: string.slice(lastIndexOfStar+1)
                            }
                        };
                    } else {
                        return {
                            value: new RegExp(`^${string.replace(escapeRegExp, '\\$&').replace(checkRegexp, str => map[str])}$`),
                            type: TYPES.regexp
                        };
                    }
                }
            }
        }
    }
    return {
        value: string,
        type: TYPES.string
    };
}

function patternCheck (str, pattern) {
    if (pattern.length !== str.length) {
        return false;
    }
    for (var i = 0, len = pattern.length; i < len; i++) {
        var patternSymbol = pattern[i];
        if (patternSymbol !== '?' && patternSymbol !== str[i]) {
            return false;
        }
    }
    return true;
}

function checkFromStart (str, pattern) {
    if (pattern.length > str.length) {
        return false;
    }
    for (var i = 0, len = pattern.length; i < len; i++) {
        var patternSymbol = pattern[i];
        if (patternSymbol !== '?' && patternSymbol !== str[i]) {
            return false;
        }
    }
    return true;
}

function patternCheckFromEnd(str, pattern) {
    if (pattern.length > str.length) {
        return false;
    }
    for (var i = pattern.length-1, stri = str.length - 1; i >= 0; i--, stri--) {
        var patternSymbol = pattern[i];
        if (patternSymbol !== '?' && patternSymbol !== str[stri]) {
            return false;
        }
    }
    return true;
}

function checkStartAndEnd(str, patterns) {
    return checkFromStart(str, patterns.begin) && patternCheckFromEnd(str, patterns.end);
}

var onlyPatternCharacters = /^\*+$/;
function noNeedToGenerate(rule) {
    return !rule || onlyPatternCharacters.test(rule);
}

function checkForTwoStars(str, patternObj) {
    if (!checkStartAndEnd(str, patternObj)) {
        return false;
    }
    if (!patternObj.middle) {
        return true;
    }
    var indexOfMiddle = str.indexOf(patternObj.middle, patternObj.begin.length);
    return indexOfMiddle >= 0 && (indexOfMiddle + patternObj.middle.length) <= str.length - patternObj.end.length;
}
