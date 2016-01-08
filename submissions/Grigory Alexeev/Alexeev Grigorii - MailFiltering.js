var convertRulesToRegExp = (rules) => rules.map(
    function(rule) {
        rule.from = new RegExp((rule.from || '*@*').replace(/\?/g,'\\w').replace(/\*/g,'\\w*'));
        rule.to   = new RegExp((rule.to   || '*@*').replace(/\?/g,'\\w').replace(/\*/g,'\\w*')); 
    });

var filter = function(message, rules) {
    convertRulesToRegExp(rules);
    for (var msg in message) {
        message[msg] = rules
            .filter(rule => rule.from.test(message[msg].from) && rule.to.test(message[msg].to)) 
            .map(rule => rule.action);                                                          
        }
    return message;
}

module.exports.filter = filter