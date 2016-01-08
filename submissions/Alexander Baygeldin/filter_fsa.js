#!/usr/bin/env node
// Alexander Baygeldin (c) 2015
'use strict';
var E = exports;

E.filter = function(messages, rules){
    var i, key, len, match = [], result = {};
    for (i=0, len=rules.length; i<len; i++)
    {
        match[i] = {
            from: rules[i].from ? make_fsa(rules[i].from) : null,
            to: rules[i].to ? make_fsa(rules[i].to) : null,
            action: rules[i].action,
        }
    }
    for (key in messages)
    {
        if (messages.hasOwnProperty(key))
        {
            result[key] = [];
            for (i=0, len=rules.length; i<len; i++)
            {
                var from = match[i].from, to = match[i].to;
                if ((!from || from(messages[key].from)) &&
                    (!to || to(messages[key].to)))
                {
                    result[key].push(match[i].action);
                }
            }
        }
    }
    return result;
};

function make_fsa(pattern){
    var cur_label = 0, i = 0, len;
    var body = 'var i=0,l=s.length;';
    // handle simple cases
    var cmp = function (str) {
        return (str === pattern); }
    if (pattern.indexOf('*') === -1 && pattern.indexOf('?') === -1) 
        return cmp;
    // remove redunant wildcards
    pattern = pattern.replace(/\*+/g, '*');
    len = pattern.length;
    // generate code for wildcard processing
    function parse_wildcard(){
        cur_label++;
        body += 'for(;;){' + (pattern[i+1] === '?' ? ''
            : 'for(i;i<l&&s[i]!=="'+pattern[i+1]+'"'+';i++);')
            +'if(i==l)return!1;var b'+cur_label+'=++i;';
        i += 2;
        parse_symbols();
        body += 'break}';
        return;
    }
    // generate code for symbols processing
    function parse_symbols(){
        var buffer = '', j, b_len;
        for (i; pattern[i] !== '*' && i<len; i++)
            buffer += pattern[i];
        if ((b_len = buffer.length) || i === len)
        {
            body += 'if(!(' + (i === len ? (b_len ? 'i+'+b_len+'==l&&' : 'i==l') : '');
            for (j=0; j<(b_len-1); j++)
                body += buffer[j] !== '?' ? 's[i+'+j+']=="'+buffer[j]+'"&&' : 's[i+'+j+']&&'; 
            body += b_len ? (buffer[j] !== '?' ? 
                's[i+'+j+']=="'+buffer[j]+'"' : 's[i+'+j+']') : '';
            body += '))' + (cur_label ? '{i=b'+cur_label+';continue}'
                : 'return!1;') + 'i+='+b_len+';';
        }
        if (i<len && pattern[i+1]) parse_wildcard();
        return;
    }
    // start parsing
    parse_symbols();
    body += 'return!0;';
    // return generated function
    return new Function('s', body);
}
