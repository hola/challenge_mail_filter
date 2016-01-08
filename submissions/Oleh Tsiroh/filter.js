module.exports = filter;

function filter(messages, rules) {
    var from = {},
        to = {},
        names = {
            from: [],
            to: []
        },
        msgs = {};

    Object.keys(messages).forEach(function(msg) {
        names.to = atSeparating(messages[msg].to);
        names.from = atSeparating(messages[msg].from);
        createMaps(from, msg, names.from);
        createMaps(to, msg, names.to);
    });

    Object.keys(messages).forEach(function(msg) {
        msgs[msg] = [];
    });

    rules.forEach(function(rule) {
        if (rule.to) {
            names.to = atSeparating(rule.to);
        }
        if (rule.from) {
            names.from = atSeparating(rule.from);
        }
        if (rule.hasOwnProperty('from') && rule.hasOwnProperty('to')) {
            if (isSimple(rule.from)) {
                rulesForBoth(names.from[1], names.from[0], rule, names, msgs);
            } else {
                if (isSimple(names.from[1])) {
                    Object.keys(from[names.from[1]]).forEach(function(name) {
                        if (regexpMatch(name, names.from[0])) {
                            rulesForBoth(names.from[1], name, rule, names, msgs);
                        }
                    })
                } else if (isSimple(names.from[0])) {
                    Object.keys(from).forEach(function(email) {
                        if (regexpMatch(email, names.from[1])) {
                            rulesForBoth(email, names.from[0], rule, names, msgs);
                        }
                    })
                } else {
                    Object.keys(from).forEach(function(email) {
                        if (regexpMatch(email, names.from[1])) {
                            Object.keys(from[email]).forEach(function(name) {
                                if (regexpMatch(name, names.from[0])) {
                                    rulesForBoth(email, name, rule, names, msgs);
                                }
                            })
                        }
                    })
                }
            }
        } else if (rule.hasOwnProperty('from')) {
            rulesForOne(rule, from, 'from', names, msgs);
        } else if (rule.hasOwnProperty('to')) {
            rulesForOne(rule, to, 'to', names, msgs);
        } else {
            Object.keys(msgs).forEach(function(msg) {
                msgs[msg].push(rule.action);
            })
        }
    });

    return msgs;

    function regexpMatch(string, rule) {
        var regexp = regexpSymbolsChanging(rule);
        regexp = regexp.replace(/\?/g, '.');
        regexp = new RegExp('^' + regexp + '$');
        return string.match(regexp);
    }

    function regexpSymbolsChanging(rule) {
        var regexpSymbols = ['\\', '.', '!', '$', '+', '=', '^', '{', '|', '}', '(', ')', ',', ':', '[', ']'];
        var regedRule = rule;
        regexpSymbols.forEach(function(symbol) {
            regedRule = regedRule.replace(new RegExp('\\' + symbol, 'g'), '\\' + symbol);
        });
        regedRule = regedRule.replace(/\*/g, '.*');
        return regedRule;
    }

    function atSeparating(email) {
        var array = email.split('@');
        var length = array.length;
        var name = '';
        if (length > 2) {
            for (var i = 0; i < length - 1; i++) {
                name += array[i];
                if (i !== length - 2) {
                    name += '@';
                }
            }
            return [name, array[length - 1]];
        } else {
            return array;
        }
    }

    function isSimple(rule) {
        return !(rule.indexOf('*') + 1) && !(rule.indexOf('?') + 1);
    }

    function createMaps(name, msg, key) {
        if (!name[key[1]]) {
            name[key[1]] = {};
        }
        if (!name[key[1]][key[0]]) {
            name[key[1]][key[0]] = [];
        }
        name[key[1]][key[0]].push(msg);
    }

    function rulesForBoth(first, second, rule, names, msgs) {
        if (from[first][second]) {
            from[first][second].forEach(function(msg) {
                if (isSimple(rule.to)) {
                    if (to[names.to[1]][names.to[0]].indexOf(msg) + 1) {
                        msgs[msg].push(rule.action);
                    }
                } else {
                    if (isSimple(names.to[1])) {
                        Object.keys(to[names.to[1]]).forEach(function(name) {
                            if (regexpMatch(name, names.to[0])) {
                                if (to[names.to[1]][name].indexOf(msg) + 1) {
                                    msgs[msg].push(rule.action);
                                }
                            }
                        })
                    } else if (isSimple(names.to[0])) {
                        Object.keys(to).forEach(function(email) {
                            if (regexpMatch(email, names.to[1])) {
                                if (to[email][names.to[0]].indexOf(msg) + 1) {
                                    msgs[msg].push(rule.action);
                                }
                            }
                        })
                    } else {
                        Object.keys(to).forEach(function(email) {
                            if (regexpMatch(email, names.to[1])) {
                                Object.keys(to[email]).forEach(function(name) {
                                    if (regexpMatch(name, names.to[0])) {
                                        if (to[email][name].indexOf(msg) + 1) {
                                            msgs[msg].push(rule.action);
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    }

    function rulesForOne(rule, obj, objName, names, msgs) {
        if (isSimple(rule[objName])) {
            if (obj[names[objName][1]][names[objName][0]]) {
                obj[names[objName][1]][names[objName][0]].forEach(function(msg) {
                    msgs[msg].push(rule.action);
                })
            }
        } else if (isSimple(names[objName][1])) {
            Object.keys(obj[names[objName][1]]).forEach(function(name) {
                if (regexpMatch(name, names[objName][0]) && obj[names[objName][1]][name]) {
                    obj[names[objName][1]][name].forEach(function(msg) {
                        msgs[msg].push(rule.action);
                    })
                }
            })
        } else if (isSimple(names[objName][0])) {
            Object.keys(obj).forEach(function(email) {
                if (regexpMatch(email, names[objName][1]) && obj[email][names[objName][0]]) {
                    obj[email][names[objName][0]].forEach(function(msg) {
                        msgs[msg].push(rule.action);
                    })
                }
            })
        } else {
            Object.keys(obj).forEach(function(email) {
                if (regexpMatch(email, names[objName][1])) {
                    Object.keys(obj[email]).forEach(function(name) {
                        if (regexpMatch(name, names[objName][0]) && obj[email][name]) {
                            obj[email][name].forEach(function(msg) {
                                msgs[msg].push(rule.action);
                            })
                        }
                    })
                }
            })
        }
    }
}