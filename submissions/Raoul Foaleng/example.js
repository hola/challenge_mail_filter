/**
 *@author Bintoo
 */

function match(value, regex) {

    if (typeof regex === 'undefined') {
        return true;
    }

    if (typeof value === 'undefined') {
        return false;
    }

    var refRegex = regex.replace(/(\?)|(\*+)|(\.)/g, function (x) {
        if (x.indexOf("*") !== -1) {
            return ".*";
        } else if (x === "?") {
            return ".";
        } else if (x === ".") {
            return "\\.";
        }
    });

    return value.match('(' + refRegex + ')') !== null;
}


function filter(elements, rules) {
    var result = {};

    for (key in elements) {
        var message = elements[key];
        var actions = new Array();

        rules.forEach(function (rule) {
            if (match(message.from, rule.from) && match(message.to, rule.to)) {
                actions.push(rule.action);
            }
        });
        result[key] = actions;
    }
    return result;
}

