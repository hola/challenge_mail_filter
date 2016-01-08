replaceRules = [
    ['.', '\\.'],
    ['*', '.*'],
    ['?', '.?']
]

function filter(messages, rules){
    return Object.keys(messages)
        .reduce((filtered, messageId) => {
            const message = messages[messageId];
            filtered[messageId] = rules
                .filter(rule => {
                    const from = rule.from || '*';
                    const to = rule.to || '*';
                    const patternFrom = new RegExp(replaceRules.reduce((pattern, rule) => pattern.replace(rule[0], rule[1]), from));
                    const patternTo = new RegExp(replaceRules.reduce((pattern, rule) => pattern.replace(rule[0], rule[1]), to));

                    return patternFrom.test(message.from) && patternTo.test(message.to);
                })
                .map(rule => rule.action);
            return filtered;
        }, {})
}
exports.filter = filter;
