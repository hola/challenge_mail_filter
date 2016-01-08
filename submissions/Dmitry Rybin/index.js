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

    // 1. Gen REs array from rules
    var r, from, to;
    for (var j = rules.length - 1; j > -1; j--) {
        r = rules[j];
        r.from == '*' && (r.from = null);
        r.to == '*' && (r.to = null);
        (from = r.from) && (r.reFrom = new RegExp(('^(?:' + from.replace(/([\[\]\(\)\\\.\^\$\|\+])/g, '\\$1')
            .replace(/\?/g, ').(?:').replace(/\*+/g, ').*?(?:') + ')$').replace(/\(\?:\)/g, '')));
        (to = r.to) && (r.reTo = new RegExp(('^(?:' + to.replace(/([\[\]\(\)\\\.\^\$\|\+])/g, '\\$1')
            .replace(/\?/g, ').(?:').replace(/\*+/g, ').*?(?:') + ')$').replace(/\(\?:\)/g, '')));
        r.mode = !!from * 2 + !!to;
    }
    rules.reverse();

    // 2. Messages processing
    var res, ret = {}, mIds = Object.keys(messages)
        , cache = Object.create(null), modeFrom = String.fromCharCode(0x18), modeTo = String.fromCharCode(0x19);
    for (var i = mIds.length - 1; i > -1; i--) {
        var g, headFrom, headTo, cacheFrom, cacheTo, mId = mIds[i], m = messages[mId];
        from = m.from; to = m.to; !cache[from] && (cache[from] = {}); headFrom = g = cache[from]; res = g[to];
        if (!res) {
            !cache[to] && (cache[to] = {}); headTo = cache[to]; res = [];
            !headFrom[modeFrom] && (headFrom[modeFrom] = []); headFrom = headFrom[modeFrom];
            !headTo[modeTo] && (headTo[modeTo] = []); headTo = headTo[modeTo];
            for (j = rules.length - 1; j > -1; j--) {
                r = rules[j];
                switch (r.mode) {
                    case 3:
                        undefined === (cacheFrom = headFrom[j]) && (headFrom[j] = cacheFrom = r.reFrom.test(from));
                        undefined === (cacheTo = headTo[j]) && (headTo[j] = cacheTo = r.reTo.test(to));
                        cacheFrom && cacheTo && (res[res.length] = r.action);
                        break;
                    case 2:
                        undefined === (cacheFrom = headFrom[j]) && (headFrom[j] = cacheFrom = r.reFrom.test(from));
                        cacheFrom && (res[res.length] = r.action);
                        break;
                    case 1:
                        undefined === (cacheTo = headTo[j]) && (headTo[j] = cacheTo = r.reTo.test(to));
                        cacheTo && (res[res.length] = r.action);
                        break;
                    case 0: res[res.length] = r.action;
                        break;
                }
            }
            g[to] = res;
        }
        ret[mId] = res;
    }
    return ret;
};
