"use strict";

function filter (messages, rules) {
    var result = {};
    var rulesCount = rules.length;

    var prules = [];
    for (var ri = 0; ri < rulesCount; ri++) {
        var prule = rules[ri];
        prules.push([
            prule.to,
            prule.from,
            prule.action
        ]);
    }

    var current;
    var everything;
    var ruleLength;
    var strLength;
    var evrs = [];
    var evrsIndex;
    var evrsLast;
    var c;
    var str;
    var ruleStr;
    var i;

    var msgNames = Object.keys(messages);
    var msgNamesLength = msgNames.length;
    for (var msgIndex = 0; msgIndex < msgNamesLength; msgIndex++) {
        var msgName = msgNames[msgIndex];
        var msg = messages[msgName];
        var res = [];

        ruleLabel: for (var ruleIndex = 0; ruleIndex < rulesCount; ruleIndex++) {
            var rule = prules[ruleIndex];
            if (rule[0]) {
                current = 0;
                everything = false;

                str = msg.to;
                ruleStr = rule[0];

                ruleLength = ruleStr.length;
                strLength = str.length;

                evrsIndex = -1;

                for (i = 0; i < ruleLength; i++) {
                    c = ruleStr[i];

                    if (c === '*') {
                        everything = true;
                        continue;
                    }

                    if (current >= strLength) continue ruleLabel;

                    if (!everything) {
                        if ((c !== '?') && (c !== str[current])) {
                            if (evrsIndex === -1) continue ruleLabel;
                            evrsLast = evrs[evrsIndex--];
                            i = evrsLast[0];
                            current = evrsLast[1] + 1;
                        }
                        current++;
                        continue;
                    }

                    if (c === '?') {
                        current++;
                        continue;
                    }

                    for (;(current < strLength) && (str[current] !== c); current++) {}
                    if (current === strLength) {
                        if (evrsIndex === -1) continue ruleLabel;
                        evrsLast = evrs[evrsIndex--];
                        i = evrsLast[0];
                        current = evrsLast[1] + 1;
                    }
                    // нашли вхождение 'c' в str
                    evrs[++evrsIndex] = [i, current];
                    everything = false;
                    current++;
                }

                if (!((current >= strLength) || everything)) continue;
            }

            if (rule[1]) {
                current = 0;
                everything = false;

                str = msg.from;
                ruleStr = rule[1];

                ruleLength = ruleStr.length;
                strLength = str.length;

                evrsIndex = -1;

                for (i = 0; i < ruleLength; i++) {
                    c = ruleStr[i];

                    if (c === '*') {
                        everything = true;
                        continue;
                    }

                    if (current >= strLength) continue ruleLabel;

                    if (!everything) {
                        if ((c !== '?') && (c !== str[current])) {
                            if (evrsIndex === -1) continue ruleLabel;
                            evrsLast = evrs[evrsIndex--];
                            i = evrsLast[0];
                            current = evrsLast[1] + 1;
                        }
                        current++;
                        continue;
                    }

                    if (c === '?') {
                        current++;
                        continue;
                    }

                    for (;(current < strLength) && (str[current] !== c); current++) {}
                    if (current === strLength) {
                        if (evrsIndex === -1) continue ruleLabel;
                        evrsLast = evrs[evrsIndex--];
                        i = evrsLast[0];
                        current = evrsLast[1] + 1;
                    }
                    // нашли вхождение 'c' в str
                    evrs[++evrsIndex] = [i, current];
                    everything = false;
                    current++;
                }

                if (!((current >= strLength) || everything)) continue;
            }

            res.push(rule[2]);
        }

        result[msgName] = res;
    }

    return result;
}

module.exports = {
    filter: filter
};