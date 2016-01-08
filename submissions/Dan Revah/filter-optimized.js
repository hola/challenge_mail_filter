function reduce(rule, type, matches)
{
    var curr = {}, ptr;
    // Escaping special characters, and replacing `?`
    // and `*` to the equivalent in regex
    var regex = new RegExp(['^(',rule
        .replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&')
        .replace(/\?/g, '.')
        .replace(/\*/g, '(.*?)'),')$'].join(''));

    for (var p in matches) {
        ptr = matches[p];
        if (regex.test(ptr[type])) {
            curr[p] = ptr;
        }
    }
    return curr;
}

function filter(messages, rules)
{
    var result = {}, matches, rule;

    // Creating empty arrays
    for (var mKey in messages) {
        result[mKey] = [];
    }

    // Creating regex from each rule, and finding matches.
    for (var key=0, len=rules.length; key < len; ++key) {
        rule = rules[key];
        matches = messages;

        if (rule.from) matches = reduce(rule.from, 'from', matches);
        if (rule.to) matches = reduce(rule.to, 'to', matches);

        // Adding action of the rule into the matched messages
        for (var prop in matches) {
            result[prop].push(rule.action);
        }
    }

    return result;
}

module.exports = filter;