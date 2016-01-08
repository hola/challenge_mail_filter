'use strict';

/**
 *
 * @param {Object} messages
 * @param {Array} rules
 */
exports.filter = function(messages, rules) {
    const mapped = {};
    const compiledRules = compileRules(rules);

    for (let key in messages) if (messages.hasOwnProperty(key)) {
        let message = messages[key];
        mapped[key] = compiledRules.filter(function(rule) {
            return match(message.from, rule.fromCompiled) && match(message.to, rule.toCompiled);
        }).map(function(rule) {
            return rule.action;
        });
    }

    return mapped;
};

/**
 * @param {String} adr
 * @param {RegExp} [rule]
 * @returns {boolean}
 */
function match(adr, rule) {
    if (!rule) {
        return true;
    }

    return rule.test(adr);
}

/**
 * @param {Array} rules
 * @return {Array}
 */
function compileRules(rules) {
    return rules.map(function(rule) {
        if (rule.from) {
            rule.fromCompiled = new RegExp(prepareRegexp(rule.from));
        }

        if (rule.to) {
            rule.toCompiled = new RegExp(prepareRegexp(rule.to));
        }

        return rule;
    });
}

const escapeReg = /[-\/\\^$+.()|[\]{}]/g;
const asteriskReg = /\*/g;
const questionReg = /\?/g;

function prepareRegexp(text) {
    return '^' +
        text.replace(escapeReg, '\\$&')
            .replace(asteriskReg, '.*')
            .replace(questionReg, '.')
        + '$';
}