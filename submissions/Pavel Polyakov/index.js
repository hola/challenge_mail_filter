'use strict';
class RulePattern {
    constructor(pattern) {
        this.pattern = pattern;
        this.data = {};
        return this;
    }
    parse() {
        this.hasRegularExpression();
        this.detectTLD();
    }
    matchesAll() {
        if (this.pattern.indexOf('*') !== -1) {
            return /^[\*\s]+$/.test(this.pattern);
        }

        return false;
    }
    hasRegularExpression() {
        this.data.hasRegularExpression = !(this.pattern.indexOf('*') === -1 && this.pattern.indexOf('?') === -1)
    }
    detectTLD() {
        let tld = this.pattern.substring(this.pattern.lastIndexOf("."));
        if ((tld.indexOf('*') !== -1 || tld.indexOf('?') !== -1)) {
            tld = undefined;
        }
        return tld;
    }
    match(mail) {
        // if there is no regex
        if (!this.data.hasRegularExpression) {
            return mail.toString() === this.pattern;
        }
        // if tlds are not the same
        if (this.data.tld) {
            if (this.data.tld !== mail.data.tld) {
                return false;
            }
        }
        this.regex = this.pattern.replace(/\*/g, '.*');
        this.regex = this.regex.replace(/\?/g, '.?');
        this.regex = this.regex + '$';
        return (new RegExp('(' + this.regex + ')')).test(mail.toString());
    }
    toString() {
        return this.pattern;
    }
}
class Mail {
    constructor(mail) {
        this.mail = mail;
        this.data = {};
        return this;
    }
    parse() {
        this.detectTLD();
    }
    detectTLD() {
        this.data.tld = this.mail.substring(this.mail.lastIndexOf("."));
    }
    toString() {
        return this.mail;
    }
}

function filter(messages, rules) {
    // rules preparation
    for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        rule.data = {};
        if (rule.from) {
            rule.from = new RulePattern(rule.from.toString());
        }
        if (rule.to) {
            rule.to = new RulePattern(rule.to.toString());
        }
        // common part
        if ((rule.from && rule.from.matchesAll()) || (rule.to && rule.to.matchesAll())) {
            rule.data.matchesAll = true;
            continue;
        }
        // from part
        if (rule.from) {
            rule.from.parse();
        }
        // to part
        if (rule.to) {
            rule.to.parse();
        }
    }
    let result = {};
    for (let message in messages) {
        result[message] = [];
        let mails = messages[message];
        mails.to = new Mail(mails.to.toString());
        mails.to.parse();
        mails.from = new Mail(mails.from.toString());
        mails.from.parse();
        for (let k = 0; k < rules.length; k++) {
            let rule = rules[k];
            if (rule.data.matchesAll === true) {
                result[message].push(rule.action);
                continue;
            }
            // if both rules are present
            if (rule.from && rule.to) {
                if (rule.from.match(mails.from) && rule.to.match(mails.to)) {
                    result[message].push(rule.action);
                }
                continue;
            }
            // from part
            if (rule.from && rule.from.match(mails.from)) {
                result[message].push(rule.action);
            }
            // to part
            else if (rule.to && rule.to.match(mails.to)) {
                result[message].push(rule.action);
            }
        }
    }
    return result;
}
module.exports = filter;