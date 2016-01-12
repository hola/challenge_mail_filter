#!/usr/bin/env node
// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
var fs = require('fs');
var random_js = require('random-js');
var reference = require('./reference.js');

var test = {
    large: {
        seed: 1337,
        domains: 20,
        emails: 50,
        rules: 100,
        messages: 100000,
    },
    xlarge: {
        seed: 1337*8,
        domains: 80,
        emails: 200,
        rules: 100,
        messages: 800000,
    },
};

function main(test_name){
    var opt = test[test_name];
    if (!opt)
    {
        console.log('Usage: generate_large_test.js '
            +Object.keys(test).join('|'));
        process.exit(1);
    }
    var random = new random_js(random_js.engines.mt19937().seed(opt.seed));
    function fill(length, fn){
        var res = new Array(length);
        for (var i = 0; i<length; i++)
            res[i] = fn();
        return res;
    }
    function fill_obj(length, fn){
        var res = {};
        for (var i = 0; i<length; i++)
            res['#'+i] = fn();
        return res;
    }
    function generate_label(){
        return random.string(random.integer(3, 10)).toLowerCase();
    }
    function generate_domain(){
        return generate_label()+'.'+random.pick(tlds);
    }
    function generate_address(){
        var domain = random.bool()
            ? random.pick(frequent_domains)
            : generate_domain();
        var localpart = random.bool()
            ? random.pick(frequent_localparts)
            : generate_label();
        return localpart+'@'+domain;
    }
    function generate_message(){
        var type = random.integer(0, 99);
        if (type<50) // 50% incoming from frequent addresses
        {
            return {
                from: random.pick(frequent_emails),
                to: random.pick(personal_emails),
            };
        }
        if (type<75) // 25% incoming from strangers
        {
            return {
                from: generate_address(),
                to: random.pick(personal_emails),
            };
        }
        if (type<90) // 15% outgoing to frequent addresses
        {
            return {
                from: random.pick(personal_emails),
                to: random.pick(frequent_emails),
            };
        }
        // 10% completely random (spam etc)
        return {
            from: generate_address(),
            to: generate_address(),
        };
    }
    function generate_action(){
        var type = random.integer(0, 99);
        if (type<25) // 25%
            return 'forward to '+random.pick(frequent_emails);
        if (type<50) // 25%
            return 'tag '+random.pick(tags);
        if (type<75) // 25%
            return 'folder '+random.pick(folders);
        if (type<90) // 15%
            return 'mark read';
        // 10%
        return 'delete';
    }
    function generate_pattern(){
        var type = random.integer(0, 99);
        if (type<30) // 30% own address
            return random.pick(personal_emails);
        if (type<70) // 40% full address
            return random.pick(frequent_emails);
        if (type<90) // 20% domain
            return '*@'+random.pick(frequent_domains);
        // 10% local part
        return random.pick(frequent_localparts)+'@*';
    }
    function generate_rule(){
        var res = {};
        var type = random.integer(0, 99);
        if (type<50) // 50% filter by sender
            res.from = generate_pattern();
        else if (type<75) // 25% filter by recipient
            res.to = generate_pattern();
        else // 25% filter by both
        {
            res.from = generate_pattern();
            res.to = generate_pattern();
        }
        res.action = generate_action();
        return res;
    }
    var tlds = ['com', 'net', 'org', 'co.uk', 'biz'];
    var frequent_localparts = ['post', 'noreply', 'no-reply', 'support'];
    var frequent_domains = fill(opt.domains, generate_domain);
    var frequent_emails = fill(opt.emails, generate_address);
    var personal_emails = [
        'foobarsen@'+frequent_domains[0],
        'foobarsen@'+generate_domain(),
    ];
    var folders = fill(5, generate_label);
    var tags = fill(10, generate_label);
    var messages = fill_obj(opt.messages, generate_message);
    var rules = fill(opt.rules, generate_rule);
    var output = reference.filter(messages, rules);
    fs.writeFileSync(test_name+'_input.json', JSON.stringify({
        messages: messages,
        rules: rules,
    }, null, 4));
    fs.writeFileSync(test_name+'_output.json', JSON.stringify(
        output, null, 4));
}

main(process.argv[2]);
