"use strict";

const WILD = RegExp("");
const TRANSFORM = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\x09', '\x0a', '\x0b', '\x0c', '\x0d', '\x0e', '\x0f', '\x10', '\x11', '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1a', '\x1b', '\x1c', '\x1d', '\x1e', '\x1f', '\x20', '\x21', '\x22', '\x23', '\\\x24', '\x25', '\x26', '\x27', '\\\x28', '\\\x29', '.*', '\\\x2b', '\x2c', '\\\x2d', '\\\x2e', '\\\x2f', '\x30', '\x31', '\x32', '\x33', '\x34', '\x35', '\x36', '\x37', '\x38', '\x39', '\x3a', '\x3b', '\x3c', '\x3d', '\x3e', '.', '\x40', '\x41', '\x42', '\x43', '\x44', '\x45', '\x46', '\x47', '\x48', '\x49', '\x4a', '\x4b', '\x4c', '\x4d', '\x4e', '\x4f', '\x50', '\x51', '\x52', '\x53', '\x54', '\x55', '\x56', '\x57', '\x58', '\x59', '\x5a', '\\\x5b', '\\\x5c', '\\\x5d', '\\\x5e', '\x5f', '\x60', '\x61', '\x62', '\x63', '\x64', '\x65', '\x66', '\x67', '\x68', '\x69', '\x6a', '\x6b', '\x6c', '\x6d', '\x6e', '\x6f', '\x70', '\x71', '\x72', '\x73', '\x74', '\x75', '\x76', '\x77', '\x78', '\x79', '\x7a', '\\\x7b', '\\\x7c', '\\\x7d', '\x7e', '\x7f', '\x80', '\x81', '\x82', '\x83', '\x84', '\x85', '\x86', '\x87', '\x88', '\x89', '\x8a', '\x8b', '\x8c', '\x8d', '\x8e', '\x8f', '\x90', '\x91', '\x92', '\x93', '\x94', '\x95', '\x96', '\x97', '\x98', '\x99', '\x9a', '\x9b', '\x9c', '\x9d', '\x9e', '\x9f', '\xa0', '\xa1', '\xa2', '\xa3', '\xa4', '\xa5', '\xa6', '\xa7', '\xa8', '\xa9', '\xaa', '\xab', '\xac', '\xad', '\xae', '\xaf', '\xb0', '\xb1', '\xb2', '\xb3', '\xb4', '\xb5', '\xb6', '\xb7', '\xb8', '\xb9', '\xba', '\xbb', '\xbc', '\xbd', '\xbe', '\xbf', '\xc0', '\xc1', '\xc2', '\xc3', '\xc4', '\xc5', '\xc6', '\xc7', '\xc8', '\xc9', '\xca', '\xcb', '\xcc', '\xcd', '\xce', '\xcf', '\xd0', '\xd1', '\xd2', '\xd3', '\xd4', '\xd5', '\xd6', '\xd7', '\xd8', '\xd9', '\xda', '\xdb', '\xdc', '\xdd', '\xde', '\xdf', '\xe0', '\xe1', '\xe2', '\xe3', '\xe4', '\xe5', '\xe6', '\xe7', '\xe8', '\xe9', '\xea', '\xeb', '\xec', '\xed', '\xee', '\xef', '\xf0', '\xf1', '\xf2', '\xf3', '\xf4', '\xf5', '\xf6', '\xf7', '\xf8', '\xf9', '\xfa', '\xfb', '\xfc', '\xfd', '\xfe', '\xff']

function to_regex_pure(expr) {
    var s = "^";
    var l = expr.length;
    for (var i = 0; i < l; i += 1) {
        s += TRANSFORM[expr.charCodeAt(i)];
    }
    return s+"$";
}

function to_regex(expr) {
    if (expr == undefined)
        return WILD;
    var s = "^";
    var l = expr.length;
    for (var i = 0; i < l; i += 1) {
        s += TRANSFORM[expr.charCodeAt(i)];
    }
    return RegExp(s+"$");
}

function filter_lite_hybrid(msgs, filters) {
    let filtered = {};
    let easy_msgs = [];
    let easy_filtered = [];
    let c = 0;
    for (const idx in filters) {
        const filter = filters[idx];
        const f = filter.from;
        const t = filter.to;
        const a = filter.action;
        let append_actions;
        
        if (f != undefined) {
            if (t != undefined) {
                append_actions = eval(["\"use strict\";(function(f,t,l,s){if(/", to_regex_pure(f), "/.test(f)&&/",to_regex_pure(t),"/.test(t))l.push(s[", idx,"].action);})"].join(""));
            } else {
                append_actions = eval(["\"use strict\";(function(f,t,l,s){if(/", to_regex_pure(f), "/.test(f))l.push(s[", idx,"].action);})"].join(""));
            }
        } else {
            if (t != undefined) {
                append_actions = eval(["\"use strict\";(function(f,t,l,s){if(/", to_regex_pure(t), "/.test(t))l.push(s[", idx, "].action);})"].join(""));
            } else {
                append_actions = eval(["\"use strict\";(function(f,t,l,s){l.push(s[", idx,"].action);})"].join(""));
            }
        }

        if (c == 0) {
            for (var key in msgs) {
                let msg;
                let l;
                easy_filtered.push(l = filtered[key] = []);
                easy_msgs.push(msg = msgs[key]);
                c += 1;
                append_actions(msg.from,msg.to,l,filters);
            };
        } else {
            for (var i = 0; i < c; ++i) {
                const msg = easy_msgs[i];
                append_actions(msg.from,msg.to,easy_filtered[i],filters);
            };
        }
    };
    return filtered;
}

function filter_naive_hybrid(msgs, filters) {
    let filters_funcs = [];
    for (let idx in filters) {
        const filter = filters[idx];
        const f = filter.from;
        const t = filter.to;
        const a = filter.action;
        
        if (f != undefined) {
            if (t != undefined) {
                filters_funcs.push(eval(["\"use strict\";(function(f,t,l,s){if(/", to_regex_pure(f), "/.test(f)&&/",to_regex_pure(t),"/.test(t))l.push(s[", idx,"].action);})"].join("")));
            } else {
                filters_funcs.push(eval(["\"use strict\";(function(f,t,l,s){if(/", to_regex_pure(f), "/.test(f))l.push(s[", idx,"].action);})"].join("")));
            }
        } else {
            if (t != undefined) {
                filters_funcs.push(eval(["\"use strict\";(function(f,t,l,s){if(/", to_regex_pure(t), "/.test(t))l.push(s[", idx, "].action);})"].join("")));
            } else {
                filters_funcs.push(eval(["\"use strict\";(function(f,t,l,s){l.push(s[", idx,"].action);})"].join("")));
            }
        }
    };

    let filtered = {};
    for (let key in msgs) {
        const msg = msgs[key];
        let l = filtered[key] = [];
        for (let idx in filters_funcs) {
            filters_funcs[idx](msg.from, msg.to, l, filters);
        };
    };

    return filtered;
}

function filter_heavy(msgs, filters) {
    let append_actions_body = ["\"use strict\";(function(f,t,l,s){"];
    
    for (const idx in filters) {
        const filter = filters[idx];
        const f = filter.from;
        const t = filter.to;
        const a = filter.action;
        if (f != undefined) {
            if (t != undefined) {
                append_actions_body.push("if(/", to_regex_pure(f), "/.test(f)&&/", to_regex_pure(t), "/.test(t))l.push(s[", idx, "].action);");
            } else {
                append_actions_body.push("if(/", to_regex_pure(f), "/.test(f))l.push(s[", idx, "].action);");
            }
        } else {
            if (t != undefined) {
                append_actions_body.push("if(/", to_regex_pure(t), "/.test(t))l.push(s[", idx, "].action);");
            } else {
                append_actions_body.push("l.push(s[", idx, "].action);");
            }
        }
    };
    append_actions_body.push("})");
    const append_actions = eval(append_actions_body.join(""));

    let filtered = {};
    for (let key in msgs) {
        const msg = msgs[key];
        append_actions(msg.from, msg.to, filtered[key] = [], filters);
    };

    return filtered;
}

function filter_lite(msgs, filters) {
    let filtered = {};
    let easy_msgs = [];
    let easy_filtered = [];
    let c = 0;
    filters.forEach(function (filter) {
        const f = to_regex(filter["from"]);
        const t = to_regex(filter["to"]);
        const a = filter["action"];
        if (c == 0) {
            for (var key in msgs) {
                let msg;
                let l;
                easy_filtered.push(l = filtered[key] = []);
                easy_msgs.push(msg = msgs[key]);
                c += 1;
                if (f.test(msg["from"]) && t.test(msg["to"]))
                    l.push(a);
            };
        } else {
            for (var i = 0; i < c; ++i) {
                const msg = easy_msgs[i];
                if (f.test(msg["from"]) && t.test(msg["to"]))
                    easy_filtered[i].push(a);
            };
        }
    });
    return filtered;
}

function filter_naive(msgs, filters) {
    var filters_regex = [];
    filters.forEach(function (filter) {
        filters_regex.push({ from: to_regex(filter.from), to: to_regex(filter.to), action: filter.action });
    });

    var filtered = {};
    for (var key in msgs) {
        const msg = msgs[key];
        filtered[key] = [];
        filters_regex.forEach(function (filter) {
            if (filter.from.test(msg.from) && filter.to.test(msg.to))
                filtered[key].push(filter.action);
        });
    };

    return filtered;
}

function filter(msgs, filters) {
    const m = Object.keys(msgs).length;
    const f = filters.length;

    if (m < 150)
        return filter_naive(msgs, filters);
    else if (f < 110)
        if ((m-650) > f*5)
            return filter_naive(msgs, filters);
        else
            return filter_heavy(msgs, filters);
    else {
        if (f == 0) {
            let filtered = {};
            for (var key in msgs) {
                filtered[key] = [];
            }
            return filtered;
        }
        if ((1500 - mc/3) < f && (1600 - mc/6) > f)
            return filter_lite_hybrid(msgs, filters);
        else
            return filter_lite(msgs, filters);
    }
}

module.exports = filter;
