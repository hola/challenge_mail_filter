// Hola! JavaScript Mail Filtering challenge solution. 
//
// Author: Vitali Falileev <vitali.falileev@gmail.com>
//

function map_hash(dict, f, exact_keys) {
    var result = {};
    var keys = Object.keys(dict), len = keys.length;
    var i, key;

    if (exact_keys !== undefined) {
        for (i = 0; i < len; i++) {
            key = keys[i];
            if (exact_keys.indexOf(key) === -1) {
                continue;
            }
            result[key] = f(dict[key]);
        }
    } else {
        keys.forEach(key => result[key] = f(dict[key]));
    }

    return result;
}

function mask_to_regex(mask) {
    var escapes = "\\'\"<>!^$%.()[]/+-".split("");
    escapes.forEach(symbol => mask = mask.replace(new RegExp("\\" + symbol, "g"), "\\" + symbol));
    return new RegExp("^" + mask.replace(/\?/g, ".").replace(/\*/g, ".*?") + "$");
}

function rule_to_regex(rule) {
    var new_rule = map_hash(rule, mask_to_regex, ["from", "to"]);
    new_rule.action = rule.action;
    return new_rule;
}

function is_rule_applicable(message, rule) {
    if(rule.from && !rule.from.test(message.from)) {
        return false;
    }
    if(rule.to && !rule.to.test(message.to)) {
        return false;
    }
    return true;
}

function filter(messages, rules) {
    var regex_rules = rules.map(rule_to_regex);
    var len = regex_rules.length;

    var handle_message = function (message) {
        var actions = new Array(len);
        var i, count = 0, rule;

        for (i = 0; i < len; i++) {
            rule = regex_rules[i];
            is_rule_applicable(message, rule) && (actions[count] = rule.action, count++);
        }

        actions.length = count;
        return actions;
    }

    return map_hash(messages, handle_message);
}

exports.filter = filter;