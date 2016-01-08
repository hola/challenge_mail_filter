require('lie/polyfill');
var filter = require('./filter.js');
var deep = require('deep-diff');
var http = require('http');

var tests = [
    {
        input: {
            messages: {
                msg1: {from: 'jack@example.com', to: 'jill@example.org'},
                msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
                msg3: {from: 'boss@work.com', to: 'jack@example.com'},
                msg4: {from: 'johndoe@example.com', to: 'janedoe@example.com'}
            },
            rules: [
                {from: '*@work.com', action: 'tag work'},
                {from: '*@spam.com', action: 'tag spam'},
                {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
                {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'},
                {from: 'j???@example.com', to: 'j???@example.org', action: 'jfirst'}
            ]
        },
        output: {
            msg1: ['folder jack', 'forward to jill@elsewhere.com', 'jfirst'],
            msg2: ['tag spam', 'forward to jill@elsewhere.com', 'jfirst'],
            msg3: ['tag work', 'jfirst']
            msg4: []
        }
    }
];

// Tests are run in parallel
for(var i = 0; i < tests.length; ++i) {
    var _i = i;
    var test = tests[_i];

    // Prepare reference result
    var referenceResult = test.output;
    if ( ! referenceResult) {
        referenceResult = new Promise(function(resolve, reject) {
            var req = http.request({
                method: 'POST',
                hostname: 'hola.org',
                path: '/challenge_mail_filter/reference',
                headers: {
                    'Content-Type': 'application/json',
                }
            }, function(res) {
                res.setEncoding('utf8');
                var firstChunk = true;
                res.on('data', function (chunk) {
                    if ( ! firstChunk) {
                        return;
                     }
                    firstChunk = false;
                    resolve(JSON.parse(chunk));
                });
                res.on('error', function(e) {
                    reject(e);
                });
            });
            req.write(JSON.stringify(test.input));
            req.end();
        });
    } else {
        referenceResult = new Promise(function(resolve) { resolve(referenceResult); });
    }

    // Run filter on messages
    var result = filter(test.input.messages, test.input.rules);

    // Compare results
    referenceResult.then(function(referenceResult) {
        var differences = deep(referenceResult, result);
        console.log(_i, differences ? result : void 0, differences ? referenceResult : void 0, differences);
    });
}
