var WildcardRule = (function () {
    function WildcardRule(minSeek, maxSeek) {
        this.minSeek = minSeek;
        this.maxSeek = maxSeek;
    }
    WildcardRule.prototype.matches = function (str, offset) {
        if (this.minSeek && this.minSeek === this.maxSeek)
            return offset + this.minSeek === str.length ? str.length : -1;
        else
            return str.length;
    };
    return WildcardRule;
})();
function matchesSubstr(str, needle, offset, strLen, needleLen) {
    if (offset + needleLen > strLen)
        return false;
    for (var i = offset, end = offset + needleLen, j = 0; i < end; i++) {
        if (str.charAt(i) !== needle.charAt(j))
            return false;
        j++;
    }
    return true;
}
var SimpleRule = (function () {
    function SimpleRule(needle, maxSeek, minSeek) {
        this.needle = needle;
        this.maxSeek = maxSeek;
        this.minSeek = minSeek;
        this.needleLen = needle.length;
    }
    SimpleRule.prototype.matches = function (str, offset) {
        var strLen = str.length;
        if (offset + this.minSeek + this.needleLen > strLen)
            return -1;
        var maxSeek = Math.min(this.maxSeek, strLen - offset - this.needleLen);
        for (var i = offset + this.minSeek, end = offset + maxSeek; i <= end; i++) {
            if (matchesSubstr(str, this.needle, i, strLen, this.needleLen)) {
                return i + this.needleLen;
            }
        }
        return -1;
    };
    return SimpleRule;
})();
var SimpleRuleFixed = (function () {
    function SimpleRuleFixed(needle, seek) {
        this.needle = needle;
        this.needleLen = needle.length;
        this.seek = seek;
    }
    SimpleRuleFixed.prototype.matches = function (str, offset) {
        return matchesSubstr(str, this.needle, offset + this.seek, str.length, this.needleLen) ? offset + this.seek + this.needleLen : -1;
    };
    return SimpleRuleFixed;
})();
var StartsWithRule = (function () {
    function StartsWithRule(needle) {
        this.needle = needle;
        this.needleLen = needle.length;
    }
    StartsWithRule.prototype.matches = function (str, offset) {
        var strLen = str.length;
        if (strLen < this.needleLen)
            return -1;
        return matchesSubstr(str, this.needle, offset, strLen, this.needleLen) ? strLen : -1;
    };
    return StartsWithRule;
})();
var EndsWithRule = (function () {
    function EndsWithRule(needle) {
        this.needle = needle;
        this.needleLen = needle.length;
    }
    EndsWithRule.prototype.matches = function (str, offset) {
        var strLen = str.length;
        if (strLen < this.needleLen)
            return -1;
        return matchesSubstr(str, this.needle, strLen - this.needleLen, strLen, this.needleLen) ? strLen : -1;
    };
    return EndsWithRule;
})();
function prepareRule(expr) {
    if (!expr || expr.length === 0 || expr === "*" || expr === "**" || expr === "***")
        return null;
    var res = [];
    // aaa* and *aaa optimization
    var wildcardIndex = expr.indexOf("*");
    var questionIndex = expr.indexOf("?");
    if (wildcardIndex === expr.length - 1 && questionIndex < 0) {
        res.push(new StartsWithRule(expr.substr(0, expr.length - 1)));
        return res;
    }
    else if (wildcardIndex === 0 && expr.indexOf("*", 1) < 0 && questionIndex < 0) {
        res.push(new EndsWithRule(expr.substr(1)));
        return res;
    }
    var minSeek = 0, maxSeek = 0, needle = "";
    for (var i = 0; i < expr.length; i++) {
        var c = expr.charAt(i);
        if (c === "?" || c === "*") {
            if (needle.length) {
                if (maxSeek == minSeek)
                    res.push(new SimpleRuleFixed(needle, maxSeek));
                else
                    res.push(new SimpleRule(needle, maxSeek, minSeek));
                minSeek = 0;
                maxSeek = 0;
                needle = "";
            }
            if (c === "?") {
                minSeek++;
                maxSeek++;
            }
            else {
                maxSeek = 1000000;
            }
        }
        else {
            needle += c;
        }
    }
    if (needle.length) {
        if (maxSeek == minSeek)
            res.push(new SimpleRuleFixed(needle, maxSeek));
        else
            res.push(new SimpleRule(needle, maxSeek, minSeek));
    }
    else
        res.push(new WildcardRule(minSeek, maxSeek));
    return res;
}
function matchesRule(address, rules) {
    if (!rules)
        return true;
    var offset = 0;
    for (var i = 0, len = rules.length; i < len; i++) {
        offset = rules[i].matches(address, offset);
        if (offset < 0)
            return false;
    }
    return offset === address.length;
}
function filter(messages, rules) {
    var preparedRules = rules.map(function (rule) {
        return {
            from: prepareRule(rule.from),
            to: prepareRule(rule.to),
            action: rule.action
        };
    });
    var ruleCount = preparedRules.length;
    var res = {};
    for (var msgId in messages) {
        if (!messages.hasOwnProperty(msgId))
            continue;
        var msg = messages[msgId];
        var actions = [];
        for (var i = 0; i < ruleCount; i++) {
            var rule = preparedRules[i];
            if (matchesRule(msg.from, rule.from) && matchesRule(msg.to, rule.to))
                actions.push(rule.action);
        }
        res[msgId] = actions;
    }
    return res;
}
exports.filter = filter;