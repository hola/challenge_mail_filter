#!/usr/bin/env node
// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');

function run_filter(mod, messages, rules, expected){
    var time1 = Date.now();
    var res;
    if (typeof mod.filter=='function')
        res = mod.filter(messages, rules);
    else if (typeof mod=='function')
        res = mod(messages, rules);
    else
        throw new Error('Function filter not found');
    var time2 = Date.now();
    assert.deepEqual(res, expected);
    return time2-time1;
}

function main(target, test_name){
    if (!test_name)
        test_name = 'large';
    console.log('Testing performance:', target);
    var mod = require(fs.realpathSync(target));
    var input = require('./'+test_name+'_input.json');
    var output = require('./'+test_name+'_output.json');
    try {
        var performance = run_filter(mod, input.messages, input.rules, output);
        console.log('Performance: '+performance+' (lower is better)');
    } catch(e){
        console.log('Performance test failed');
        process.exit(1);
    }
}

main(process.argv[2], process.argv[3]);
