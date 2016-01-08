function filter(mails, rules) {

    function compareEmails(email, rule) {
        if (rule.star === 0) {
            if (email.length !== rule.length) {
                return false;
            }
        } else {
            if (email.length < rule.length) {
                return false;
            }
        }
        return compairStr(email, rule.chars, rule.firstStar, rule.lastStar);
    }

    function compairStr(email, rule, firstStar, lastStar) {
        var index_email = 0,
            email_length = email.length,
            l = rule.length - (lastStar ? 0 : 1),
            i = -1,
            part,
            part_length,
            f_index = 0,
            index = 0,
            skipChar = '?'.charCodeAt(0);

        while (++i < l) {
            index = 0;
            f_index = 0;
            part = rule[i];
            part_length = part.length;

            while (true) {
                if (index_email + f_index + part_length > email_length) {
                    return false;
                }

                if (email.charCodeAt(index_email + f_index + index) === part[index] || part[index] === skipChar) {
                    if (index === part_length - 1) {
                        index_email += (f_index + part_length);
                        break;
                    }
                    index++;
                } else {
                    if (i === 0 && !firstStar) {
                        return false;
                    }
                    f_index++;
                    index = 0;
                }
            }
        }
        if (lastStar) {
            return true;
        } else {
            index = 0;
            f_index = 0;
            part = rule[l];
            part_length = part.length;

            while (true) {
                if (email_length - f_index - part_length < index_email) {
                    return false;
                }
                if (email.charCodeAt(email_length - 1 - f_index - index) === part[part_length - index -1] || part[part_length - index - 1] === skipChar) {
                    if (index === part_length - 1) {
                        break;
                    }
                    index++;
                } else {
                    return false;
                }
            }
            return true;
        }
    }


    function getCharsFromStr(str) {
        var chars = new Array(str.length);
        for (index = 0; index < str.length; index++) {
            chars[index] = str.charCodeAt(index);
        }
        return chars;
    }

    function getRuleData(rule_str) {
        var parts = rule_str.split('*').map(getCharsFromStr);
        var length = 0;
        for (var i = 0;i<parts.length;i++) {
            length += parts[i].length
        }
        return {
            chars: parts.filter((a)=> a.length),
            star: parts.length - 1,
            length: length,
            firstStar: parts[0].length === 0,
            lastStar: rule_str[rule_str.length - 1] === '*'
        }
    }

    var rules_count = rules.length,
        rules_opt = new Array(rules_count),
        s_rule,
        rule;

    for (var rules_index = 0; rules_index < rules_count; rules_index++) {
        rule = {};
        s_rule = rules[rules_index];

        if (s_rule.from) {
            rule.from = getRuleData(s_rule.from);
            rule.hasFrom = true;
        } else rule.hasFrom = false;

        if (s_rule.to) {
            rule.to = getRuleData(s_rule.to);
            rule.hasTo = true;
        } else rule.hasTo = false;

        rule.action = s_rule.action;
        rules_opt[rules_index] = rule;
    }



    var index = 0,
        actions = [],
        actions_length = 0,
        mail,
        d = {},
        result = true,
        key;

    for (key in mails) {
        mail = mails[key];
        actions = [];
        actions_length = 0;
        for (index = 0; index < rules_count; index ++) {
            rule = rules_opt[index];

            if (rule.hasFrom) {
                result = compareEmails(mail.from, rule.from);
            } else {
                result = true;
            }
            if (result && rule.hasTo) {
                result = compareEmails(mail.to, rule.to);
            }
            if (result) {
                actions.push(rule.action);
            }
        }
        d[key] = actions;
    }
    return d;
};

module.exports = filter;
