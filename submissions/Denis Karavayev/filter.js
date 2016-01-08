"use strict";

//  General comments went out to speedup module loading times

//  *   -   0x2A / 42
//  ?   -   0x3F / 63

var bufFrom = new Uint8Array(128 * 1024);
var bufTo   = new Uint8Array(128 * 1024);

var cRules,     //  Compiled rules
    cIndex,     //  Compiled rules pointers
    cActions,   //  actions array (DPA in Phase2)
    rl,         //  Length of the rules array
    gin;        //  Global pointer in cRules


exports.filter = function (messages, rules) {
    var mi, ml, fi, ti, ri, cin, i;
    var prop, obj, str, res;

    var mes = Object.getOwnPropertyNames(messages);
    if ((ml = mes.length) > 0) {
        prop = mes[0];
        obj = messages[prop];

        gin = -1;
        rl = rules.length;
        cRules = new Uint8Array(rl * 2 * 256);
        cIndex = new Uint32Array(rl * 2);
        cActions = [];

        messages[prop] = phase1(str2buf(obj.from), str2buf(obj.to), rules);     //  phase1()
        for (mi = 1; mi < ml; mi++) {
            prop = mes[mi];
            obj = messages[prop];
            str = obj.from; i = str.length; bufFrom[i] = 0;
            while (i-- > 0) bufFrom[i] = str.charCodeAt(i);
            str = obj.to; i = str.length; bufTo[i] = 0;
            while (i-- > 0) bufTo[i] = str.charCodeAt(i);
            for (res = [], cin = 0, ri = 0; ri < rl; ri++) {                    //  phase2()
                if (((fi = cIndex[cin++]) > 4294967294 || gTCC(bufFrom, fi)) && ((ti = cIndex[cin]) > 4294967294 || gTCC(bufTo, ti)))
                    res.push(cActions[ri]);
                cin += 1;
            }
            messages[prop] = res;
        }
    }
    return messages;
};


function phase1 (objFrom, objTo, rules) {
    var result = [];
    var cin = 0;
    var rule, action;

    for (var ri = 0; ri < rl; ri++) {
        rule = rules[ri];
        cActions.push(action = rule.action);
        gin += 1;
        if (rule.from) {
            cIndex[cin++] = gin;
            if (gTC(objFrom, rule.from)) {
                if (cRules[gin - 1] === 0x2A && (gin - cIndex[cin - 1]) === 1)
                    cIndex[cin - 1] = -1;
                gin += 1;
                if (rule.to) {
                    cIndex[cin++] = gin;
                    if (gTC(objTo, rule.to)) {
                        if (cRules[gin - 1] === 0x2A && (gin - cIndex[cin - 1]) === 1)
                            cIndex[cin - 1] = -1;
                        result.push(action);
                    }
                } else {
                    cIndex[cin++] = -1;
                    result.push(action);
                }
            } else {
                gin += 1;
                if (rule.to) {
                    cIndex[cin++] = gin;
                    gTC(objTo, rule.to);
                    if (cRules[gin - 1] === 0x2A && (gin - cIndex[cin - 1]) === 1)
                        cIndex[cin - 1] = -1;
                } else
                    cIndex[cin++] = -1;
            }
        } else {
            cIndex[cin++] = -1;
            gin += 1;
            if (rule.to) {
                cIndex[cin++] = gin;
                if (gTC(objTo, rule.to)) {
                    if (cRules[gin - 1] === 0x2A && (gin - cIndex[cin - 1]) === 1)
                        cIndex[cin - 1] = -1;
                    result.push(action);
                }
            } else {
                cIndex[cin++] = -1;
                result.push(action);
            }
        }
    }
    return result;
}


function gTC (tameText, wildText) {
    function wildComp () {
        cRules[gin++] = char;
        while (++pw < wl) {
            if (wildText.charCodeAt(pw) === 0x2A) {
                cRules[gin++] = 0x2A;
                while (++pw < wl && wildText.charCodeAt(pw) === 0x2A) {}
                if (pw >= wl) break;
            }
            cRules[gin++] = wildText.charCodeAt(pw);
        }
        return false;
    }

    var tl = tameText.length,
        wl = wildText.length,
        pt = 0, pw = 0,
        pTB = 0, pWB = 0,
        char;

    while (true) {
        if (pw < wl) {
            char = wildText.charCodeAt(pw);
            if (char === 0x2A) {
                cRules[gin++] = char;
                while (++pw < wl && wildText.charCodeAt(pw) === 0x2A) {}
                if (pw >= wl) return true;
                if ((char = wildText.charCodeAt(pw)) !== 0x3F) {
                    while (pt < tl && tameText[pt++] !== char) {}
                    if (pt-- >= tl) return wildComp();  //  false
                }
                pWB = pw;
                pTB = pt;
            } else {
                if (pt < tl && tameText[pt] !== char && char !== 0x3F) {
                    if (pWB > 0) {
                        if (pw !== pWB) {
                            gin -= pw - pWB;
                            char = wildText.charCodeAt(pw = pWB);
                            if (tameText[pt] !== char) {
                                pt = ++pTB;
                                continue;
                            } else {
                                char = wildText.charCodeAt(++pw);
                                gin += 1;
                            }
                        }
                        if (pt++ < tl) continue;
                    }
                    return wildComp();  //  false
                }
            }
            cRules[gin++] = char;
        }
        pw += 1;
        pt += 1;

        if (pt >= tl) {
            if (pw < wl) {
                char = wildText.charCodeAt(pw);
                if (char === 0x2A) {
                    cRules[gin++] = char;
                    while (++pw < wl && (char = wildText.charCodeAt(pw)) === 0x2A) {}
                    return pw === wl ? true : wildComp();
                }
                return wildComp();  //  false
            }
            return true;
        }
    }
}


function gTCC (strObj, pw) {
    var pt = 0, pTB = 0, pWB = 0;
    while (true) {
        if (cRules[pw] === 0x2A) {
            if (!cRules[++pw]) return true;
            if (cRules[pw] !== 0x3F)
                while (strObj[pt] !== cRules[pw])
                    if (!strObj[++pt]) return false;
            pWB = pw; pTB = pt;
        } else if (strObj[pt] !== cRules[pw] && cRules[pw] !== 0x3F) {
            if (pWB > 0) {
                if (pw !== pWB) {
                    pw = pWB;
                    if (strObj[pt] != cRules[pw]) {
                        pt = ++pTB;
                        continue;
                    } else pw += 1;
                }
                if (strObj[pt] > 0) { pt += 1; continue; }
            }
            return false;
        }
        pw += 1; pt += 1;
        if (!strObj[pt]) return (cRules[pw] === 0x2A) ? !cRules[++pw] : !cRules[pw];
    }
}


function str2buf (str) {
    var i = str.length;
    var buf = new Uint8Array(i);
    while (i--) buf[i] = str.charCodeAt(i);
    return buf;
}
