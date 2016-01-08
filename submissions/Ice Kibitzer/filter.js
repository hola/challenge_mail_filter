module.exports = function filter(messages, rules) {
    var ruleFull = new Map();
    var ruleRegFrom = new Map();
    var ruleRegTo = new Map();
    var ruleReg = new Map();
    var ruleRegFromD = new Map();

    var pcRegExp = new Map();
    var reD = new RegExp('\\.', 'g');
    var reA = new RegExp('\\*', 'g');
    var reQ = new RegExp('\\?', 'g');

    var reSplit = new RegExp('(.*)\\|(.*)');
    var reSplit2 = new RegExp('^(.*)@([^\\*\\?]*)$');

    var rawRules = [];

    var rulesLength = rules.length;
    for (var ruleIndex = rulesLength - 1; ruleIndex > -1; ruleIndex--) {
        var item = rules[ruleIndex];
        var rule, cur;
        var to = item.to;
        var from = item.from;
        var action = item.action;
        var fromPred = from && (from.includes('*') || from.includes('?'));
        var toPred = to && (to.includes('*') || to.includes('?'));

        rawRules.push(action);

        if (fromPred && toPred) {
            !pcRegExp.has(from) && pcRegExp.set(from,
                new RegExp(from.replace(reD, '\\.').replace(reQ, '.{1}').replace(reA, '.*'), 'gi'));
            !pcRegExp.has(to) && pcRegExp.set(to,
                new RegExp(to.replace(reD, '\\.').replace(reQ, '.{1}').replace(reA, '.*'), 'gi'));

            rule = ruleReg.get(action);
            if (rule !== void 0) {
                rule.add(from + '|' + to);
            } else {
                rule = new Set([from + '|' + to]);
            }
            ruleReg.set(action, rule);
        } else if (fromPred) {
            var D = from.match(reSplit2);
            var fromD = D && D[2];

            !pcRegExp.has(from) && pcRegExp.set(from,
                new RegExp(from.replace(reD, '\\.').replace(reQ, '.{1}').replace(reA, '.*'), 'gi'));

            if (fromD && !fromD.includes('*') && !fromD.includes('?')) {
                rule = ruleRegFromD.get(fromD);

                if (rule !== void 0) {
                    cur = rule.get(to);
                    if (cur !== void 0) {
                        cur.set(from, new Set([...cur.get(from) || new Set(), action]));
                    } else {
                        cur = new Map([[from, new Set([action])]]);
                    }
                    rule.set(from, cur);
                } else {
                    rule = new Map([[to, new Map([[from, new Set([action])]])]]);
                }
                ruleRegFromD.set(fromD, rule);
            } else {
                rule = ruleRegFrom.get(to);

                if (rule !== void 0) {
                    cur = rule.get(from);
                    if (cur !== void 0) {
                        cur.add(action);
                    } else {
                        cur = new Set([action]);
                    }
                    rule.set(from, cur);
                } else {
                    rule = new Map([[from, new Set([action])]]);
                }
                ruleRegFrom.set(to, rule);
            }
        } else if (toPred) {
            rule = ruleRegTo.get(from);

            !pcRegExp.has(to) && pcRegExp.set(to,
                new RegExp(to.replace(reD, '\\.').replace(reQ, '.{1}').replace(reA, '.*'), 'gi'));

            if (rule !== void 0) {
                cur = rule.get(to);
                if (cur !== void 0) {
                    cur.add(action);
                } else {
                    cur = new Set([action]);
                }
                rule.set(to, cur);
            } else {
                rule = new Map([[to, new Set([action])]]);
            }
            ruleRegTo.set(from, rule);
        } else {
            key = 'from:' + from + ',to:' + to;
            rule = ruleFull.get(key);
            if (rule !== void 0) {
                rule.add(action);
            } else {
                rule = new Set([action]);
            }
            ruleFull.set(key, rule);
        }
    }

    var mi, key, msg, res, subs, s, rf, r, fromDMap, rrLength, msa, rawRule, fromTo;
    var messagesKey = Object.keys(messages);
    var fromToCache = new Map();
    var mkLength = messagesKey.length;

    for (mi = mkLength - 1; mi > -1; mi--) {
        key = messagesKey[mi];
        msg = messages[key];
        from = msg.from;
        to = msg.to;

        fromTo = from + '|' + to;
        if (fromToCache.has(fromTo)) {
            messages[key] = fromToCache.get(fromTo);
            continue;
        }

        res = new Set();

        subs = [
            'from:' + from + ',to:' + to,
            'from:undefined,to:' + to,
            'from:' + from + ',to:undefined',
            'from:undefined,to:undefined'
        ];
        for (s = 0; s < 4; s++) {
            rf = ruleFull.get(subs[s]);
            if (rf === void 0) continue;

            r = res;

            if (r === void 0) {
                res = new Set([...rf]);
            } else {
                res = new Set([...r, ...rf]);
            }
        }

        subs = [
            to,
            undefined
        ];
        D = from.match(reSplit2);
        fromDMap = ruleRegFromD.get(D && D[2]);
        for (s = 0; s < 2 && fromDMap; s++) {
            rf = fromDMap.get(subs[s]);
            if (rf === void 0) continue;

            r = res;

            rf.forEach((val, key2)=> {
                var pcre = pcRegExp.get(key2);

                if (pcre.test(from)) {
                    if (r === void 0) {
                        res = new Set([...val]);
                    } else {
                        res = new Set([...r, ...val]);
                    }
                }
                pcre.lastIndex = 0;
            });
        }
        for (s = 0; s < 2; s++) {
            rf = ruleRegFrom.get(subs[s]);
            if (rf === void 0) continue;

            r = res;

            rf.forEach((val, key2)=> {
                var pcre = pcRegExp.get(key2);

                if (pcre.test(from)) {
                    if (r === void 0) {
                        res = new Set([...val]);
                    } else {
                        res = new Set([...r, ...val]);
                    }
                }
                pcre.lastIndex = 0;
            });
        }

        subs = [
            from,
            undefined
        ];
        for (s = 0; s < 2; s++) {
            rf = ruleRegTo.get(subs[s]);
            if (typeof rf === 'undefined') continue;

            r = res;

            rf.forEach((val, key2)=> {
                var pcre = pcRegExp.get(key2);

                if (pcre.test(to)) {
                    if (r === void 0) {
                        res = new Set([...val]);
                    } else {
                        res = new Set([...r, ...val]);
                    }
                }
                pcre.lastIndex = 0;
            });
        }

        ruleReg.forEach((masks, action)=> {
            var stop = true;
            masks.forEach(mask=> {
                if (stop) {
                    var regKey = mask.match(reSplit);
                    var pcre = pcRegExp.get(regKey[1]);
                    var pcre2 = pcRegExp.get(regKey[2]);

                    if (pcre.test(from) && pcre2.test(to)) {
                        stop = false;
                        r = res;
                        if (r === void 0) {
                            res = new Set([action]);
                        } else {
                            res = new Set([...r, action]);
                        }
                    }
                    pcre.lastIndex = 0;
                    pcre2.lastIndex = 0;
                }
            });
        });

        msa = [];
        rrLength = rawRules.length;
        for (r = rrLength - 1; r > -1, rawRule = rawRules[r]; r--) {
            if (res.has(rawRule)) {
                msa.push(rawRule);
            }
        }
        messages[key] = msa;
        fromToCache.set(fromTo, msa);
    }

    return messages;
};
