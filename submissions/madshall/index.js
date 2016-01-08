/**
 * Created by madshall on 11/19/2015.
 */

function filter(messages, rules){
    var result = {},
        rulesRegs = [],
        id, i,
        rule,
        message,
        rulesLength = rules.length;

    /* converting masks to regular expressions */
    for(i = 0; i < rulesLength; i++){
        rule = rules[i];

        rulesRegs.push({
            fromReg: new RegExp('^' + (rule.from || '*').replace(/\./g, "\\.").replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'g'),
            toReg: new RegExp('^' + (rule.to || '*').replace(/\./g, "\\.").replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'g')
        });
    }

    /* checking messages one by one */
    for(id in messages){
        result[id] = [];
        message = messages[id];
        for(i = 0; i < rulesLength; i++) {
            ~message.from.search(rulesRegs[i].fromReg)
                && ~message.to.search(rulesRegs[i].toReg)
                && result[id].push(rules[i].action);
        }
    }

    return result;
}

module.exports = filter;