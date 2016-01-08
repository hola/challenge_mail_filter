'use strict';

var exprCache = {};
var msgCache = {};
function buildMask(mask) {
    if (exprCache[mask]) {
        return exprCache[mask];
    }
    return exprCache[mask] = new RegExp(`^${(mask || '*').replace(/[.+^$[\]\\(){}|-]/g, "\\$&").replace(/[*?]/g,'.$&')}$`);
}

function prepare(rule) {
    rule.from = buildMask(rule.from);
    rule.to = buildMask(rule.to);
}

function testRule( rule, message) {
    return rule.from.test(message.from) && rule.to.test(message.to);
}

function filterMessage(message, rules) {
    return rules.filter( rule => testRule(rule,message) ).map( rule => rule.action );
}

function filter(messages, rules) {
    rules.forEach( prepare );
    function filterActions(key) {
        messages[key] = filterMessage(messages[key], rules);
    }
    Object.keys(messages).forEach(filterActions);
    return messages;
}

module.exports = { filter };