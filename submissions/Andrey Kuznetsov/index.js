var Rule = function(rule) {
    this.init(rule);
};

var Cache = function() {
    this.init();
};

Rule.prototype = {
    from: undefined,
    to: undefined,
    action: undefined,

    /**
     * Initialize rule
     * @param {Object } rule - rule option
     * @param {String} [rule.from] - rule for sender
     * @param {String} [rule.to] - rule for targets
     * @param {String} rule.action - action of rule
     */
    init: function(rule) {
        this.from = this._createExpressionFromRule(rule.from);
        this.to = this._createExpressionFromRule(rule.to);
        this.action = rule.action;
    },

    /**
     * Transforms rule with wildcards into regular expression object
     * @param {String} rule
     * @return {RegExp|Boolean}
     */
    _createExpressionFromRule: function(rule) {
        if(!rule || rule === '*') {
            return false;
        }

        rule = rule
            .replace(/[\!\$\&\-\=\^\`\|\#\%\+\/\_\{\}\.\,\(\)\[\]\~]/g, function(str) {
                return '\\' + str;
            })
            .replace(/\*/g, '[\\s\\S]*')
            .replace(/\?/g, '[\\s\\S]');

        return new RegExp('^' + rule + '$');
    },

    /**
     * Applies rule for given message params
     * @param {String} from - message from field value
     * @param {String} to - message to field value
     * @returns {boolean|*|{skip}|Boolean}
     */
    apply: function(from, to) {
        return (!this.from || this.from.test(from)) && (!this.to || this.to.test(to))
    }
};

Cache.prototype = {
    cache: undefined,

    /**
     * Initialize empty cache
     */
    init: function() {
        this.cache = {};
    },

    /**
     * Returns action by given message
     * @param {Object} message object
     * @returns {String|undefined}
     */
    get: function(message) {
        return this.cache[message.from + message.to]
    },

    /**
     * Sets action for given message
     * @param {Object} message object
     * @param {String} action message decision action
     */
    set: function(message, action) {
        this.cache[message.from + message.to] = action;
    }
};

/**
 * E-mail filtration function
 * @param {Object} messages data object
 * @param [Array] rules - array of rules
 * @returns {Object}
 */
function filter(messages, rules) {
    var cache = new Cache(),
        rulesLength = rules.length;

    rules = rules.map(function (item) {
        return new Rule(item);
    });

    function filterMessage(message) {
        var result = cache.get(message);
        if(result) {
            return result;
        }

        result = [];
        for (var i = 0; i < rulesLength; i++) {
            rules[i].apply(message.from, message.to) && result.push(rules[i].action);
        }

        cache.set(message, result);
        return result;
    }

    var keys = Object.keys(messages),
        messageCount = keys.length;

    for(var i = 0; i < messageCount; i++) {
        messages[keys[i]] = filterMessage(messages[keys[i]]);
    }
    return messages;
}

module.exports = filter;
