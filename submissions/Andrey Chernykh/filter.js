"use strict";

var getKeys = Object.keys,
    createObject = Object.create;

var CHARS = {
    ".": "\\.",
    "*": "[^ ]*?",
    "?": ".",
    "$": "\\$",
    "(": "\\(",
    ")": "\\)",
    "+": "\\+",
    "/": "\\/",
    "\\": "\\\\",
    "^": "\\^",
    "[": "\\[",
    "]": "\\]"
};

var escape = "[\\" + getKeys(CHARS).join("\\") + "]";

var replaceRegexp = new RegExp(escape, "g"),
    matchRegexp = /[\\?\\*]/;

function replacer (match) {
    return CHARS[match];
}

function FakeRegExp (mask) {
    this.mask = mask;
}

FakeRegExp.prototype.test = function (email) {
    return this.mask === email;
};

function compileRegexp(mask) {
    if (matchRegexp.test(mask)) {
        return new RegExp("^" + mask.replace(replaceRegexp, replacer) + "$");
    }
    return new FakeRegExp(mask);
}

function compileInstructions(rules) {
    var len = rules.length,
        regexp = new Array(len),
        action = new Array(len);

    for (var i = 0; i < len; ++i){
        var rule = rules[i],
            keys = getKeys(rule),
            unsorted = [];

        action[i] = rule["action"];

        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j],
                value = rule[key];

            if (key !== "action") {
                unsorted[unsorted.length] = [compileRegexp(value.toString()), +(key === "to")];
            }
        }
        regexp[i] = unsorted;
    }

    return [regexp, action];
}

function makeFlatArray(obj, keys) {
    var len = keys.length;
    var r = new Array(len * 2);
    var cnt = 0;
    for (var i = 0; i < len; ++i) {
        r[cnt++] = obj[keys[i]]["from"];
        r[cnt++] = obj[keys[i]]["to"];
    }
    return r;
}

function filter(messages, rules) {
    var mesKeys     = getKeys(messages),
        result      = createObject(messages),
        mArr = makeFlatArray(messages, mesKeys),

        mLen = mesKeys.length,
        rLen = rules.length,

        cnt = new Uint16Array(mLen),
        resultArr = new Array(mLen),

        compiled = compileInstructions(rules),
        regexp = compiled[0],
        action = compiled[1];


    for (var mesIndex = 0; mesIndex < mLen; ++mesIndex) {
        result[mesKeys[mesIndex]] = resultArr[mesIndex] = [];
    }

    for (var ruleIndex = 0; ruleIndex < rLen; ruleIndex++) {
        var compiledRules = regexp[ruleIndex],
            cLen = compiledRules.length;

        for (var j = 0; j < mLen; ++j) {
            for (var i = 0; i < cLen && compiledRules[i][0].test(mArr[ j*2 + compiledRules[i][1]]); ++i);

            if (i === cLen) {
                resultArr[j][cnt[j]++] = action[ruleIndex];
            }
        }
    }

    return result;
}

module.exports = filter;