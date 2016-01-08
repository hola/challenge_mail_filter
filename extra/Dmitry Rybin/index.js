/**
 * Copyright (c) 2015 Dmitry Rybin <postbox2020@yandex.ru>
 *
 * Not for production.
 * MIT license.
 */


/**
 * Mail filter for contest
 * http://habrahabr.ru/company/hola/blog/270847
 * @param messages
 * @param rules
 * @returns {{}}
 */

module.exports = function filter(messages, rules) {
    'use strict';

    // 1. Gen regexps from rules
    var r, from, to, lenRules = rules.length - 1, lenInt32 = (rules.length >> 5) + 1;
    for (var j = lenRules; j > -1; j--) {
        r = rules[j]; r.from == '*' && (r.from = null); r.to == '*' && (r.to = null);
        (from = r.from) && (r.reFrom = new RegExp(('^(?:' + from.replace(/([\[\]\(\)\\\.\^\$\|\+])/g, '\\$1')
            .replace(/\?/g, ').(?:').replace(/\*+/g, ').*?(?:') + ')$').replace(/\(\?:\)/g, '')));
        (to = r.to) && (r.reTo = new RegExp(('^(?:' + to.replace(/([\[\]\(\)\\\.\^\$\|\+])/g, '\\$1')
            .replace(/\?/g, ').(?:').replace(/\*+/g, ').*?(?:') + ')$').replace(/\(\?:\)/g, '')));
        r.mode = !!from * 2 + !!to;
    }
    rules.reverse();

    // 2. Messages processing
    var res, ret = {}, mIds = Object.keys(messages), b, w, g, m, headFrom, headTo, bitsFrom, bitsTo, mId
        , cache = Object.create(null), modeFrom = String.fromCharCode(0x18), modeTo = String.fromCharCode(0x19);
    for (var i = mIds.length - 1; i > -1; i--) {
        mId = mIds[i]; m = messages[mId]; from = m.from; to = m.to;
        !(headFrom = cache[from]) && (cache[from] = Object.create(null)) && (headFrom = cache[from]);
        g = headFrom; res = g[to];
        if (!res) {
            res = [];
            if (!(bitsFrom = headFrom[modeFrom])) {
                headFrom[modeFrom] = b = new Uint32Array(lenInt32);
                for (j = lenRules; j > -1; j--) if (1 < (r = rules[j]).mode && r.reFrom.test(from)) b[j >> 5] |= 1 << (j & 31);
                bitsFrom = headFrom[modeFrom];
            }
            !(headTo = cache[to]) && (cache[to] = Object.create(null)) && (headTo = cache[to]);
            if (!(bitsTo = headTo[modeTo])) {
                headTo[modeTo] = b = new Uint32Array(lenInt32);
                for (j = lenRules; j > -1; j--) if ((r = rules[j]).mode % 2 && r.reTo.test(to)) b[j >> 5] |= 1 << (j & 31);
                bitsTo = headTo[modeTo];
            }
            for (j = lenRules; j > -1; j--) {
                w = true;
                switch ((r = rules[j]).mode) {
                    case 3: w = bitsTo[j >> 5] & (1 << (j & 31));
                    case 2: w = w && (bitsFrom[j >> 5] & (1 << (j & 31))); break;
                    case 1: w = bitsTo[j >> 5] & (1 << (j & 31)); break;
                }
                w && (res[res.length] = r.action);
            }
            g[to] = res;
        }
        ret[mId] = res;
    }
    return ret;
};