'use strict'

function match(str, pattern) {
    if (str === pattern) return true;
    var s = 0, p = 0;
    while (s < str.length && p < pattern.length) {
        if (pattern[p] === '?' || pattern[p] === str[s]) {
            s++; p++;
        } else if (pattern[p] === '*') {
            // If the pattern ends with * at this point, it's a match
            if (p === pattern.length - 1) return true;
            // Recursively call match() from the next str character: once with the current * rule and once without
            return match(str.substring(s+1), pattern.substring(p+1)) || match(str.substring(s+1), pattern.substring(p));
        } else {
            return false;
        }
    }
    return p === pattern.length && s === str.length;
}

function remove_repeated(str) {
    if (str.length <= 1) return str;
    var new_str = str[0], j = 0;
    for (var i = 1; i < str.length; i++) {
        if (str[i] !== '*' || new_str[j] !== '*') {
            new_str += str[i]; j++;
        }
    }
    return new_str;
}

module.exports = {
    filter: function(messages, filters) {
        var results = {};
        // Reduce repeated * in patterns to 1
        for (var i = 0; i < filters.length; i++) {
            if ('from' in filters[i]) {
                filters[i]['from'] = remove_repeated(filters[i]['from']);
            }
            if ('to' in filters[i]) {
                filters[i]['to'] = remove_repeated(filters[i]['to']);
            }
        }
        for (var m in messages) {
            results[m] = [];
            for (var f = 0; f < filters.length; f++) {
                if ((!('from' in filters[f]) || match(messages[m]['from'], filters[f]['from'])) 
                        && (!('to' in filters[f]) || match(messages[m]['to'], filters[f]['to']))) {
                    results[m].push(filters[f]['action']);
                }
            }
        }
        return results;
    }
};
