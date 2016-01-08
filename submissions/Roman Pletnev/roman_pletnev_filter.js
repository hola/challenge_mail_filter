/**
 *
 * Copyright (c) 2015 Roman Pletnev.
 * All rights reserved.
 *
 * This software may be modified and distributed 
 * under the terms of the BSD license.
 * 
 * @module roplet/hola-js-programming-challenge
 */

'use strict';

/** Forms the rule for a given pattern.
*  @param {string} pattern - A string pattern representing a rule. An asterisk means zero or more characters. A question mark means 1 character. Other characters represent exact matches.
*  @returns {Object} A rule to be used with the {@link module:roplet/hola-js-programming-challenge~check} function.
*/
function getRule(pattern) {
    var char,
        lastChar = 0,
        hasLetters = false,
        hasQuestions = false,
        separateAsterisks = 0,
        totalAsterisks = 0,
        offset,
        i = 0;
    
    for (; i < pattern.length; ++i) {
        char = pattern.charCodeAt(i);
        if (char === 42) {
            if (lastChar !== char) {
                lastChar = char;
                ++separateAsterisks;
            }
            ++totalAsterisks;
        } else {
            if (char === 63) {
                hasQuestions = true;
            } else {
                hasLetters = true;
            }
            lastChar = char;
        }
    }
    
    if (!hasQuestions && !separateAsterisks) {
        return { payload: pattern, offset: pattern.length, type: 0 };
    } else if (separateAsterisks === 0) {
        return { payload: pattern, offset: pattern.length, type: 1 };
    } else if (!hasLetters) {
        offset = pattern.length - totalAsterisks;
        return offset ? { payload: null, offset: offset, type: 2 } : undefined;
    } else if (separateAsterisks === 1) {
        offset = pattern.length - totalAsterisks;
        return { payload: pattern, offset: offset, type: 3 };
    } else {
        return backtrackingRule(pattern);
    }
};

/** Forms the rule for a pattern that either has multiple asterisks or requires backtracking to execute it.
*  @param {string} pattern - A string pattern representing a rule. An asterisk means zero or more characters. A question mark means 1 character. Other characters represent exact matches.
*  @returns {Object} A rule to be used with the {@link module:roplet/hola-js-programming-challenge~check} function.
*/
function backtrackingRule(pattern) {
    var regex = '^',
        j = 0,
        minChars = 0,
        char,
        charCode = 0,
        lastCharCode = 0,
        i = 0;
    
    for (; i < pattern.length; ++i) {
        char = pattern[i];
        charCode = pattern.charCodeAt(i);
        if (charCode === 42) {
            if (lastCharCode !== 42) {
                regex += '.*?';
            }
        }
        else {
            if (charCode === 63) {
                regex += '.';
            } else if (charCode === 45 || charCode === 47 || charCode === 92 || charCode === 94 || charCode === 36 || 
                        charCode === 43 || charCode === 46 || charCode === 40 || charCode === 41 || charCode === 124 || 
                        charCode === 91 || charCode === 93 || charCode === 123 || charCode === 125) {
                regex += '\\' + char;
            } else {
                regex += char;
            }
            ++minChars;
        }
        lastCharCode = charCode;
    }
    regex += '$';
    
    return { payload: new RegExp(regex), offset: minChars, type: 4 };
}

/** Checks whether an email address satisfies a rule.
*  @param {Object} rule - A rule returned by the {@link module:roplet/hola-js-programming-challenge~getRule} function.
*  @param {string} target - The string representing an email address.
*  @returns {boolean} true, if the target email address matches the pattern encoded in a rule. Otherwise, false.
*/
function check(rule, target) {
    var targetLen = target.length,
        charCode = 0,
        j = 0,
        i = 0;
    
    if (rule.offset > targetLen) {
        return false;
    }
    
    switch (rule.type) {
        case 0:
            return rule.payload === target;
        case 1:
            if (rule.payload.length !== targetLen) {
                return false;
            }
        case 3:
            for (i = 0, j = 0; i < rule.payload.length; ++i) {
                charCode = rule.payload.charCodeAt(i);
                if (charCode === 42) {
                    if (i === rule.payload.length - 1) {
                        return true;
                    } else {
                        j = targetLen - rule.payload.length + i + 1;
                        continue;
                    }
                }
                if (charCode !== 63 && target.charCodeAt(j) !== charCode) {
                    return false;
                }
                ++j;
            }
            break;
        case 4:
            return rule.payload.test(target);
    }
    
    return true;
};

/** Tags email messages according to rules.
 *  @param {Object.<string, {from: string, to: string}>} messages - An object with messages. Where a message is represented by 'from' and 'to' properties.
 *  @param {Object[]} rules - An array of rulesets with 'action' property naming a rule and optional 'from' and 'to' patterns to match.
 *  @returns {Object.<string, string[]>} An object where each message is assigned the matching rules.
 */
function filter(messages, rules) {
    var cache = new Map(),
        name,
        names = Object.keys(messages),
        rule,
        result,
        message,
        key,
        j = 0,
        i = rules.length;
    
    while (i--) {
        rule = rules[i];
        if (rule.from) {
            rule.from = getRule(rule.from);
        }
        if (rule.to) {
            rule.to = getRule(rule.to);
        }
    }
    
    i = names.length;
    
    while (i--) {
        result = [];
        name = names[i];
        message = messages[name];
        key = message.to + '\n' + message.from;
        
        messages[name] = cache.get(key);
        if (messages[name] === undefined) {
            for (j = 0; j < rules.length; ++j) {
                rule = rules[j];
                if ((rule.from ? check(rule.from, message.from) : true) && 
                    (rule.to ? check(rule.to, message.to) : true)) {
                    result.push(rule.action);
                }
            }
            cache.set(key, result);
            messages[name] = result;
        }
    }
    
    return messages;
}

/** Tags email messages according to rules. See {@link module:roplet/hola-js-programming-challenge~filter}*/
exports.filter = filter;