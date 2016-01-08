'use strict';

function map(arr, cb) {
    let i = arr.length - 1;
    let result = [];

    do{
        let res = cb(arr[i]);
        res && result.push(res);
    } while(i--);

    return result;
}

function getRegExp(mask) {
    return mask && new RegExp('^' + mask.replace('*', '.*').replace('?', '.') + '$');
}

function check(msg) {
    let msgTo = msg.to,
        msgFrom = msg.from;

    return function(rule) {
        let from = rule[0],
            to = rule[1],
            reFrom = rule[2],
            reTo = rule[3],
            action = rule[4];

        if((!to || reTo.test(msgTo)) &&
           (!from || reFrom.test(msgFrom))) {
            return action; //action
        }
    }
}

function match(mask, re, str) {
    return re.test(str);
}

/**
 * @param messages - {id: {from, to}}
 * @param rules [{[from, to,] action}]
 * @returns {id: [action]}
 */
function filter(messages, rules) {
    let _rules = map(rules, rule => {
        return [
            !!rule.from,
            !!rule.to,
            getRegExp(rule.from),
            getRegExp(rule.to),
            rule.action
        ];
    });

    let results = {};
    let keys = Object.keys(messages);
    let i = keys.length - 1;

    do {
        results[keys[i]] = map(_rules, check(messages[keys[i]]));
    } while(i--);

    return results;
}

module.exports = filter;