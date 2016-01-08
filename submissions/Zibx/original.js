
var cache = {};
var compileRule = function(rule){
    'use strict';
    return cache[rule] || (
        cache[rule] = new RegExp('^'+ 
            rule
                .replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&")
                .replace(/\*/g,'.*')
                .replace(/\?/g,'.')+
            '$'));
}


var filter = exports.filter = function(msgs, rules){
    'use strict';
    var i, out = {}, msg;
    rules = rules.map(function(rule){
        var from = compileRule(rule.from || '*'),
            to = compileRule(rule.to || '*'),
            action = rule.action;
        
        return function(arr, msg){
            msg.from.match(from) && msg.to.match(to) && arr.push(action);
            return arr;
        };
    });
    
    for( i in msgs )
        if( msgs.hasOwnProperty(i) ){
            msg = msgs[i];
            out[i] = rules.reduce(function(arr, rule){
                return rule(arr, msg);
            },[]);
        }
    return out;
};
