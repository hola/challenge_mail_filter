/*******************************************
 * achemichevfilter.js
 * exports the single function - filter
 *
 * Created by alexey.chemichev on 25.12.2015.
 *******************************************/


module.exports.filter = (function () {

    'use strict';
    'use asm';

    // some mem
    var TOTALMEMORY = 64 * 1024 * 1024;
    var BUFFER = new ArrayBuffer(TOTALMEMORY);
    var HEAP8 = new Int8Array(BUFFER);
    var memBobber = 0 | 0; // drop to 0 if heap reset is needed

    function alloc(str) {
        var strLen = 0 | 0;
        if (str !== undefined) strLen = str.length; // undefined rule ~ 1 zero-char string
        var p = memBobber;
        for (var i = 0; i < strLen; i++)
            HEAP8[memBobber++] = str.charCodeAt(i) | 0;
        HEAP8[memBobber++] = 0 | 0; // finishing zero-char
        if (memBobber >= TOTALMEMORY)
            throw 'Local HEAP8 overflow - no more then 64M for messages and rules...';
        return p;
    }

    // b - input heap pointer, c - pattern heap pointer, built with asm.js
    function match(b, c) {
        b = b | 0;
        c = c | 0;

        var d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0;

        if (!(HEAP8[c >> 0] | 0)) return 1;// 1 zero-char string ~ '*' ( if rule is undefined )

        d = c;
        c = b;
        e = HEAP8[b >> 0] | 0;
        b = 0;
        a:while (1) {
            if (!(e << 24 >> 24)) {
                f = d;
                g = 13;
                break
            }
            b:do if (!b) {
                h = e;
                i = c;
                j = d;
                while (1) {
                    k = HEAP8[j >> 0] | 0;
                    switch (k << 24 >> 24) {
                        case 42:
                        {
                            l = h;
                            m = i;
                            n = j;
                            break b;
                            break
                        }
                        case 63:
                            break;
                        default:
                            if (k << 24 >> 24 != h << 24 >> 24) {
                                o = 0;
                                g = 15;
                                break a
                            }
                    }
                    i = i + 1 | 0;
                    k = j + 1 | 0;
                    h = HEAP8[i >> 0] | 0;
                    if (!(h << 24 >> 24)) {
                        f = k;
                        g = 13;
                        break a
                    } else j = k
                }
            } else {
                j = c;
                h = e;
                while (1) {
                    i = h;
                    k = j;
                    p = d;
                    c:while (1) {
                        q = HEAP8[p >> 0] | 0;
                        switch (q << 24 >> 24) {
                            case 42:
                            {
                                l = i;
                                m = k;
                                n = p;
                                break b;
                                break
                            }
                            case 63:
                                break;
                            default:
                                if (q << 24 >> 24 != i << 24 >> 24)break c
                        }
                        k = k + 1 | 0;
                        q = p + 1 | 0;
                        i = HEAP8[k >> 0] | 0;
                        if (!(i << 24 >> 24)) {
                            f = q;
                            g = 13;
                            break a
                        } else p = q
                    }
                    j = j + 1 | 0;
                    h = HEAP8[j >> 0] | 0;
                    if (!(h << 24 >> 24)) {
                        f = d;
                        g = 13;
                        break a
                    }
                }
            } while (0);
            d = n + 1 | 0;
            if (!(HEAP8[d >> 0] | 0)) {
                o = 1;
                g = 15;
                break
            } else {
                c = m;
                e = l;
                b = 1
            }
        }
        if ((g | 0) == 13) {
            while (1) {
                g = 0;
                b = HEAP8[f >> 0] | 0;
                l = b << 24 >> 24 == 0;
                if (b << 24 >> 24 == 42 & (l ^ 1)) {
                    f = f + 1 | 0;
                    g = 13
                } else {
                    r = l;
                    break
                }
            }
            o = r & 1;
            return o | 0
        } else if ((g | 0) == 15)return o | 0;
        return 0
    } // match()

    // the very filter function return statement
    return function (messages, rules) {

        var FROMTOPROPS = ['from', 'to'];

        memBobber = 0 | 0; // heap reset before allocation

        // alloc messages and rules

        Object.keys(messages).forEach(
            function (msgID) {
                FROMTOPROPS.forEach(
                    function (prop) {
                        messages[msgID][prop] = alloc(messages[msgID][prop]);
                    }
                );
            } // function (msgID)
        ); // keys(messages).forEach

        rules.forEach(
            function (rule) {
                FROMTOPROPS.forEach(
                    function (prop) {
                        rule[prop] = alloc(rule[prop]);
                    }
                );
            } // function (msgID)
        ); // rules.forEach

        var msgActions = {}; // Object to return from a filter function

        Object.keys(messages).forEach(
            function (msgID) {
                msgActions[msgID] = [];
                rules.forEach(
                    function (rule) {
                        if (FROMTOPROPS.every(
                                function (prop) {
                                    return match(messages[msgID][prop], rule[prop]);
                                }
                            )) // if
                            msgActions[msgID].push(rule.action);
                    } // function (rule)
                ); // rules.forEach
            } // function (msgID)
        ); // keys(messages).forEach

        return msgActions;

    }; // the very filter function return statement

})();
