#!/usr/bin/env node
// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');

function compile(filename){
    var text = fs.readFileSync(filename, 'utf8');
    return new vm.Script(text, {filename: filename});
}

function run_filter(script, messages, rules, expected){
    var id = '__hola_xyzzy__';
    var m = {exports: {}};
    var context = vm.createContext({
        module: m,
        exports: m.exports,
        console: console,
        process: {arch: process.arch}, // used by one solution
        Buffer: Buffer,
    });
    context.global = context;
    Object.defineProperty(context, id, {
        value: vm.runInContext('('+JSON.stringify(
            {messages: messages, rules: rules})+')', context)});
    script.runInContext(context);
    var expr;
    if (typeof m.exports.filter=='function')
        expr = 'module.exports.filter';
    else if (typeof m.exports=='function')
        expr = 'module.exports';
    else
        throw new Error('Function filter not found');
    vm.runInContext(id+'.res = '+expr+'('+id+'.messages, '+id+'.rules)',
        context);
    var time2 = Date.now();
    var res = JSON.parse(vm.runInContext('JSON.stringify('+id+'.res)',
        context));
    assert.deepStrictEqual(res, expected);
}

function test_glob(script, glob, yes, no){
    var i, n = 0;
    var rules = [{from: glob, action: 'x'}];
    var messages = {}, expected = {};
    for (i = 0; i<yes.length; i++, n++)
    {
        messages['y'+n] = {from: yes[i], to: 'z'};
        expected['y'+n] = ['x'];
    }
    for (i = 0; i<no.length; i++, n++)
    {
        messages['n'+n] = {from: no[i], to: 'z'};
        expected['n'+n] = [];
    }
    test_full(script, messages, rules, expected);
}

function test_rule(script, message, rule, match){
    var r = {action: 'x'};
    if (rule.from)
        r.from = rule.from;
    if (rule.to)
        r.to = rule.to;
    test_full(script, {m: message}, [r], {m: match ? ['x'] : []});
}

function test_full(script, messages, rules, expected, contrib_name){
    try {
        run_filter(script, messages, rules, expected);
    } catch(e){
        if (contrib_name)
            console.log('Contrib test failed:', contrib_name);
        console.log('Messages:', messages);
        console.log('Rules:', rules);
        if (e instanceof assert.AssertionError)
        {
            console.log('Expected:', e.expected);
            console.log('Actual:', e.actual);
        }
        else
        {
            console.log(e.stack);
        }
        throw e;
    }
}

// Thanks to Roman Pletnev for contributing the test suite below
var contrib = {
    test_default: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org',
                action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ],
        expected: {
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'forward to jill@elsewhere.com'],
            msg3: ['tag work']
        }
    },
    test_default_2: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org',
                action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ],
        expected: {
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'tag spam', 'tag spam', 'tag spam',
                 'forward to jill@elsewhere.com'],
            msg3: ['tag work']
        }
    },
    test_1: {
        messages: {},
        rules: [
            {from: "*@work.com", action: "tag work"},
            {from: "*@spam.com", action: "tag spam"},
            {from: "jack@example.com", to: "jill@example.org",
                action: "folder jack"},
            {to: "jill@example.org", action: "forward to jill@elsewhere.com"}
        ],
        expected: {}
    },
    test_2: {
        messages: {
            msg1: {from: "jack@example.com", to: "jill@example.org"},
            msg2: {from: "noreply@spam.com", to: "jill@example.org"},
            msg3: {from: "boss@work.com", to: "jack@example.com"}
        },
        rules: [],
        expected: {msg1: [], msg2: [], msg3: []}
    },
    test_3: {
        messages: {
            msg1: {from: "jack@example.com", to: "jill@example.org"},
            msg2: {from: "noreply@spam.com", to: "jill@example.org"},
            msg3: {from: "boss@work.com", to: "jack@example.com"}
        },
        rules: [{from: "*@work.com", action: "tag work"}],
        expected: {msg1: [], msg2: [], msg3: ["tag work"]}
    },
    test_4: {
        messages: {
            msg1: {from: "jack@example.com", to: "jill@example.org"},
            msg2: {from: "noreply@spam.com", to: "jill@example.org"},
            msg3: {from: "boss@work.com", to: "jack@example.com"}
        },
        rules: [{from: "*?work.com", action: "tag work"}],
        expected: {msg1: [], msg2: [], msg3: ["tag work"]}
    },
    test_5: {
        messages: {
            msg1: {from: "jack@example.com", to: "jill@example.org"},
            msg2: {from: "noreply@spam.com", to: "jill@example.org"},
            msg3: {from: "boss@work.com", to: "jack@example.com"}
        },
        rules: [{from: "*?wor?.co?", action: "tag work"}],
        expected: {msg1: [], msg2: [], msg3: ["tag work"]}
    },
    test_6: {
        messages: {
            msg1: {from: "abaabaaba", to: "jill@example.org"},
            msg2: {from: "aba", to: "jill@example.org"},
            msg3: {from: "d;rflkght", to: "jack@example.com"}
        },
        rules: [{from: "*a*b*", action: "tag"}],
        expected: {msg1: ["tag"], msg2: ["tag"], msg3: []}
    },
    test_7: {
        messages: {
            msg1: {from: "abaabaaba", to: "jill@example.org"},
            msg2: {from: "aba", to: "jill@example.org"},
            msg3: {from: "d;rflkght", to: "jack@example.com"}
        },
        rules: [{from: "*", action: "tag"}],
        expected: {msg1: ["tag"], msg2: ["tag"], msg3: ["tag"]}
    },
    test_8: {
        messages: {
            msg1: {from: "abaabaaba", to: "jill@example.org"},
            msg2: {from: "aba", to: "jill@example.org"},
            msg3: {from: "d;rflkght", to: "jack@example.com"}
        },
        rules: [
            {from: "abaabaab*", action: "tag1"},
            {from: "abaabaaba*?", action: "tag2"},
            {from: "abaabaab*?*", action: "tag3"}
        ],
        expected: {msg1: ["tag1", "tag3"], msg2: [], msg3: []}
    },
    test_9: {
        messages: {
            msg1: {from: "jack@example.com", to: "jill@example.org"},
            msg2: {from: "noreply@spam.com", to: "jill@example.org"},
            msg3: {from: "boss@work.com", to: "jack@example.com"}
        },
        rules: [
            {from: "*", action: "tag1"},
            {from: "**", action: "tag2"},
            {from: "***", action: "tag3"},
            {from: "*jack@example.com", action: "tag4"},
            {from: "jack@example.com*", action: "tag5"},
            {from: "**jack@**.com**", action: "tag6"},
            {from: "**@**.c*m**", action: "tag7"}
        ],
        expected: {
            msg1: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7"],
            msg2: ["tag1", "tag2", "tag3", "tag7"],
            msg3: ["tag1", "tag2", "tag3", "tag7"]
        }
    },
    test_10: {
        messages: {
            msg1: {from: "jack@example.com", to: "jill@example.org"},
            msg2: {from: "noreply@spam.com", to: "jill@example.org"},
            msg3: {from: "boss@work.com", to: "jack@example.com"}
        },
        rules: [
            {from: "?", action: "tag1"},
            {from: "????????????????", action: "tag2"},
            {from: "????@???????????", action: "tag3"},
            {from: "????*???????????", action: "tag4"},
            {from: "?*?", action: "tag5"},
            {from: "*?*", action: "tag6"},
            {from: "?*??**?", action: "tag6"},
            {from: "?????????????????", action: "tag7"},
            {from: "???????????????*?", action: "tag8"}
        ],
        expected: {
            msg1: ["tag2", "tag3", "tag4", "tag5", "tag6", "tag6", "tag8"],
            msg2: ["tag2", "tag4", "tag5", "tag6", "tag6", "tag8"],
            msg3: ["tag5", "tag6", "tag6"]
        }
    },
    test_11: {
        messages: {msg1: {from: " @ ", to: " @ "}},
        rules: [{from: "???", action: "tag sp"}],
        expected: {msg1: ["tag sp"]}
    },
    test_12: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "ok", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_13: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_14: {
        messages: {msg1: {from: "_ok", to: "a"}},
        rules: [{from: "ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_15: {
        messages: {msg1: {from: "!ok", to: "a"}},
        rules: [{from: "ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_16: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "ok*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_17: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "ok*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_18: {
        messages: {msg1: {from: "ok__", to: "a"}},
        rules: [{from: "ok*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_19: {
        messages: {msg1: {from: "_ok", to: "a"}},
        rules: [{from: "ok*", action: "ok"}],
        expected: {msg1: []}
    },
    test_20: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "*ok", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_21: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "*ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_22: {
        messages: {msg1: {from: "_ok", to: "a"}},
        rules: [{from: "*ok", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_23: {
        messages: {msg1: {from: "__ok", to: "a"}},
        rules: [{from: "*ok", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_24: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_25: {
        messages: {msg1: {from: "2", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_26: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_27: {
        messages: {msg1: {from: "_12", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_28: {
        messages: {msg1: {from: "12_", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_29: {
        messages: {msg1: {from: "1_2", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_30: {
        messages: {msg1: {from: "1__2", to: "a"}},
        rules: [{from: "1*2", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_31: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_32: {
        messages: {msg1: {from: "2", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_33: {
        messages: {msg1: {from: "3", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_34: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_35: {
        messages: {msg1: {from: "23", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_36: {
        messages: {msg1: {from: "_123", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_37: {
        messages: {msg1: {from: "123_", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_38: {
        messages: {msg1: {from: "_123_", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: []}
    },
    test_39: {
        messages: {msg1: {from: "1_23", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_40: {
        messages: {msg1: {from: "12_3", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_41: {
        messages: {msg1: {from: "1_2_3", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_42: {
        messages: {msg1: {from: "1__23", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_43: {
        messages: {msg1: {from: "1_2__3", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_44: {
        messages: {msg1: {from: "1__2__3", to: "a"}},
        rules: [{from: "1*2*3", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_45: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "ok?", action: "ok"}],
        expected: {msg1: []}
    },
    test_46: {
        messages: {msg1: {from: "_ok", to: "a"}},
        rules: [{from: "ok?", action: "ok"}],
        expected: {msg1: []}
    },
    test_47: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "ok?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_48: {
        messages: {msg1: {from: "ok__", to: "a"}},
        rules: [{from: "ok?", action: "ok"}],
        expected: {msg1: []}
    },
    test_49: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "?ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_50: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "?ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_51: {
        messages: {msg1: {from: "_ok", to: "a"}},
        rules: [{from: "?ok", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_52: {
        messages: {msg1: {from: "__ok", to: "a"}},
        rules: [{from: "?ok", action: "ok"}],
        expected: {msg1: []}
    },
    test_53: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "ok*?", action: "ok"}],
        expected: {msg1: []}
    },
    test_54: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "ok*?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_55: {
        messages: {msg1: {from: "ok__", to: "a"}},
        rules: [{from: "ok*?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_56: {
        messages: {msg1: {from: "ok___", to: "a"}},
        rules: [{from: "ok*?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_57: {
        messages: {msg1: {from: "__ok", to: "a"}},
        rules: [{from: "ok*?", action: "ok"}],
        expected: {msg1: []}
    },
    test_58: {
        messages: {msg1: {from: "ok", to: "a"}},
        rules: [{from: "ok?*", action: "ok"}],
        expected: {msg1: []}
    },
    test_59: {
        messages: {msg1: {from: "ok_", to: "a"}},
        rules: [{from: "ok?*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_60: {
        messages: {msg1: {from: "ok__", to: "a"}},
        rules: [{from: "ok?*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_61: {
        messages: {msg1: {from: "ok___", to: "a"}},
        rules: [{from: "ok?*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_62: {
        messages: {msg1: {from: "__ok", to: "a"}},
        rules: [{from: "ok?*", action: "ok"}],
        expected: {msg1: []}
    },
    test_63: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_64: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_65: {
        messages: {msg1: {from: "_12", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_66: {
        messages: {msg1: {from: "12_", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_67: {
        messages: {msg1: {from: "1_2", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_68: {
        messages: {msg1: {from: "1__2", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_69: {
        messages: {msg1: {from: "_1_2", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_70: {
        messages: {msg1: {from: "1_2_", to: "a"}},
        rules: [{from: "1?2", action: "ok"}],
        expected: {msg1: []}
    },
    test_71: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_72: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_73: {
        messages: {msg1: {from: "_12", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_74: {
        messages: {msg1: {from: "12_", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_75: {
        messages: {msg1: {from: "1_2", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_76: {
        messages: {msg1: {from: "1__2", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_77: {
        messages: {msg1: {from: "_1_2", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_78: {
        messages: {msg1: {from: "1_2_", to: "a"}},
        rules: [{from: "1??2", action: "ok"}],
        expected: {msg1: []}
    },
    test_79: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "*?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_80: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "*?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_81: {
        messages: {msg1: {from: "123", to: "a"}},
        rules: [{from: "*?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_82: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "*??", action: "ok"}],
        expected: {msg1: []}
    },
    test_83: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "*??", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_84: {
        messages: {msg1: {from: "123", to: "a"}},
        rules: [{from: "*??", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_85: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "*?*?***?", action: "ok"}],
        expected: {msg1: []}
    },
    test_86: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "*?*?***?", action: "ok"}],
        expected: {msg1: []}
    },
    test_87: {
        messages: {msg1: {from: "123", to: "a"}},
        rules: [{from: "*?*?***?", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_88: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "*1*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_89: {
        messages: {msg1: {from: "_1", to: "a"}},
        rules: [{from: "*1*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_90: {
        messages: {msg1: {from: "1_", to: "a"}},
        rules: [{from: "*1*", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_91: {
        messages: {msg1: {from: "2", to: "a"}},
        rules: [{from: "*1*", action: "ok"}],
        expected: {msg1: []}
    },
    test_92: {
        messages: {msg1: {from: "1", to: "a"}},
        rules: [{from: "*1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_93: {
        messages: {msg1: {from: "_1", to: "a"}},
        rules: [{from: "*1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_94: {
        messages: {msg1: {from: "12", to: "a"}},
        rules: [{from: "*1*2", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_95: {
        messages: {msg1: {from: "2", to: "a"}},
        rules: [{from: "*1*2", action: "ok"}],
        expected: {msg1: []}
    },
    test_96: {
        messages: {msg1: {from: "(sender)", to: "a"}},
        rules: [{from: "(sender)", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_97: {
        messages: {msg1: {from: "{sender}", to: "a"}},
        rules: [{from: "{sender}", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_98: {
        messages: {msg1: {from: "[sender]", to: "a"}},
        rules: [{from: "[sender]", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_99: {
        messages: {msg1: {from: "[sender]", to: "a"}},
        rules: [{from: "[rednes]", action: "ok"}],
        expected: {msg1: []}
    },
    test_100: {
        messages: {msg1: {from: "$ender", to: "a"}},
        rules: [{from: "$ender", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_101: {
        messages: {msg1: {from: "^", to: "a"}},
        rules: [{from: "^", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_102: {
        messages: {msg1: {from: "|", to: "a"}},
        rules: [{from: "|", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    test_103: {
        messages: {msg1: {from: "ab", to: "a"}},
        rules: [{from: "a|b", action: "ok"}],
        expected: {msg1: []}
    },
    test_104: {
        messages: {msg1: {from: "+", to: "a"}},
        rules: [{from: "+", action: "ok"}],
        expected: {msg1: ["ok"]}
    },
    optional_rule_parts: {
        messages: {
            msg1: {from: 'a', to: 'b'},
            msg2: {from: 'a', to: '_'},
            msg3: {from: '_', to: 'b'},
            msg4: {from: '_', to: '_'}
        },
        rules: [
            {from: 'a', to: 'b', action: 'from & to'},
            {from: 'a', action: 'from only'},
            {to: 'b', action: 'to only'},
            {action: 'empty rule'}
        ],
        expected: {
            msg1: ['from & to', 'from only', 'to only', 'empty rule'],
            msg2: ['from only', 'empty rule'],
            msg3: ['to only', 'empty rule'],
            msg4: ['empty rule']}
    },
    simple_tests: {
        messages: {
            msg1: {from: '1ab2ab@bac', to: 'a'},
            msg2: {from: '1ab2aba3', to: 'a'},
            msg3: {from: 'ab2ab@bac', to: 'a'},
            msg4: {from: 'abaabaaba', to: 'a'}

        },
        rules: [
            {from: '?ab?ab**a?*', action: 'ok1'},
            {from: '?@', action: 'ok2'},
            {from: 'abaabaaba*?', action: 'ok3'},
            {from: 'abaabaab*', action: 'ok4'},
            {from: '******', action: 'ok5'},
        ],
        expected: {
            msg1: ['ok1', 'ok5'],
            msg2: ['ok1', 'ok5'],
            msg3: ['ok5'],
            msg4: ['ok4', 'ok5']
        }
    },
    one_asterisk: {
        messages: {
            msg1: {from: 'abc_def', to: 'a'},
            msg2: {from: '_abcdef', to: 'a'},
            msg3: {from: 'abcdef_', to: 'a'},
            msg4: {from: 'abcdef', to: 'a'},
            msg5: {from: 'abc_____def', to: 'a'},
        },
        rules: [
            {from: '*abcdef', action: 'pre *'},
            {from: 'abc*def', action: 'inside *'},
            {from: 'abcdef*', action: 'post *'},
            {from: 'abc***def', action: 'multi-total-asterisks'}
        ],
        expected: {
            msg1: ['inside *', 'multi-total-asterisks'],
            msg2: ['pre *'],
            msg3: ['post *'],
            msg4: ['pre *', 'inside *', 'post *', 'multi-total-asterisks'],
            msg5: ['inside *', 'multi-total-asterisks']
        }
    },
    two_stars_index_of: {
        messages: {
            msg1: {from: '_abc_', to: 'a'},
            msg2: {from: '__abc____', to: 'a'},
            msg3: {from: 'abc', to: 'a'}
        },
        rules: [
            {from: '*abc*', action: 'ok1'},
            {from: '***abc****', action: 'ok2'},
            {from: 'abc', action: 'ok3'},
        ],
        expected: {
            msg1: ['ok1', 'ok2'],
            msg2: ['ok1', 'ok2'],
            msg3: ['ok1', 'ok2', 'ok3']
        }
    },
    forward_scan: {
        messages: {
            msg1: {from: '_abc_def_ghi_', to: 'a'},
            msg2: {from: '_abc_def_ghi', to: 'a'},
            msg3: {from: 'abc_def_ghi_', to: 'a'},
            msg4: {from: 'abc_def_ghi', to: 'a'},
        },
        rules: [
            {from: '*abc*def*ghi*', action: 'pre & post *'},
            {from: '*abc*def*ghi', action: 'pre *'},
            {from: 'abc*def*ghi*', action: 'post *'},
            {from: 'abc*def*ghi', action: 'inside *'},
        ],
        expected: {
            msg1: ['pre & post *'],
            msg2: ['pre & post *', 'pre *'],
            msg3: ['pre & post *', 'post *'],
            msg4: ['pre & post *', 'pre *', 'post *', 'inside *']
        }
    },
    full_scan_token_collision: {
        messages: {
            msg1: {from: '_abc___abc_abc', to: 'a'},
            msg2: {from: '_abc_abc___abc', to: 'a'},
            msg3: {from: '_abc_abc____abc___abc____abc_abc', to: 'a'},
        },
        rules: [
            {from: '*abc?abc', action: 'collision1'},
            {from: '*abc???abc', action: 'collision2'},
            {from: '*abc???abc*abc?abc', action: 'collision3'}
        ],
        expected: {
            msg1: ['collision1'],
            msg2: ['collision2'],
            msg3: ['collision1', 'collision3']
        }
    },
    full_scan_tails: {
        messages: {
            msg1: {from: '__abcdef_def_', to: 'a'},
            msg2: {from: '_abc_def_def_', to: 'a'},
            msg3: {from: '_abc_____def_', to: 'a'},
            msg4: {from: '_abc_____def___', to: 'a'},
            msg5: {from: '_abc_def_def__', to: 'a'},
            msg6: {from: '_abc_def__', to: 'a'},
            msg7: {from: '__abc_def_', to: 'a'}
        },
        rules: [
            {from: '*abc?*def?def?', action: 'fixed tail'},
            {from: '*abc?*def?def?*', action: 'floating tail'},
            {from: '*abc?def??*', action: 'floating tail with offset'}
        ],
        expected: {
            msg1: [],
            msg2: ['fixed tail', 'floating tail', 'floating tail with offset'],
            msg3: [],
            msg4: [],
            msg5: ['floating tail', 'floating tail with offset'],
            msg6: ['floating tail with offset'],
            msg7: []
        }
    },
    cache: {
        messages: {
            msg1: {from: '__abcdef_def_', to: 'a'},
            msg2: {from: '_abc_def_def_', to: 'a'},
            msg3: {from: '_abc_____def_', to: 'a'},
            msg4: {from: '_abc_____def___', to: 'a'},
            msg5: {from: '_abc_def_def__', to: 'a'},
            msg6: {from: '_abc_def__', to: 'a'},
            msg7: {from: '__abc_def_', to: 'a'},
            msg8: {from: '__abcdef_def_', to: 'a'},
            msg9: {from: '_abc_def_def_', to: 'a'},
            msg10: {from: '_abc_____def_', to: 'a'},
            msg11: {from: '_abc_____def___', to: 'a'},
            msg12: {from: '_abc_def_def__', to: 'a'},
            msg13: {from: '_abc_def__', to: 'a'},
            msg14: {from: '__abc_def_', to: 'a'}
        },
        rules: [
            {from: '*abc?*def?def?', action: 'fixed tail'},
            {from: '*abc?*def?def?*', action: 'floating tail'},
            {from: '*abc?def??*', action: 'floating tail with offset'}
        ],
        expected: {
            msg1: [],
            msg2: ['fixed tail', 'floating tail', 'floating tail with offset'],
            msg3: [],
            msg4: [],
            msg5: ['floating tail', 'floating tail with offset'],
            msg6: ['floating tail with offset'],
            msg7: [],
            msg8: [],
            msg9: ['fixed tail', 'floating tail', 'floating tail with offset'],
            msg10: [],
            msg11: [],
            msg12: ['floating tail', 'floating tail with offset'],
            msg13: ['floating tail with offset'],
            msg14: []
        }
    },
    short_circuits: {
        messages: {
            msg1: {from: 'a', to: 'b'}
        },
        rules: [
            {from: '*', to: '*', action: 'one'},
            {action: 'two'}
        ],
        expected: {msg1: ['one', 'two']}
    },
    no_letters: {
        messages: {
            msg1: {from: 'abcdef', to: 'b'}
        },
        rules: [
            {from: '*', to: '*', action: 'ok0'},
            {from: '?*', to: '*', action: 'ok1'},
            {from: '??*', to: '*', action: 'ok2'},
            {from: '???*', to: '*', action: 'ok3'},
            {from: '????*', to: '*', action: 'ok4'},
            {from: '?????*', to: '*', action: 'ok5'},
            {from: '??????*', to: '*', action: 'ok6'},
            {from: '???????*', to: '*', action: 'ok7'},
            {from: '????????*', to: '*', action: 'ok8'},
        ],
        expected: {msg1: ['ok0', 'ok1', 'ok2', 'ok3', 'ok4', 'ok5', 'ok6']}
    },
    regex_escapes: {
        messages: {
            msg1: {from: 'test(:=:)', to: 'abc'},
            msg2: {from: '\\abc\\', to: 'abc'},
            msg3: {from: '__a.b\c+d[e^f]g$h(i)\\j{k}l=m!n<o>p|q:r-s#z__',
                to: 'abc'},
            msg4: {from: "'a'", to: 'abc'},
            msg5: {from: "a+b", to: 'abc'},
            msg6: {from: "a.b", to: 'abc'},
            msg7: {from: 'a.b\c+d[e^f]g$h(i)\\j{k}l=m!n<o>p|q:r-s#z',
                to: 'abc'},
        },
        rules: [
            {from: '*test(:=:)*', action: 'simple escape 1'},
            {from: '*\abc\*', action: 'simple escape 2'},
            {from: '*a.b\c+d[e^f]g$h(i)\\j{k}l=m!n<o>p|q:r-s#z*',
                action: 'full regex escape'},
            {from: '*\'?\'*', action: 'quote escape'},
            {from: '*a.b*', action: 'dot escape'},
            {from: 'a.b\c+d[e^f]g$h(i)\\j{k}l=m!n<o>p|q:r-s#z',
                action: 'no regex, no escape'},
        ],
        expected: {
            msg1: ['simple escape 1'],
            msg2: ['simple escape 2'],
            msg3: ['full regex escape', 'dot escape'],
            msg4: ['quote escape'],
            msg5: [],
            msg6: ['dot escape'],
            msg7: ['full regex escape', 'dot escape', 'no regex, no escape']
        }
    }
};

function main(target){
    console.log('Testing correctness:', target);
    try {
        var script = compile(target);
        test_glob(script, 'z', ['z'], ['Z', 'za', 'az']);
        test_glob(script, '\\z', ['\\z'], ['z', '\\']);
        test_glob(script, '.', ['.'], ['z', '*', '.*']);
        test_glob(script, '?', ['.', '?', '*', 'z'], ['zz', '\\?']);
        test_glob(script, '*', ['.', '?', '*', 'z', 'zz'], []);
        test_glob(script, 'z*y*x', ['zyx', 'z--yx', 'z-y-x', 'zy--x', 'zyxzyx',
            'z*y*x'], ['zx', 'zxy', 'yzx', 'xyzx', 'zyxz']);
        test_glob(script, '*?', ['z', 'zy', 'zyx'], []);
        test_rule(script, {from: 'a', to: 'b'}, {}, true);
        test_rule(script, {from: 'a', to: 'b'}, {from: 'a'}, true);
        test_rule(script, {from: 'z', to: 'b'}, {from: 'a'}, false);
        test_rule(script, {from: 'z', to: 'b'}, {from: '?'}, true);
        test_rule(script, {from: 'z', to: 'b'}, {to: 'b*'}, true);
        test_rule(script, {from: 'z', to: 'a'}, {to: 'b*'}, false);
        test_rule(script, {from: 'a', to: 'b'}, {from: 'a*', to: 'b*'}, true);
        test_rule(script, {from: 'az', to: 'bz'}, {from: 'a*', to: 'b*'},
            true);
        test_rule(script, {from: 'z', to: 'bz'}, {from: 'a*', to: 'b*'},
            false);
        test_rule(script, {from: 'az', to: 'z'}, {from: 'a*', to: 'b*'},
            false);
        test_rule(script, {from: 'z', to: 'z'}, {from: 'a*', to: 'b*'},
            false);
        test_full(script, {}, [], {});
        test_full(script, {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'},
        }, [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org',
             action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'},
        ], {
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'forward to jill@elsewhere.com'],
            msg3: ['tag work'],
        });
        for (var i in contrib){
            test_full(script,
                contrib[i].messages, contrib[i].rules, contrib[i].expected, i);
        }
        console.log('Correctness: OK');
    } catch(e){
        process.exit(1);
    }
}

main(process.argv[2]);
