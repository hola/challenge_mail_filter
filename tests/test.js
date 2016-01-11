// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var large_input = require('./large_input.json');
var large_output = require('./large_output.json');

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
    var time1 = Date.now();
    script.runInContext(context);
    var expr;
    if (typeof m.exports.filter=='function')
        expr = 'module.exports.filter';
    else if (typeof m.exports=='function')
        expr = 'module.exports';
    else throw new Error('Function filter not found');
    vm.runInContext(id+'.res = '+expr+'('+id+'.messages, '+id+'.rules)',
        context);
    var time2 = Date.now();
    var res = JSON.parse(vm.runInContext('JSON.stringify('+id+'.res)',
        context));
    assert.deepStrictEqual(res, expected);
    return time2-time1;
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

function test_full(script, messages, rules, expected){
    try {
        run_filter(script, messages, rules, expected);
    } catch(e){
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

function test_performance(script){
    var min = Infinity;
    for (var i = 0; i<10; i++)
    {
        global.gc();
        try {
            var time = run_filter(script,
                large_input.messages, large_input.rules, large_output);
        } catch(e){
            console.log('Wrong result on the performance test');
            throw e;
        }
        console.log('Pass #'+i+': '+time+'ms');
        if (time<min)
            min = time;
    }
    return min;
}

function main(){
    if (!global.gc)
    {
        console.error('Please run Node with --expose-gc');
        process.exit(2);
    }
    console.log('Testing', process.argv[2]);
    try {
        var script = compile(process.argv[2]);
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
        test_rule(script, {from: 'zz', to: 'yy'}, {from: '?'},
            false);
        test_rule(script, {from: 'foo', to: 'bar'}, {from: '*f*o*'},
            true);
        test_rule(script, {from: 'boss@work.com', to: 'jack@example.com'}, {from: '*?work.com'},
            true);
        test_rule(script, {from: 'boss@work.com', to: 'jack@example.com'}, {from: '*?wor?.co?'},
            true);
        test_rule(script, {from: 'foo', to: 'jill@example.org'}, {from: 'foo*?'},
            false);
        test_rule(script, {from: 'fobar', to: 'bar'}, {from: '*o?'},
            false);
        test_rule(script, {from: 'foobar', to: 'bar'}, {from: '***'},
            true);
        test_rule(script, {from: 'foobar', to: 'bar'}, {from: '?**'},
            true);
        test_rule(script, {from: 'foobar', to: 'bar'}, {from: '*?*'},
            true);
        test_rule(script, {from: 'foobar', to: 'bar'}, {from: '*ar'},
            true);
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
        test_full(script, {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        }, [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ], {
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'tag spam', 'tag spam', 'tag spam', 'forward to jill@elsewhere.com'],
            msg3: ['tag work']
        });
        console.log('Correctness: OK');
        var performance = test_performance(script);
        console.log('Performance: '+performance+' (lower is better)');
    } catch(e){
        process.exit(1);
    }
}

main();
