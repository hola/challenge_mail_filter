'use strict';


/**
 * @param {Object} descriptor
 * @param {String} descriptor.action
 * @param {String} [descriptor.from]
 * @param {String} [descriptor.to]
 * @constructor
 */
function Rule(descriptor) {
    this.testFrom = Rule.getTest(descriptor.from);
    this.testTo = Rule.getTest(descriptor.to);
    this.action = descriptor.action;
}
/**
 * Only "?" and "*" use as special symbols
 * @type {RegExp}
 */
Rule.ESCAPE_REG_EXP = /[-+.^$|\\()\[\]]/g;
/**
 * @param {String} string
 * @returns {String}
 */
Rule.escape = function(string) {
    return string.replace(Rule.ESCAPE_REG_EXP, '\\$&')
};
/**
 * "*" -> ".*"
 * @see http://habrahabr.ru/company/hola/blog/270847/#comment_8654209
 * @type {RegExp}
 */
Rule.STAR_REG_EXP = /\*/g;
/**
 * "?" -> "."
 * @see http://habrahabr.ru/company/hola/blog/270847/#comment_8654563
 * @type {RegExp}
 */
Rule.QUESTION_REG_EXP = /\?/g;
/**
 * @param {String} string
 * @returns {String}
 */
Rule.normalize = function(string) {
    return string.replace(Rule.STAR_REG_EXP, '.*').replace(Rule.QUESTION_REG_EXP, '.');
};
/**
 * @returns {Boolean}
 */
Rule.pass = function() {
    return true;
};
/**
 * @param {RegExp} pattern
 * @param {String} string
 * @returns {Boolean}
 */
Rule.test = function(pattern, string) {
    return pattern.test(string);
};
/**
 * @param {String|undefined} any
 * @returns {Function}
 */
Rule.getTest = function(any) {
    return any ? Rule.test.bind(Rule, new RegExp(`^${Rule.normalize(Rule.escape(any))}$`)) : Rule.pass;
};
/**
 * @param {Object} message
 * @param {String} message.from
 * @param {String} message.to
 * @returns {Boolean}
 */
Rule.prototype.test = function(message) {
    return this.testFrom(message.from) && this.testTo(message.to);
};



// -------------------------------



/**
 * @param {Object} messages
 * @param {Array<Object>} rules
 * @returns {Object}
 */
function filter(messages, rules) {
    let len = rules.length;

    // rule_descriptor to Rule
    // http://habrahabr.ru/company/hola/blog/270847/#comment_8654399
    for(let i = len; i--;) {
        rules[i] = new Rule(rules[i]);
    }

    for(let key in messages) {
        let message = messages[key];
        // message_descriptor to message_actions
        // http://habrahabr.ru/company/hola/blog/270847/#comment_8654399
        messages[key] = [];

        for(let i = 0; i < len; i++) {
            if (rules[i].test(message)) {
                messages[key].push(rules[i].action);
            }
        }
    }

    return messages;
}


// export
exports.filter = filter;