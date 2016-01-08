'use strict'


const INDEX_CC = 8;
const INDEX_END_OFFSET = 5;
const buf = new Buffer(8);

function filter(messages, rules) {
    var index = makeIndex(messages, rules);
    filterWithIndex(index, rules);
    postProcessActions(index.keysArray, index.resultObject, index.actionsArray, index.actionsLengthsArray, index.rulesActionsArray);
    return index.resultObject;
}

function createMatchArray(rulesLength, messagesLength) {
    if (rulesLength <= 256)
        return new Uint8Array(messagesLength);
    if (rulesLength <= 65536)
        return new Uint16Array(messagesLength);
    return new Uint32Array(messagesLength);
}

function createReducedRulesArray(rulesLength) {
    const len = 4;
    if (rulesLength <= 256)
        return new Uint8Array(len);
    if (rulesLength <= 65536)
        return new Uint16Array(len);
    return new Uint32Array(len);
}

function filterWithIndex(index, rules) {
    var l = rules.length;
    var fdl = index.fdindex.length - 1;
    var searchSequence = [
        { strWeight: 0, strL: 0, indexArray: index.fdindex, valArray: index.fdWeights, matchArray: createMatchArray(l, fdl + 1) },
        { strWeight: 0, strL: 0, indexArray: index.ldindex, valArray: index.ldWeights, matchArray: createMatchArray(l, fdl + 1) },
        { strWeight: 0, strL: 0, indexArray: index.frindex, valArray: index.frWeights, matchArray: createMatchArray(l, fdl + 1) },
        { strWeight: 0, strL: 0, indexArray: index.lrindex, valArray: index.lrWeights, matchArray: createMatchArray(l, fdl + 1) }
    ];
    var reducedRules = createReducedRulesArray(l);
    var fnames = index.fnamesArray;
    var lnames = index.lnamesArray;
    var actionsArray = index.actionsArray;
    var actionsLengthsArray = index.actionsLengthsArray;
    for (var i = 0; i < l; i++) {
        var rule = rules[i];
        if (rule.fullWeak) {
            addForAll(actionsArray, actionsLengthsArray, l, i);
            continue;
        }
        searchSequence[0].strWeight = rule.fromSubstrW;
        searchSequence[1].strWeight = rule.toSubstrW;
        searchSequence[2].strWeight = rule.fromSubstrRW;
        searchSequence[3].strWeight = rule.toSubstrRW;
        
        searchSequence[0].strL = rule.fromSubstr.length;
        searchSequence[1].strL = rule.toSubstr.length;
        searchSequence[2].strL = rule.fromSubstrR.length;
        searchSequence[3].strL = rule.toSubstrR.length;
        var fromRegexp = rule.fromRegexp
        var toRegexp = rule.toRegexp;
        
        var minValue = fdl + 1;
        var minRule = 0;
        var minLo = 0;
        var minHi = fdl;
        var minDirection = 0;
        var ok = 1;
        
        
        var si = 4;
        while (si--) {
            var searchRule = searchSequence[si];
            if (searchRule.strL > 0) {
                var reducedRange = binarySearchRange(searchRule.strWeight, searchRule.strL, searchRule.indexArray, searchRule.valArray);
                if (reducedRange !== null) {
                    var rglo = reducedRange.lo;
                    var rghi = reducedRange.hi;
                    if ((rghi - rglo) < (fdl + 1) / 4) {
                        var matchArray = searchRule.matchArray;
                        var indexArray = searchRule.indexArray;
                        reducedRules[si] = i;
                        for (var fi = rglo; fi <= rghi; fi++) {
                            matchArray[indexArray[fi]] = i;
                        }

                    }
                    var r = rghi - rglo;
                    if (r < minValue) {
                        minValue = r;
                        minRule = si;
                        minLo = rglo;
                        minHi = rghi;
                        minDirection = si % 2;
                    }
                } else {
                    ok = 0;
                    break;
                }
            }
        }
        
        if (ok === 0)
            continue;
        
        var indexArray = searchSequence[minRule].indexArray;
        var valArray = searchSequence[minRule].valArray;
        
        for (var ii = minLo; ii <= minHi; ii++) {
            
            var ir = indexArray[ii];
            
            if (minValue > 0) {
                var rli = 4;
                var md = true;
                while (md && rli--) {
                    if (rli === minRule || reducedRules[rli] !== i)
                        continue;
                    md = (searchSequence[rli].matchArray[ir] === i);
                }
                if (!md) {
                    continue;
                }
            }
            
            
            
            var irvfname = fnames[ir];
            var irvlname = lnames[ir];
            var cmp = false;
            if (minDirection === 0) {
                cmp = isMatchByRegexp(irvlname, toRegexp) && isMatchByRegexp(irvfname, fromRegexp);
            } else {
                cmp = isMatchByRegexp(irvfname, fromRegexp) && isMatchByRegexp(irvlname, toRegexp);
            }
            
            if (cmp === true) {
                addAction(ir, actionsArray, actionsLengthsArray, l, i);
            }
        }


    }
}


function addForAll(actionsArray, actionsLengthsArray, rl, actionIndex) {
    var al = actionsLengthsArray.length;
    var i;
    for (i = 0; i < al; i++) {
        actionsArray[i * rl + actionsLengthsArray[i]] = actionIndex;
    }
    for (i = 0; i < al; i++) {
        actionsLengthsArray[i] = actionsLengthsArray[i] + 1;
    }
}

function addAction(msgIndex, actionsArray, actionsLengthsArray, rl, actionIndex) {
    var acl = actionsLengthsArray[msgIndex];
    actionsLengthsArray[msgIndex] = acl + 1;
    actionsArray[msgIndex * rl + acl] = actionIndex;
}

function postProcessActions(keysArray, resultObject, actionsArray, actionsLengthsArray, rules) {
    var rl = rules.length;
    var al = keysArray.length;
    for (var i = 0; i < al; i++) {
        var l = actionsLengthsArray[i];
        var m = new Array(l);
        for (var j = 0; j < l; j++) {
            m[j] = rules[actionsArray[i * rl + j]];
        }
        resultObject[keysArray[i]] = m;
    }
}

function makeIndex(messages, rules) {
    var keys = Object.keys(messages);
    var kl = keys.length;
    var fnamesArray = new Array(kl);
    var lnamesArray = new Array(kl);
    
    var fdindex = new Uint32Array(kl);
    var fdWeights = new Float64Array(kl);
    
    var ldindex = new Uint32Array(kl);
    var ldWeights = new Float64Array(kl);
    
    var frindex = new Uint32Array(kl);
    var frWeights = new Float64Array(kl);
    
    var lrindex = new Uint32Array(kl);
    var lrWeights = new Float64Array(kl);
    
    
    
    
    var resultObject = messages;
    var rl = rules.length;
    
    if (rl <= 256) {
        var actionsArray = new Uint8Array(kl * rl);
        var actionsLengthsArray = new Uint8Array(kl);
    } if (rl <= 65536) {
        var actionsArray = new Uint16Array(kl * rl);
        var actionsLengthsArray = new Uint16Array(kl);
    } else {
        var actionsArray = new Uint32Array(kl * rl);
        var actionsLengthsArray = new Uint32Array(kl);
    }
    
    
    
    var key = '';
    var msg = '';
    var fname = '';
    var lname = '';
    var fdnamew = 0;
    var ldnamew = 0;
    var frnamew = 0;
    var lrnamew = 0;
    
    for (var i = 0; i < kl; i++) {
        key = keys[i];
        msg = messages[key];
        
        fname = msg.from;
        lname = msg.to;
        
        
        
        fdnamew = getStrWeight(fname, 0, 0);
        ldnamew = getStrWeight(lname, 0, 0);
        frnamew = getStrWeight(fname, 1, fname.length - INDEX_END_OFFSET - INDEX_CC);
        lrnamew = getStrWeight(lname, 1, lname.length - INDEX_END_OFFSET - INDEX_CC);
        
        
        
        fdWeights[i] = fdnamew;
        ldWeights[i] = ldnamew;
        frWeights[i] = frnamew;
        lrWeights[i] = lrnamew;
        
        fdindex[i] = i;
        ldindex[i] = i;
        frindex[i] = i;
        lrindex[i] = i;
        
        fnamesArray[i] = fname;
        lnamesArray[i] = lname;
    }
    
    
    
    fdindex = quickSort(fdindex, 0, kl - 1, fdWeights);
    ldindex = quickSort(ldindex, 0, kl - 1, ldWeights);
    frindex = quickSort(frindex, 0, kl - 1, frWeights);
    lrindex = quickSort(lrindex, 0, kl - 1, lrWeights);
    
    var rulesActionsArray = new Array(rl);
    i = rl;
    while (i--) {
        var rule = rules[i];
        rulesActionsArray[i] = rule.action;
        rule.fromPattern = rule.from;
        if (rule.fromPattern === undefined)
            rule.fromPattern = '*';
        rule.toPattern = rule.to;
        if (rule.toPattern === undefined)
            rule.toPattern = '*';
        rule.fromSubstr = getSearchSubstr(rule.fromPattern, 0);
        rule.toSubstr = getSearchSubstr(rule.toPattern, 0);
        rule.fromSubstrR = getSearchSubstr(rule.fromPattern, 1);
        rule.toSubstrR = getSearchSubstr(rule.toPattern, 1);
        rule.fromRegexp = getRegexp(rule.fromPattern);
        rule.toRegexp = getRegexp(rule.toPattern);
        rule.fromSubstrW = getStrWeight(rule.fromSubstr, 0, 0);
        rule.toSubstrW = getStrWeight(rule.toSubstr, 0, 0);
        rule.fromSubstrRW = getStrWeight(rule.fromSubstrR, 1, 0);
        rule.toSubstrRW = getStrWeight(rule.toSubstrR, 1, 0);
        
        rule.fullWeak = rule.fromRegexp.type === 0 && rule.toRegexp.type === 0;
    }
    
    return {
        fnamesArray: fnamesArray,
        lnamesArray: lnamesArray,
        keysArray: keys,
        actionsArray: actionsArray,
        actionsLengthsArray: actionsLengthsArray,
        rulesActionsArray: rulesActionsArray,
        fdindex: fdindex,
        ldindex: ldindex,
        frindex: frindex,
        lrindex: lrindex,
        resultObject: resultObject,
        fdWeights: fdWeights,
        ldWeights: ldWeights,
        frWeights: frWeights,
        lrWeights: lrWeights
    }
}

function getRegexp(pattern) {
    if (pattern === '*') {
        return {
            type: 0
        }
    }
    // 0 - weak
    // 1 - string
    // 2 - regexp
    var wildcardFound = false;
    var pstr = '';
    var ptrn = pattern.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&");
    for (var i = 0; i < ptrn.length; i++) {
        var c = ptrn[i];
        if (c === '*') {
            pstr = pstr + '.*';
            wildcardFound = true;
        } else if (c === '?') {
            pstr = pstr + '.';
            wildcardFound = true;
        } else
            pstr = pstr + c;
    }
    if (wildcardFound) {
        var regexp = new RegExp('^' + pstr + '$');
        var type = 2;
    } else {
        var regexp = pattern;
        var type = 1;
    }
    return { type: type, value: regexp };
}


function getStrWeight(str, fromBegin, from_) {
    var strl = str.length;
    if (strl === 0) {
        return 0;
    }
    var from = from_;
    if (from < 0)
        from = 0;
    var to = from_ + INDEX_CC - 1;
    if (to >= strl)
        to = strl - 1;
    var l = to - from + 1;
    if (l === 0) {
        return 0;
    }
    var tail = INDEX_CC - l;
    var k = 0;
    if (fromBegin === 0) {
        for (var i = from, k = 0; i <= to; i++, k++) {
            buf[k] = str.charCodeAt(i) - 0x20;
        }
        while (k < INDEX_CC) {
            buf[k++] = 0;
        }
    } else {
        for (var i = to, k = 0; i >= from; i--, k++) {
            buf[k] = str.charCodeAt(i) - 0x20;
        }
        while (k < INDEX_CC) {
            buf[k++] = 0;
        }
    }
    return buf.readDoubleBE(0);
}




function isMatchByRegexp(str, regexpObj) {
    var type = regexpObj.type;
    if (type === 0) {
        return true;
    } else if (type === 1) {
        return str === regexpObj.value;
    } else {
        return regexpObj.value.test(str);
    }
}

function getSearchSubstr(pattern, fromBegin) {
    var l = Math.min(INDEX_CC, pattern.length);
    if (fromBegin === 0) {
        var start = 0;
        var end = l;
        for (var i = start; i < end; i++) {
            var c = pattern.charCodeAt(i);
            if (c === 42 || c === 63) {
                end = i;
                break;
            }
        }
    } else {
        var start = pattern.length - l - INDEX_END_OFFSET;
        if (start < 0)
            start = 0;
        var end = pattern.length;
        for (var i = end - 1; i >= start; i--) {
            var c = pattern.charCodeAt(i);
            if (c === 42 || c === 63) {
                start = i + 1;
                end = pattern.length - INDEX_END_OFFSET;
                if (end < start)
                    end = start;
                break;
            }
            if (i === start) {
                end = pattern.length - INDEX_END_OFFSET;
                if (end < start)
                    end = start;
                break;
            }
        }

    }
    return pattern.substring(start, end);
}



/// BS


function binarySearchRange(strWeight, strL, array, valArray) {
    var lo = 0;
    var hi = array.length - 1;
    var middle = binarySearch(strWeight, strL, array, valArray, lo, hi);
    if (middle === -1) {
        return null;
    }
    lo = middle;
    hi = middle;
    if (lo > 0) {
        var lc = middle - 1;
        while (lc >= 0 && (lc = binarySearch(strWeight, strL, array, valArray, 0, lc)) !== -1) {
            lo = lc;
            lc--;
        }
    }
    if (hi < array.length - 1) {
        var hc = middle + 1;
        while (hc <= array.length - 1 && (hc = binarySearch(strWeight, strL, array, valArray, hc, array.length - 1)) !== -1) {
            hi = hc;
            hc++;
        }
    }
    return { lo: lo, hi: hi };
}

function binarySearch(strWeight, strL, array, valArray, lo_, hi_) {
    var lo = lo_,
        hi = hi_,
        mid,
        element;
    while (lo <= hi) {
        mid = Math.floor((lo + hi) / 2, 10);
        element = valArray[array[mid]];
        var cmp = substrCmp(strWeight, strL, element);
        if (cmp === -1) {
            lo = mid + 1;
        } else if (cmp === 1) {
            hi = mid - 1;
        } else {
            return mid;
        }
    }
    return -1;
}

function substrCmp(sw, strL, testWeight) {
    var tw = testWeight;
    var i;
    if (strL < INDEX_CC) {
        buf.writeDoubleBE(tw, 0);
        for (i = strL; i < INDEX_CC; i++)
            buf[i] = 0;
        tw = buf.readDoubleBE(0);
    }
    
    
    if (tw > sw)
        return 1;
    
    if (tw < sw)
        return -1;
    
    
    return 0;
}


////

/// QS

function swap(items, firstIndex, secondIndex) {
    var t = items[secondIndex];
    items[secondIndex] = items[firstIndex];
    items[firstIndex] = t;
}

function partition(items, left, right, weightsArray) {
    
    var pivot = items[Math.floor((right + left) / 2)],
        i = left,
        j = right;
    
    var pfname = weightsArray[pivot];
    
    while (i <= j) {
        
        while (weightsArray[items[i]] < pfname) {
            i++;
        }
        
        while (weightsArray[items[j]] > pfname) {
            j--;
        }
        
        if (i <= j) {
            swap(items, i, j);
            i++;
            j--;
        }
    }
    
    return i;
}

function quickSort(items, left, right, weightsArray) {
    
    var index;
    
    if (items.length > 1) {
        
        index = partition(items, left, right, weightsArray);
        
        if (left < index - 1) {
            quickSort(items, left, index - 1, weightsArray);
        }
        
        if (index < right) {
            quickSort(items, index, right, weightsArray);
        }

    }
    
    return items;
}

module.exports = filter;