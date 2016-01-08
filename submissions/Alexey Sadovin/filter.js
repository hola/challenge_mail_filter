'use strict';

var isMatch = (message, rule, firstRuleSymbol) => {
    var typeRule = typeof rule;

    if (typeRule === 'boolean') {
        return true;
    } else if (typeRule === 'string') {
        return message === rule;
    } else if(firstRuleSymbol !== '*' && firstRuleSymbol !== '?') {

        if (message[0] !== firstRuleSymbol) {
            return false;
        } else {
            return message.search(rule) !== -1;
        }

    } else {
        return message.search(rule) !== -1;
    }
};


var prepareRule = rule => {
    if (!rule) {
        return true;
    }

    var isNotExistStar = rule.indexOf('*') < 0;
    var isNotExistQuestion = rule.indexOf('?') < 0;

    if (isNotExistStar && isNotExistQuestion) {
        return rule;
    } else if (isNotExistStar) {
        return new RegExp('^' + rule.replace(/([\[\]\{\}\|\^\$\+\.\\])/g, '\\$1').replace(/\?/g, '.{1}') + '$');
    } else if (isNotExistQuestion) {
        return new RegExp('^' + rule.replace(/([\[\]\{\}\|\^\$\+\.\\])/g, '\\$1').replace(/\*/g, '.*') + '$');
    } else {
        return new RegExp('^' + rule.replace(/([\[\]\{\}\|\^\$\+\.\\])/g, '\\$1').replace(/\?/g, '.{1}').replace(/\*/g, '.*') + '$');
    }
};


var doFilter = (messageFrom, messageTo, ruleFrom, ruleTo, ruleAction, ruleFromFirstSymbol, ruleToFirstSymbols, rulesLength) => {
    var actions = [];
    var i = 0;
    var len = 0;

    for (len = rulesLength; i < len; i++) {
        if (isMatch(messageFrom, ruleFrom[i], ruleFromFirstSymbol[i]) && isMatch(messageTo, ruleTo[i], ruleToFirstSymbols[i])) {
            actions.push(ruleAction[i]);
        }
    }

    return actions;
};


var filter = (messages, rules) => {
    var result = {};

    var rulesLength = rules.length;

    var ruleFrom = [];
    var ruleFromFirstSymbols = [];

    var ruleTo = [];
    var ruleToFirstSymbols = [];

    var ruleAction = [];

    var messageFrom = [];
    var messageTo = [];

    for (var key in messages) {
        result[key] = [];
        messageFrom.push(messages[key].from);
        messageTo.push(messages[key].to);
    }

    var i = 0;
    var len = 0;
    for (len = rulesLength; i < len; i++) {
        ruleFrom.push(prepareRule(rules[i].from));
        ruleFromFirstSymbols.push(rules[i].from ? rules[i].from[0] : '');
        ruleTo.push(prepareRule(rules[i].to));
        ruleToFirstSymbols.push(rules[i].to ? rules[i].to[0] : '');
        ruleAction.push(rules[i].action);
    }

    i = 0;
    for (var key in result) {
        result[key] = doFilter(messageFrom[i], messageTo[i], ruleFrom, ruleTo, ruleAction, ruleFromFirstSymbols, ruleToFirstSymbols, rulesLength);
        i++;
    }

    return result;
};


module.exports = filter;