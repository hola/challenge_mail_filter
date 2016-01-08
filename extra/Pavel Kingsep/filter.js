'use strict'; /*jslint node:true*/
var E = module.exports;
var bits = [
    [],
    [0],
    [1],
    [0, 1],
    [2],
    [0, 2],
    [1, 2],
    [0, 1, 2],
    [3],
    [0, 3],
    [1, 3],
    [0, 1, 3],
    [2, 3],
    [0, 2, 3],
    [1, 2, 3],
    [0, 1, 2, 3],
    [4],
    [0, 4],
    [1, 4],
    [0, 1, 4],
    [2, 4],
    [0, 2, 4],
    [1, 2, 4],
    [0, 1, 2, 4],
    [3, 4],
    [0, 3, 4],
    [1, 3, 4],
    [0, 1, 3, 4],
    [2, 3, 4],
    [0, 2, 3, 4],
    [1, 2, 3, 4],
    [0, 1, 2, 3, 4],
    [5],
    [0, 5],
    [1, 5],
    [0, 1, 5],
    [2, 5],
    [0, 2, 5],
    [1, 2, 5],
    [0, 1, 2, 5],
    [3, 5],
    [0, 3, 5],
    [1, 3, 5],
    [0, 1, 3, 5],
    [2, 3, 5],
    [0, 2, 3, 5],
    [1, 2, 3, 5],
    [0, 1, 2, 3, 5],
    [4, 5],
    [0, 4, 5],
    [1, 4, 5],
    [0, 1, 4, 5],
    [2, 4, 5],
    [0, 2, 4, 5],
    [1, 2, 4, 5],
    [0, 1, 2, 4, 5],
    [3, 4, 5],
    [0, 3, 4, 5],
    [1, 3, 4, 5],
    [0, 1, 3, 4, 5],
    [2, 3, 4, 5],
    [0, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [6],
    [0, 6],
    [1, 6],
    [0, 1, 6],
    [2, 6],
    [0, 2, 6],
    [1, 2, 6],
    [0, 1, 2, 6],
    [3, 6],
    [0, 3, 6],
    [1, 3, 6],
    [0, 1, 3, 6],
    [2, 3, 6],
    [0, 2, 3, 6],
    [1, 2, 3, 6],
    [0, 1, 2, 3, 6],
    [4, 6],
    [0, 4, 6],
    [1, 4, 6],
    [0, 1, 4, 6],
    [2, 4, 6],
    [0, 2, 4, 6],
    [1, 2, 4, 6],
    [0, 1, 2, 4, 6],
    [3, 4, 6],
    [0, 3, 4, 6],
    [1, 3, 4, 6],
    [0, 1, 3, 4, 6],
    [2, 3, 4, 6],
    [0, 2, 3, 4, 6],
    [1, 2, 3, 4, 6],
    [0, 1, 2, 3, 4, 6],
    [5, 6],
    [0, 5, 6],
    [1, 5, 6],
    [0, 1, 5, 6],
    [2, 5, 6],
    [0, 2, 5, 6],
    [1, 2, 5, 6],
    [0, 1, 2, 5, 6],
    [3, 5, 6],
    [0, 3, 5, 6],
    [1, 3, 5, 6],
    [0, 1, 3, 5, 6],
    [2, 3, 5, 6],
    [0, 2, 3, 5, 6],
    [1, 2, 3, 5, 6],
    [0, 1, 2, 3, 5, 6],
    [4, 5, 6],
    [0, 4, 5, 6],
    [1, 4, 5, 6],
    [0, 1, 4, 5, 6],
    [2, 4, 5, 6],
    [0, 2, 4, 5, 6],
    [1, 2, 4, 5, 6],
    [0, 1, 2, 4, 5, 6],
    [3, 4, 5, 6],
    [0, 3, 4, 5, 6],
    [1, 3, 4, 5, 6],
    [0, 1, 3, 4, 5, 6],
    [2, 3, 4, 5, 6],
    [0, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6],
    [0, 1, 2, 3, 4, 5, 6],
    [7],
    [0, 7],
    [1, 7],
    [0, 1, 7],
    [2, 7],
    [0, 2, 7],
    [1, 2, 7],
    [0, 1, 2, 7],
    [3, 7],
    [0, 3, 7],
    [1, 3, 7],
    [0, 1, 3, 7],
    [2, 3, 7],
    [0, 2, 3, 7],
    [1, 2, 3, 7],
    [0, 1, 2, 3, 7],
    [4, 7],
    [0, 4, 7],
    [1, 4, 7],
    [0, 1, 4, 7],
    [2, 4, 7],
    [0, 2, 4, 7],
    [1, 2, 4, 7],
    [0, 1, 2, 4, 7],
    [3, 4, 7],
    [0, 3, 4, 7],
    [1, 3, 4, 7],
    [0, 1, 3, 4, 7],
    [2, 3, 4, 7],
    [0, 2, 3, 4, 7],
    [1, 2, 3, 4, 7],
    [0, 1, 2, 3, 4, 7],
    [5, 7],
    [0, 5, 7],
    [1, 5, 7],
    [0, 1, 5, 7],
    [2, 5, 7],
    [0, 2, 5, 7],
    [1, 2, 5, 7],
    [0, 1, 2, 5, 7],
    [3, 5, 7],
    [0, 3, 5, 7],
    [1, 3, 5, 7],
    [0, 1, 3, 5, 7],
    [2, 3, 5, 7],
    [0, 2, 3, 5, 7],
    [1, 2, 3, 5, 7],
    [0, 1, 2, 3, 5, 7],
    [4, 5, 7],
    [0, 4, 5, 7],
    [1, 4, 5, 7],
    [0, 1, 4, 5, 7],
    [2, 4, 5, 7],
    [0, 2, 4, 5, 7],
    [1, 2, 4, 5, 7],
    [0, 1, 2, 4, 5, 7],
    [3, 4, 5, 7],
    [0, 3, 4, 5, 7],
    [1, 3, 4, 5, 7],
    [0, 1, 3, 4, 5, 7],
    [2, 3, 4, 5, 7],
    [0, 2, 3, 4, 5, 7],
    [1, 2, 3, 4, 5, 7],
    [0, 1, 2, 3, 4, 5, 7],
    [6, 7],
    [0, 6, 7],
    [1, 6, 7],
    [0, 1, 6, 7],
    [2, 6, 7],
    [0, 2, 6, 7],
    [1, 2, 6, 7],
    [0, 1, 2, 6, 7],
    [3, 6, 7],
    [0, 3, 6, 7],
    [1, 3, 6, 7],
    [0, 1, 3, 6, 7],
    [2, 3, 6, 7],
    [0, 2, 3, 6, 7],
    [1, 2, 3, 6, 7],
    [0, 1, 2, 3, 6, 7],
    [4, 6, 7],
    [0, 4, 6, 7],
    [1, 4, 6, 7],
    [0, 1, 4, 6, 7],
    [2, 4, 6, 7],
    [0, 2, 4, 6, 7],
    [1, 2, 4, 6, 7],
    [0, 1, 2, 4, 6, 7],
    [3, 4, 6, 7],
    [0, 3, 4, 6, 7],
    [1, 3, 4, 6, 7],
    [0, 1, 3, 4, 6, 7],
    [2, 3, 4, 6, 7],
    [0, 2, 3, 4, 6, 7],
    [1, 2, 3, 4, 6, 7],
    [0, 1, 2, 3, 4, 6, 7],
    [5, 6, 7],
    [0, 5, 6, 7],
    [1, 5, 6, 7],
    [0, 1, 5, 6, 7],
    [2, 5, 6, 7],
    [0, 2, 5, 6, 7],
    [1, 2, 5, 6, 7],
    [0, 1, 2, 5, 6, 7],
    [3, 5, 6, 7],
    [0, 3, 5, 6, 7],
    [1, 3, 5, 6, 7],
    [0, 1, 3, 5, 6, 7],
    [2, 3, 5, 6, 7],
    [0, 2, 3, 5, 6, 7],
    [1, 2, 3, 5, 6, 7],
    [0, 1, 2, 3, 5, 6, 7],
    [4, 5, 6, 7],
    [0, 4, 5, 6, 7],
    [1, 4, 5, 6, 7],
    [0, 1, 4, 5, 6, 7],
    [2, 4, 5, 6, 7],
    [0, 2, 4, 5, 6, 7],
    [1, 2, 4, 5, 6, 7],
    [0, 1, 2, 4, 5, 6, 7],
    [3, 4, 5, 6, 7],
    [0, 3, 4, 5, 6, 7],
    [1, 3, 4, 5, 6, 7],
    [0, 1, 3, 4, 5, 6, 7],
    [2, 3, 4, 5, 6, 7],
    [0, 2, 3, 4, 5, 6, 7],
    [1, 2, 3, 4, 5, 6, 7],
    [0, 1, 2, 3, 4, 5, 6, 7]
];
var msg_actions;
function str_escape(str){ return str.replace(/('|\\)/g, '\\$1'); }
function rex_escape(str){
    str = str.replace(/(\\|\^|\$|\+|\.|\(|\)|\{|\}|\[|\||\])/g, '\\$1');
    return '/^'+str.replace(/\?/g, '.').replace(/\*/g, '.*')+'$/';
}
function push_func(act){ Array.prototype.push.apply(msg_actions, act); }
function prepare_actions(rules){
    var res = [];
    var length = Math.ceil(rules.length/8);
    for (var i=0; i<length; i++)
    {
        res[i] = [null];
        var up_to = 1<<Math.min(8, rules.length-8*i);
        for (var j=1; j<up_to; j++)
        {
            var bt = bits[j];
            var act = [];
            for (var k=0, l=bt.length; k<l; k++)
                act.push(rules[8*i+bt[k]].action);
            res[i][j] = push_func.bind(null, act);
        }
    }
    return res;
}
function put(coll, key, bit){
    if (!(key in coll))
        coll[key] = 0;
    coll[key] += 1<<bit;
}
function prepare(rules, key){
    var length = Math.ceil(rules.length/8);
    var params = 'a';
    var body = 'var res = new Uint8Array('+length+');\n';
    for (var i=0; i<length; i++)
    {
        var cond_cache = {};
        var up_to = Math.min(8, rules.length-8*i);
        for (var j=0; j<up_to; j++)
        {
            var cond;
            var rule = rules[8*i+j][key];
            if (!rule)
            {
                put(cond_cache, '', j);
                continue;
            }
            rule = rule.replace(/\*+/, '*');
            if (rule == '*')
            {
                put(cond_cache, '', j);
                continue;
            }
            else if (rule=='?')
            {
                put(cond_cache, 'if (a.length==1) ', j);
                continue;
            }
            var wc_s = rule.split(/\*|\?/);
            switch (wc_s.length)
            {
            case 1:
                put(cond_cache, 'if (a==\''+str_escape(rule)+'\') ', j);
                continue;
            case 2:
                if (!wc_s[0])
                {
                    cond = 'if (a.substr(-'+wc_s[1].length+')==\''+
                        str_escape(wc_s[1])+'\'';
                    if (rule.charAt(0)=='?')
                        cond += '&&a.length=='+(wc_s[1].length+1);
                    put(cond_cache, cond+') ', j);
                    continue;
                }
                if (!wc_s[1])
                {
                    cond = 'if (a.substr(0,'+wc_s[0].length+')==\''+
                        str_escape(wc_s[0])+'\'';
                    if (rule.substr(-1)=='?')
                        cond += '&&a.length=='+(wc_s[0].length+1);
                    put(cond_cache, cond+') ', j);
                    continue;
                }
                cond = 'if (a.substr(0,'+wc_s[0].length+')==\''+
                    str_escape(wc_s[0])+'\' && a.substr(-'+wc_s[1].length+
                    ')==\''+str_escape(wc_s[1])+'\' && a.length';
                cond += rule.charAt(wc_s[0].length)=='?' ? '==1+' : '>=';
                cond += (wc_s[0].length+wc_s[1].length)+') ';
                put(cond_cache, cond, j);
                continue;
            }
            put(cond_cache, 'if ('+rex_escape(rule)+'.test(a)) ', j);
        }
        for (var _cond in cond_cache)
            body += _cond + 'res['+i+']+='+cond_cache[_cond]+';\n';
    }
    body += 'return res;';
    return new Function(params, body);
}
function prepare_from(rules){ return prepare(rules, 'from'); }
function prepare_to(rules){ return prepare(rules, 'to'); }
E.filter = function(messages, rules){
    var length = Math.ceil(rules.length/8);
    var cache_from = {};
    var cache_to = {};
    var cache_full = {};
    var rule_func_from = prepare_from(rules);
    var rule_func_to = prepare_to(rules);
    var actions = prepare_actions(rules);
    var output = {};
    for (var key in messages)
    {
        msg_actions = [];
        var msg = messages[key];
        if (msg.from+'\x80'+msg.to in cache_full)
        {
            output[key] = cache_full[msg.from+'\x80'+msg.to];
            continue;
        }
        var from_arr = cache_from[msg.from], to_arr = cache_to[msg.to];
        if (!from_arr)
            from_arr = cache_from[msg.from] = rule_func_from(msg.from);
        if (!to_arr)
            to_arr = cache_to[msg.to] = rule_func_to(msg.to);
        for (var i=0; i<length; i++)
        {
            var action;
            if ((action = actions[i][from_arr[i]&to_arr[i]]))
                action();
        }
        output[key] = cache_full[msg.from+'\x80'+msg.to] = msg_actions;
    }
    return output;
};
