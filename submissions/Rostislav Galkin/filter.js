/**
 *
 * @param messages<Object>
 * @param rules<Array>
 * @returns {{}}
 */
function filter(messages, rules) {
    /**
     *
     * @param str<String>
     * @param patterns<Array>
     * @returns {boolean}
     */
    function compareString(str, patterns) {

        if (typeof str === 'undefined') {
            return true;
        }

        if (patterns === false) {
            return true;
        }

        if (typeof patterns.test !== 'undefined') {
            return patterns.test(str);
        }

        return str.indexOf(patterns) === 0;
    }

    var patterns = {};
    /**
     *
     * @param str<String>
     * @returns {Array}
     */
    function preparePattern(str) {
        if(patterns[str]){
            return patterns[str];
        }

        if (!str) {
            patterns[str] = false;
        }else if(/(\?+|\*+)/.test(str)) {
            patterns[str] = new RegExp('^' + str.replace(/\*/g, '[\x00-\x7F]*').replace(/\?/g, '[\x00-\x7F]{1}') + '$');
        } else {
            patterns[str] = str;
        }

        return patterns[str];
    }


    // var preparedRules = rules.map(prepareRule);
    var preparedRules = [],
        ipr = 0,
        iprLength = rules.length;

    for (; ipr < iprLength; ipr++) {
        preparedRules.push({
            from: preparePattern(rules[ipr].from),
            to: preparePattern(rules[ipr].to),
            action: rules[ipr].action
        });
    }


    // return Object.keys(messages).reduce(messagesReducer, {});
    var keys = Object.keys(messages), i = 0, klength = keys.length, result = {};

    for (; i < klength; i++) {
        var key = keys[i];
        result[key] = [];

        var j = 0, length = preparedRules.length;
        for (; j < length; j++) {
            if (compareString(messages[key].from, preparedRules[j].from) && compareString(messages[key].to, preparedRules[j].to)) {
                result[key].push(preparedRules[j].action);
            }
        }
    }

    return result;
}

module.exports = filter;