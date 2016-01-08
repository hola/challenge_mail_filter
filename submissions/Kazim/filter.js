var shieldSymbs = new RegExp('[[\\^$.|+()]', 'g');

function maskToRegExp(mask) {
    if (!mask)
        return null;
    var res = mask.replace(shieldSymbs, '\$&');
    res = res.replace(/\*/g, '.*');
    res = res.replace(/\?/g, '.');
    return new RegExp('^' + res + '$');
}

function filter(messages, rules) {
    if (!(rules instanceof Array))
        throw Error('Argument "rules" is not an array!');
    var rulesRegExp = [];
    var rulesLength = rules.length;
    for (var i = rulesLength; i--; ) {
        rulesRegExp.push({
            from: maskToRegExp(rules[i].from),
            to: maskToRegExp(rules[i].to),
            action: rules[i].action
        });

    }
    var result = {};
    for (var msgId in messages) {
        var msg = messages[msgId];
        if (!msg)
            continue;
        var actions = [];
        for (i = rulesLength; i--; ) { //for (var i = 0; i < rulesLength; i++) {
            var rule = rulesRegExp[i];
            if ((rule.from == null || rule.from.test(msg.from)) &&
                (rule.to == null || rule.to.test(msg.to)))
                actions.push(rule.action);
        }
        result[msgId] = actions;
    }
    return result;
}

exports.filter = filter;