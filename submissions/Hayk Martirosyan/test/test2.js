(function(){
var filter = require('../app').filter;

var assert = require('assert');
var utils = require('util');

function test(messages, rules, expected) {
    var result = filter(messages, rules);
    assert.notStrictEqual(result, undefined, 'Filter result is undefined');

    for (var msgName in messages) {
        var resMsg = result[msgName];
        var expMsg = expected[msgName];
        
        assert.deepEqual(resMsg, expMsg, utils.format('Error in %s. Expected: %s, actual: %s', 
          msgName, JSON.stringify(expMsg), JSON.stringify(resMsg)));
    }

    return true;
}

function start_tests() {
    for (var testName in tests) {
        var t = tests[testName];
        console.log('test "%s" started', testName);
        test(t.messages, t.rules, t.expected);
    }
    console.log('Tests done');
}

var tests = {
    test_default: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
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
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ],
        expected: {
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'tag spam', 'tag spam', 'tag spam', 'forward to jill@elsewhere.com'],
            msg3: ['tag work']
        }
    },

    test_1: {
        messages: {},
        rules: [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ],
        expected: {}
    },

    test_2: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [],
        expected: { msg1: [], msg2: [], msg3: [] }
    },

    test_3: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*@work.com', action: 'tag work'}
        ],
        expected: { msg1: [], msg2: [], msg3: [ 'tag work' ] }
    },

    test_4: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*?work.com', action: 'tag work'}
        ],
        expected: { msg1: [], msg2: [], msg3: [ 'tag work' ] }
    },

    test_5: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*?wor?.co?', action: 'tag work'}
        ],
        expected: { msg1: [], msg2: [], msg3: [ 'tag work' ] }
    },

    test_6: {
        messages: {
            msg1: {from: 'abaabaaba', to: 'jill@example.org'},
            msg2: {from: 'aba', to: 'jill@example.org'},
            msg3: {from: 'd;rflkght', to: 'jack@example.com'}
        },
        rules: [
            {from: '*a*b*', action: 'tag'}
        ],
        expected: { msg1: [ 'tag' ], msg2: [ 'tag' ], msg3: [] }
    },

    test_7: {
        messages: {
            msg1: {from: 'abaabaaba', to: 'jill@example.org'},
            msg2: {from: 'aba', to: 'jill@example.org'},
            msg3: {from: 'd;rflkght', to: 'jack@example.com'}
        },
        rules: [
            {from: '*', action: 'tag'}
        ],
        expected: { msg1: [ 'tag' ], msg2: [ 'tag' ], msg3: [ 'tag' ] }
    },

    test_8: {
        messages: {
            msg1: {from: 'abaabaaba', to: 'jill@example.org'},
            msg2: {from: 'aba', to: 'jill@example.org'},
            msg3: {from: 'd;rflkght', to: 'jack@example.com'}
        },
        rules: [
            {from: 'abaabaab*', action: 'tag1'},
            {from: 'abaabaaba*?', action: 'tag2'},
            {from: 'abaabaab*?*', action: 'tag3'}
        ],
        expected: {"msg1":["tag1","tag3"],"msg2":[],"msg3":[]}
    },

    test_9: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '*', action: 'tag1'},
            {from: '**', action: 'tag2'},
            {from: '***', action: 'tag3'},
            {from: '*jack@example.com', action: 'tag4'},
            {from: 'jack@example.com*', action: 'tag5'},
            {from: '**jack@**.com**', action: 'tag6'},
            {from: '**@**.c*m**', action: 'tag7'},
        ],
        expected: {"msg1":["tag1","tag2","tag3","tag4","tag5","tag6","tag7"],"msg2":["tag1","tag2","tag3","tag7"],"msg3":["tag1","tag2","tag3","tag7"]}
    },

    test_10: {
        messages: {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        },
        rules: [
            {from: '?', action: 'tag1'},
            {from: '????????????????', action: 'tag2'},
            {from: '????@???????????', action: 'tag3'},
            {from: '????*???????????', action: 'tag4'},
            {from: '?*?', action: 'tag5'},
            {from: '*?*', action: 'tag6'},
            {from: '?*??**?', action: 'tag6'},
            {from: '?????????????????', action: 'tag7'},
            {from: '???????????????*?', action: 'tag8'}
        ],
        expected: {"msg1":["tag2","tag3","tag4","tag5","tag6","tag6","tag8"],"msg2":["tag2","tag4","tag5","tag6","tag6","tag8"],"msg3":["tag5","tag6","tag6"]}
    }
}

start_tests();
})();