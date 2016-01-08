function filter(messages, rules) {
    var empty = {
        "test": function () {
            return true;
        }
    };
    var filters = [],
        output = {};

    for (var r = 0; r < rules.length; r++) {
        filters[r] = {
            action: rules[r].action,
            from: getRegExp(rules[r].from),
            to: getRegExp(rules[r].to)
        };
    }
    var id, ids = Object.keys(messages);
    for (var i = 0; i < ids.length; i++) {
        id = ids[i];
        output[id] = [];
        for (var f = 0; f < filters.length; f++) {
            if (filters[f].from.test(messages[id].from) && filters[f].to.test(messages[id].to)) {
                output[id].push(filters[f].action);
            }
        }
    }
    return output;

    function getRegExp(value) {
        if (value) {
            value = value.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&");
            value = '^' + value.replace(/\*/g, '.*').replace(/\?/g, '.{1,1}') + '$';
            value = new RegExp(value);
        } else {
            value = empty;
        }
        return value;
    }
}

module.exports = filter;