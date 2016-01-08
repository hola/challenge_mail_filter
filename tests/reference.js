// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
var E = exports;

function verify_string(name, str){
    if (typeof str!='string')
        throw new Error(name+' is not a string');
    if (!str)
        throw new Error(name+' is empty');
    if (/[^\x20-\x7f]/.test(str))
        throw new Error(name+' contains illegal characters');
}

function verify_object(name, obj, props)
{
    if (typeof obj!='object' || Array.isArray(obj))
        throw new Error(name+' is not an object');
    for (var i in obj)
    {
        if (props.indexOf(i)<0)
            throw new Error('unexpected property '+name+'.'+i);
    }
}

function verify_message(id, m){
    verify_string('message id', id);
    var name = 'messages.'+id;
    verify_object(name, m, ['from', 'to']);
    verify_string(name+'.from', m.from);
    verify_string(name+'.to', m.to);
}

function verify_rule(index, r){
    var name = 'rules['+index+']';
    verify_object(name, r, ['from', 'to', 'action']);
    if (r.hasOwnProperty('from'))
        verify_string(name+'.from', r.from);
    if (r.hasOwnProperty('to'))
        verify_string(name+'.to', r.to);
    verify_string(name+'.action', r.action);
}

function match_glob(str, glob){
    var re = '';
    for (var i = 0; i<glob.length; i++)
    {
        switch (glob[i])
        {
        case '*':
            if (glob[i-1] != '*')
                re += '.*';
            break;
        case '?':
            re += '.';
            break;
        case '.': case '+': case '(': case ')': case '[': case ']':
        case '{': case '}': case '|': case '^': case '$': case '\\':
            re += '\\'+glob[i];
            break;
        default:
            re += glob[i];
        }
    }
    return new RegExp('^'+re+'$').test(str);
}

function match_rule(m, r){
    if (r.from && !match_glob(m.from, r.from))
        return false;
    if (r.to && !match_glob(m.to, r.to))
        return false;
    return true;
}

E.filter = function(messages, rules, opt){
    opt = opt||{};
    var id, i, res = {};
    if (typeof messages!='object' || Array.isArray(messages))
        throw new Error('messages is not an object');
    if (!Array.isArray(rules))
        throw new Error('rules is not an array');
    if (opt.max_messages && Object.keys(messages).length>opt.max_messages)
    {
        throw new Error('reference implementation supports up to '+
            opt.max_messages+' messages (your solution must support more)');
    }
    if (opt.max_rules && rules.length>opt.max_rules)
    {
        throw new Error('reference implementation supports up to '+
            opt.max_rules+' rules (your solution must support more)');
    }
    for (id in messages)
        verify_message(id, messages[id]);
    for (i = 0; i<rules.length; i++)
        verify_rule(i, rules[i]);
    for (id in messages)
    {
        res[id] = [];
        for (i = 0; i<rules.length; i++)
        {
            if (match_rule(messages[id], rules[i]))
                res[id].push(rules[i].action);
        }
    }
    return res;
};
