function checkRules(message,patternRules,callback){
    var res = [];
    for (var i = 0; i < patternRules.length; i++) {
        if (patternRules[i].from.test(message.from) && patternRules[i].to.test(message.to))
             res.push(patternRules[i].action) ;
    };
    if (callback && typeof(callback) === "function") {
        callback(res);
    }
};

//{from: '*@work.c?m', action: 'tag work'} => {from: '.*@work\.c.m', action: 'tag work'}
function makePatternRules(rules2ptrn){
    var pttrnRules = rules2ptrn;
    for (var i = 0; i < pttrnRules.length; i++) {
        if (pttrnRules[i].from !== undefined  && typeof pttrnRules[i].from == 'string' ) {
            var escapedRule = pttrnRules[i].from.replace(/[^\w\s]/g, "\\$&").replace(/\\\?/g, ".").replace(/\\\*/g, ".*");
            pttrnRules[i].from = new RegExp("\\b(" + escapedRule + ")\\b");
        } else
            pttrnRules[i].from = /.*/;
        if (pttrnRules[i].to !== undefined  && typeof pttrnRules[i].to == 'string' ) {
            var escapedRule = pttrnRules[i].to.replace(/[^\w\s]/g, "\\$&").replace(/\\\?/g, ".").replace(/\\\*/g, ".*");
            pttrnRules[i].to = new RegExp("\\b(" + escapedRule + ")\\b");
        } else
             pttrnRules[i].to = /.*/;
    }
    return pttrnRules;
};


function filter(messages, rules) {

    var patternRules = makePatternRules(rules);
    var result = {}
    for(var k in messages)
        checkRules(messages[k],patternRules, function(data){result[k] = data;});
return result
}

exports.filter = filter;
