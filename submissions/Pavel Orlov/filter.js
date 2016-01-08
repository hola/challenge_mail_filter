//Pavel Orlov
//"Hola" programming challenge:   http://hola.org/challenge_mail_filter

exports.filter = filter;

var result;

var oM;
var oR;

var maxSizeOfBuffer;

if (process.arch=='x64') {
    maxSizeOfBuffer = 2147483647; //64 bits architectures
} else {
    maxSizeOfBuffer = 1073741823; //32 bits architectures
}

function filter(messages, rules) {
    var key;
    var sizeOfCache;
    var cache;
    var itemNumberCache;
    var valueOfCache;
    var ruleIsTrue;

    var aTags;
    var hashMessageFrom;
    var hashMessageTo;
    var stringMessageFrom;
    var stringMessageTo;
    var bufferMessageFrom;
    var bufferMessageTo;
    var useCacheFrom;
    var useCacheTo;

    init(messages, rules);

    sizeOfCache = oM.lastHash * oR.lastHash;
    cache = new Buffer(sizeOfCache);
    cache.fill(0);

    for (var i = 0; i < oM.aKeys.length; i++) {
        key = oM.aKeys[i];
        aTags = [];

        hashMessageFrom = oM.aHashFrom[i];
        hashMessageTo = oM.aHashTo[i];
        stringMessageFrom = oM.aStrFrom[i];
        stringMessageTo = oM.aStrTo[i];
        bufferMessageFrom = oM.aBufFrom[i];
        bufferMessageTo = oM.aBufTo[i];

        if (hashMessageFrom == 0) {
            useCacheFrom = false;
        } else {
            useCacheFrom = true;
        }

        if (hashMessageTo == 0) {
            useCacheTo = false;
        } else {
            useCacheTo = true;
        }

        for (var j = 0; j < rules.length; j++) {

            ruleIsTrue = false;
            valueOfCache = 0;

            if (useCacheFrom) {
                itemNumberCache = oR.lastHash * hashMessageFrom + oR.aHashFrom[j];
                valueOfCache = cache[itemNumberCache];
            }
            if (valueOfCache == 0) {
                ruleIsTrue = checkRule(stringMessageFrom, oR.aStrFrom[j], bufferMessageFrom, oR.aBufFrom[j], j, 0);
                if (useCacheFrom) {
                    if (ruleIsTrue) {
                        cache[itemNumberCache] = 1;
                    } else {
                        cache[itemNumberCache] = 2;
                    }
                }

            } else {
                if (valueOfCache == 1) {
                    ruleIsTrue = true;
                } else if (valueOfCache == 2) {
                    ruleIsTrue = false;
                }
            }

            if (!ruleIsTrue) {
                continue;
            }

            ruleIsTrue = false;
            valueOfCache = 0;

            if (useCacheTo) {
                itemNumberCache = oR.lastHash * hashMessageTo + oR.aHashTo[j];
                valueOfCache = cache[itemNumberCache];
            }
            if (valueOfCache == 0) {
                ruleIsTrue = checkRule(stringMessageTo, oR.aStrTo[j], bufferMessageTo, oR.aBufTo[j], j, 1);
                if (useCacheTo) {
                    if (ruleIsTrue) {
                        cache[itemNumberCache] = 1;
                    } else {
                        cache[itemNumberCache] = 2;
                    }
                }
            } else {
                if (valueOfCache == 1) {
                    ruleIsTrue = true;
                } else if (valueOfCache == 2) {
                    ruleIsTrue = false;
                 }
            }

            if (!ruleIsTrue) {
                continue;
            }

            aTags.push(rules[j].action);
        }

        result[key] = aTags;

    }

    return result;
}

function init(messages, rules) {

    var buf;
    var hash;

    var key;
    var message;
    var messageFrom;
    var messageTo;

    var rule;

    var ruleString;

    var maxHashM;

    oM={};
    oR={};

    oM.adr = {};
    oR.adr = {};
    oR.a_42_from = [];
    oR.a_42_to = [];
    oR.a_63_from = [];
    oR.a_63_to = [];

    oM.aKeys = [];
    oM.aStrFrom = [];
    oM.aStrTo = [];
    oR.aStrFrom = [];
    oR.aStrTo = [];
    result = {};


    oM.aHashFrom = [];
    oM.aHashTo = [];
    oR.aHashFrom = [];
    oR.aHashTo = [];

    oM.lastHash = 1;
    oR.lastHash = 1;

    oM.aBufFrom = [];
    oM.aBufTo = [];

    oR.aBufFrom = [];
    oR.aBufTo = [];

    for (var i = 0; i < rules.length; i++) {
        rule = rules[i];
        if (rule.from) {
            ruleString = rule.from;
            while (ruleString.indexOf("**") != -1) {
                ruleString = ruleString.replace("**", "*");
            }
        } else {
            ruleString = "*";
        }
        oR.aStrFrom.push(ruleString);
        buf = new Buffer(ruleString, 'ascii');
        oR.aBufFrom.push(buf);
        oR.a_42_from.push(fillArrayCharacterPositions(buf, 42));
        oR.a_63_from.push(fillArrayCharacterPositions(buf, 63));

        hash = oR.adr[ruleString];
        if (hash == undefined) {
            oR.adr[ruleString] = oR.lastHash;
            hash = oR.lastHash;
            oR.lastHash++;
        }
        oR.aHashFrom.push(hash);

        if (rule.to) {
            ruleString = rule.to;
            while (ruleString.indexOf("**") != -1) {
                ruleString = ruleString.replace("**", "*");
            }
        } else {
            ruleString = "*";
        }
        oR.aStrTo.push(ruleString);
        buf = new Buffer(ruleString, 'ascii');
        oR.aBufTo.push(buf);
        oR.a_42_to.push(fillArrayCharacterPositions(buf, 42));
        oR.a_63_to.push(fillArrayCharacterPositions(buf, 63));

        hash = oR.adr[ruleString];
        if (hash == undefined) {
            oR.adr[ruleString] = oR.lastHash;
            hash = oR.lastHash;
            oR.lastHash++;
        }
        oR.aHashTo.push(hash);
    }

    maxHashM = Math.floor(maxSizeOfBuffer/oR.lastHash);

    for (key in messages) {
        message = messages[key];
        messageFrom = message.from;
        messageTo = message.to;

        oM.aKeys.push(key);
        oM.aStrFrom.push(messageFrom);

        buf = new Buffer(messageFrom, 'ascii');
        oM.aBufFrom.push(buf);

        oM.aStrTo.push(messageTo);

        buf = new Buffer(messageTo, 'ascii');
        oM.aBufTo.push(buf);


        hash = oM.adr[messageFrom];
        if (hash == undefined) {
            oM.adr[messageFrom] = 0;
        } else if ((hash == 0) && (oM.lastHash<maxHashM)) {
            oM.adr[messageFrom] = oM.lastHash;
            oM.lastHash++;
        }

        hash = oM.adr[messageTo];
        if (hash == undefined) {
            oM.adr[messageTo] = 0;
        } else if ((hash == 0) && (oM.lastHash<maxHashM)) {
            oM.adr[messageTo] = oM.lastHash;
            oM.lastHash++;
        }
    }

    for (var j = 0; j < oM.aKeys.length; j++) {
        oM.aHashFrom.push(oM.adr[oM.aStrFrom[j]]);
        oM.aHashTo.push(oM.adr[oM.aStrTo[j]]);
    }


    oM.adr = {};
    oR.adr = {};
}

function fillArrayCharacterPositions(buf, characterCode) {
    var arr = [];
    for (var j = 0; j < buf.length; j++) {
        if (buf[j] == characterCode) {
            arr.push(j);
        }
    }
    return arr;
}

function checkRule(strM, strR, bufM, bufR, j, dir) {
    if (strR == "*") {
        return true;
    } else {
        if (hasSymbol_42(j, dir)) {
            return checkStringFromBeginning(bufM, bufR, 0, 0, j, dir);
        } else {
            if (strM.length != strR.length) {
                return false;
            } else {
                if (hasSymbol_63(j, dir)) {
                    return checkStringFromBeginning(bufM, bufR, 0, 0, j, dir);
                } else {
                    return (strM == strR);
                }
            }
        }
    }
}

function checkStringFromBeginning(bufM, bufR, i_M, i_R, j, dir) {
    if (bufR[0] == 42) {
        if (((dir == 0) && (oR.a_42_from[j].length == 1)) || ((dir == 1) && (oR.a_42_to[j].length == 1)))
            return checkStringFromEnd(bufM, bufR);
    }
    for (i_R; i_R < bufR.length; i_R++) {

        if (bufR[i_R] == 63) {
            if (bufM[i_M] == undefined) {
                return false;
            }
            i_M++;
            continue;
        } else if (bufR[i_R] == 42) {
            if (++i_R == bufR.length) {
                return true;
            }
            for (var i_M_cycle = i_M; i_M_cycle < bufM.length; i_M_cycle++) {
                if (checkStringFromBeginning(bufM, bufR, i_M_cycle, i_R, j, dir)) {
                    return true;
                }
            }
            return false;
        } else if (bufR[i_R] != bufM[i_M]) {
            return false;
        }
        i_M++;
    }
    return (i_M == bufM.length);
}

function checkStringFromEnd(bufM, bufR) {
    var i_M = bufM.length - 1;
    for (var i_R = bufR.length - 1; i_R > 0; i_R--) {
        if ((bufR[i_R] == 63) || (bufR[i_R] == bufM[i_M])) {
            if (--i_M < 0) {
                if (i_R > 1) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return false;
        }
    }
    return true;
}


function hasSymbol_42(j, dir) {
    if (dir == 0) {
        return (oR.a_42_from[j].length > 0);
    } else {
        return (oR.a_42_to[j].length > 0)
    }
}

function hasSymbol_63(j, dir) {
    if (dir == 0) {
        return (oR.a_63_from[j].length > 0);
    } else {
        return (oR.a_63_to[j].length > 0)
    }
}
