"use strict";

class Filter {
    constructor(rules) {
        this.rules_to = new Map();
        this.rules_from = new Map();
        this.rules_mask = new Array();
        this.rules_global = new Array();
        this.nullptr = Symbol("nullptr");

        this.appendRules(rules);
    }

    appendRules(rules) {
        for (var i = rules.length; i--;) {
            var rule = rules[i];
            rule.cache = [{}, {}, i];

            var to = rule.to !== undefined;
            var from = rule.from !== undefined;

            if (!to && !from) {
                this.rules_global.push(rule);
            } else {
                var to_mask = (to && (rule.to.includes('*') || rule.to.includes('?')));
                var from_mask = (from && (rule.from.includes('*') || rule.from.includes('?')));

                if (to && from) {
                    if (to_mask && from_mask) {
                        this.rules_mask.push([rule, Filter.funRx]);
                    } else if (to_mask) {
                        var tmp = this.rules_from.get(rule.from);
                        if (tmp === undefined) {
                            tmp = []
                            this.rules_from.set(rule.from, tmp);
                        }
                        tmp.push([rule, Filter.funRxTo]);
                    } else if (from_mask) {
                        var tmp = this.rules_to.get(rule.to);
                        if (tmp === undefined) {
                            tmp = {};
                            this.rules_to.set(rule.to, tmp);
                        }
                        var arr = tmp[this.nullptr];
                        if (arr === undefined)
                            arr = tmp[this.nullptr] = [];
                        arr.push([rule, Filter.funRxFrom]);
                    } else {
                        var tmp = this.rules_to.get(rule.to);
                        if (tmp === undefined) {
                            tmp = {};
                            this.rules_to.set(rule.to, tmp);
                        }
                        var arr = tmp[rule.from];
                        if (arr === undefined)
                            arr = tmp[rule.from] = [];
                        arr.push([rule, Filter.funTrue]);
                    }
                } else if (to) {
                    if (to_mask) {
                        this.rules_mask.push([rule, Filter.funRxTo]);
                    } else {
                        var tmp = this.rules_to.get(rule.to);
                        if (tmp === undefined) {
                            tmp = {};
                            this.rules_to.set(rule.to, tmp);
                        }
                        var arr = tmp[this.nullptr];
                        if (arr === undefined)
                            arr = tmp[this.nullptr] = [];
                        arr.push([rule, Filter.funTrue]);
                    }
                } else {
                    if (from_mask) {
                        this.rules_mask.push([rule, Filter.funRxFrom]);
                    } else {
                        var tmp = this.rules_from.get(rule.from);
                        if (tmp === undefined) {
                            tmp = [];
                            this.rules_from.set(rule.from, tmp);
                        }
                        tmp.push([rule, Filter.funTrue]);
                    }
                }
            }
        }
    }

    static funTrue() {
        return true;
    }

    static funRx(rule, msg) {
        return Filter.rx(rule.to, msg.to, rule.cache[0]) && Filter.rx(rule.from, msg.from, rule.cache[1]);
    }

    static funRxFrom(rule, msg) {
        return Filter.rx(rule.from, msg.from, rule.cache[1]);
    }

    static funRxTo(rule, msg) {
        return Filter.rx(rule.to, msg.to, rule.cache[0]);
    }

    filter(messages) {
        var out = {};
        var msg_keys = Object.keys(messages);
        for (var msgi = msg_keys.length; msgi--;) {
            var msg = msg_keys[msgi];
            var res = this.rules_global.slice();

            var m = messages[msg];

            var tmp = this.rules_to.get(m.to);
            if (tmp !== undefined) {
                var tmp2 = tmp[this.nullptr];
                if (tmp2 !== undefined) {
                    for (var i = tmp2.length; i--;) {
                        if (tmp2[i][1](tmp2[i][0], m))
                            res.push(tmp2[i][0]);
                    }
                }

                tmp2 = tmp[m.from];
                if (tmp2 !== undefined) {
                    for (var i = tmp2.length; i--;) {
                        if (tmp2[i][1](tmp2[i][0], m))
                            res.push(tmp2[i][0]);
                    }
                }
            }

            tmp = this.rules_from.get(m.from);
            if (tmp !== undefined) {
                for (var i = tmp.length; i--;) {
                    if (tmp[i][1](tmp[i][0], m))
                        res.push(tmp[i][0]);
                }
            }

            for (var i = this.rules_mask.length; i--;) {
                if (this.rules_mask[i][1](this.rules_mask[i][0], m))
                    res.push(this.rules_mask[i][0]);
            }

            tmp = [];
            if (res.length > 0) {
                res.sort((a, b) => {
                    if (a.cache[2] < b.cache[2])
                        return -1;
                    if (a.cache[2] > b.cache[2])
                        return 1;
                    return 0;
                });

                for (var i = 0, ie = res.length; i < ie; ++i) {
                    tmp.push(res[i].action);
                }
            }
            out[msg] = tmp;
        }
        return out;
    }

    static newCacheRx(i, ie, pattern) {
        var tmp, tmp2, tmp3, ss, ti;
        if (pattern[i + 1] !== '?') {
            tmp = pattern.indexOf('?', i + 1);
            tmp2 = pattern.indexOf('*', i + 1);
            if (tmp >= 0 || tmp2 >= 0) {
                if (tmp < 0)
                    tmp = ie;
                if (tmp2 < 0)
                    tmp2 = ie;
                ss = pattern.substr(i + 1, (tmp < tmp2 ? tmp : tmp2) - i - 1);
            } else
                ss = pattern.substr(i + 1);
            ss = [0, ss]
        } else {
            tmp = 1;
            ti = i + 1;
            while (ti + 1 < ie && pattern[ti + 1] === '?') {
                tmp += 1;
                ti += 1;
            }

            if (ti + 1 < ie && pattern[ti + 1] === '*') {
                ti += 1;
                ss = [1, tmp];
            } else if (ti + 1 === ie) {
                ss = [3, tmp];
            } else {
                tmp2 = pattern.indexOf('?', ti + 1 + tmp);
                tmp3 = pattern.indexOf('*', ti + 1 + tmp);
                if (tmp2 >= 0 || tmp3 >= 0) {
                    if (tmp2 < 0)
                        tmp2 = ie;
                    if (tmp3 < 0)
                        tmp3 = ie;
                    ss = pattern.substr(ti + 1, (tmp2 < tmp3 ? tmp2 : tmp3) - ti - 1);
                } else {
                    ss = pattern.substr(ti + 1);
                }
                ss = [2, tmp, ss];
            }
        }
        return ss;
    }

    static rx(pattern, value, cache) {
        var i = 0;
        var ie = pattern.length;
        var vi = value.length;
        var offset = 0;
        var ch, ss, tmp;
        for (; i < ie; ++i) {
            if (offset >= vi) {
                if (pattern[i] === '*') {
                    while (i < ie) {
                        if (pattern[i++] !== '*')
                            return false;
                    }
                    return true;
                }
                return false;
            }

            ch = pattern[i];
            if (ch === '*') {
                if (i + 1 === ie)
                    return true;
                if (pattern[i + 1] === '*')
                    continue;
                ss = cache[i];
                if (ss === undefined) {
                    ss = cache[i] = Filter.newCacheRx(i, ie, pattern);
                }
                switch (ss[0]) {
                    case 0:
                        tmp = value.indexOf(ss[1], offset);
                        if (tmp < 0)
                            return false;
                        i += ss[1].length;
                        offset = tmp + ss[1].length;
                        break;
                    case 1:
                        i += ss[1];
                        offset += ss[1];
                        break;
                    case 2:
                        i += ss[1] + ss[2].length;
                        offset += ss[1];
                        tmp = value.indexOf(ss[2], offset);
                        if (tmp < 0)
                            return false;
                        offset = tmp + ss[2].length;
                        break;
                    case 3:
                        return ss[1] + offset <= vi;
                }
            } else if (ch === '?') {
                offset += 1;
            } else {
                if (ch !== value[offset])
                    return false;
                offset += 1;
            }
        }

        return i === ie && offset === vi;
    }
}

exports.filter = ((messages, rules) => {
    return (new Filter(rules)).filter(messages);
});
