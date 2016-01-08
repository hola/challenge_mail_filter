// Copyright Alexander Antonyuk

'use strict';

exports.filter = function (messages, rules) {
    var result = {},
        rmax = rules.length,
        _rmax = rmax,
        i,
        m;

    while (_rmax--) {
        if (rules[_rmax].from !== undefined) {
            rules[_rmax].from = new RegExp(rules[_rmax].from.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.'));
        }
        if (rules[_rmax].to !== undefined) {
            rules[_rmax].to = new RegExp(rules[_rmax].to.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.'));
        }
    }
    for (m in messages) {
        result[m] = [];
        for (i = 0; i < rmax; i += 1) {
            if (rules[i].to !== undefined && rules[i].to.test(messages[m].to) === false) {
                continue;
            }
			if (rules[i].from !== undefined && rules[i].from.test(messages[m].from) === false) {
                continue;
            }
            result[m][result[m].length] = rules[i].action;
        }
    }

    return result;
};		