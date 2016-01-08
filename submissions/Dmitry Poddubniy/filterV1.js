/**
 * Created by mr470 on 13.11.2015.
 */
"use strict";

var cache = {};
var hash_cache = {};

var escapeRegExp = function(text) {
    // exclude * and ?
    return text.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&");
};
var makeRegExpString = function(text){
    return new RegExp(text.replace(/\?/g,".").replace(/\*/g,".*"));
};

/**
 * @author Gary Court <gary.court@gmail.com>
 */
function murmurhash2_32_gc(str, seed) {
    var
        l = str.length,
        h = seed ^ l,
        i = 0,
        k;

    while (l >= 4) {
        k =
            ((str.charCodeAt(i) & 0xff)) |
            ((str.charCodeAt(++i) & 0xff) << 8) |
            ((str.charCodeAt(++i) & 0xff) << 16) |
            ((str.charCodeAt(++i) & 0xff) << 24);

        k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
        k ^= k >>> 24;
        k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

        h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

        l -= 4;
        ++i;
    }

    switch (l) {
        case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
        case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
        case 1: h ^= (str.charCodeAt(i) & 0xff);
            h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    }

    h ^= h >>> 13;
    h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    h ^= h >>> 15;

    return h >>> 0;
}

var calculateCompare = function(message, rule, fromIn, toIn){
    var toRegExp = toIn? makeRegExpString(escapeRegExp(rule.to)) : "";
    var fromRegExp = fromIn? makeRegExpString(escapeRegExp(rule.from)) : "";

    var fromMatch = fromIn? (message.from+"").match(fromRegExp) : false;
    var toMatch = toIn? (message.to+"").match(toRegExp) : false;
    if (fromMatch && toMatch || fromMatch && !toIn || toMatch && !fromIn) return rule.action;
};

var strategy1 = function(message, rule, seed){
    var fromIn = 'undefined' !== typeof rule['from'];
    var toIn = 'undefined' !== typeof rule['to'];
    var ruleData;
    if (fromIn && toIn) ruleData = rule.from + rule.to;
    // all rules matches
    if (!toIn && !fromIn) return rule.action;
    if (!fromIn && toIn) ruleData = rule.to;
    if (fromIn && !toIn) ruleData = rule.from;
    var key = message.from+";"+message.to+";"+ruleData;
    var hash = hash_cache[key];
    if (!hash) hash = murmurhash2_32_gc(message.from+";"+message.to+";"+ruleData, seed);
    if (cache[hash]) {
        return cache[hash];
    } else {
        var result = calculateCompare(message, rule, fromIn, toIn) || "";
        if (result){
            hash = murmurhash2_32_gc(message.from+";"+message.to+";"+ruleData, seed);
            hash_cache[key] = hash;
            cache[hash] = result;
        }
        return result;
    }

};

var v1 = function(messages, rules){
    var rulesLength = rules.length;
    var result = {};
    for (var message in messages){
        result[message] = [];
        for (var i = 0; i<rulesLength; i++ ){
            var rule = new Object(rules[i]);
            var action = strategy1(messages[message], rule, 0);
            if (action) result[message].push(action);
        }
    }
    return result;
};

module.exports.filter = v1;