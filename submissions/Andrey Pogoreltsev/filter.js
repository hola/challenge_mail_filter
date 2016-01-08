// Copyright © 2015-2016 Andrey Pogoreltsev (rentgenx@gmail.com)
// define ranges
var maxChar = 0x7F;
var minChar = 0x20;
var range = maxChar - minChar + 1;
var questChar = "?".charCodeAt(0) - minChar;
var starChar = "*".charCodeAt(0) - minChar;
var MAX_STR_LEN = 0xffff;

var IDX_I8 = 0;
var IDX_MINLEN = 1;
var IDX_MAXLEN = 2;
var IDX_CHILD = 3;
var IDX_FENDS = 4;
var IDX_FWAY = 5;
var IDX_DICTUSE = 6;
var IDX_LASTUSED = 7;

function Node() {
    var n = [
        new Buffer(range).fill(0),
        MAX_STR_LEN,
        0,
        new Array(range),
        [],
        [],
        false,
        0
    ];
    return n;
};

function filter(messages, rules) {
    // from and to trees
    var rulesTreeFrom = Node();
    var rulesTreeTo = Node();
    // vars
    var keys = Object.keys(messages);
    var rl = rules.length;
    var kl = keys.length;
    var msgIds;
    var idx = 0;
    var msgFrom;
    var msgFromLen = 0;
    var msgTo;
    var msgToLen = 0;
    var msg;
    var msgF;
    var msgT;
    var msgFl;
    var msgTl;
    // prepare rules tree
    // split rule by *
    var splittedRule;
    var splittedLen;
    var rulLen;
    var rulesValidatedFrom32 = new Uint32Array(rl);
    var rulesValidatedTo32 = new Uint32Array(rl);

    for (var i = 0; i < rl; i++) {
        var rule = rules[i];
        // FROM
        var rf = rule.from ? rule.from : "*";
        // split rule by *
        splittedRule = rf.split("*");
        // calculate lenths
        rulLen = rf.length;
        splittedLen = splittedRule.length;
        if (splittedLen > 1) {
            ProcessRuleStar(rf, rulLen, splittedRule, splittedLen, i, rulesTreeFrom);
        } else {
            ProcessRule(rf, rulLen, i, rulesTreeFrom);
        }
        // TO
        var rt = rule.to ? rule.to : "*";
        // split rule by *
        splittedRule = rt.split("*");
        // calculate lenths
        rulLen = rt.length;
        splittedLen = splittedRule.length;
        if (splittedLen > 1) {
            ProcessRuleStar(rt, rulLen, splittedRule, splittedLen, i, rulesTreeTo);
        } else {
            ProcessRule(rt, rulLen, i, rulesTreeTo);
        }
    }
    // messages processing	
    // process by 32 elems
    for (var i = 0, j = kl >>> 5; i < j; i++ , idx += 32) {
        // reset validated array
        rulesValidatedFrom32.fill(0);
        rulesValidatedTo32.fill(0);
        // process messages
        msgIds = keys.slice(idx, idx + 32);
        for (var mi = 0; mi < 32; mi++) {
            // get message
            msg = messages[msgIds[mi]];
            msgF = msg.from;
            msgT = msg.to;
            msgFl = msgF.length;
            msgTl = msgT.length;
            // check current len
            if (msgFl > msgFromLen) {
                msgFrom = new Array(msgFl);
                msgFromLen = msgFl;
            }
            if (msgTl > msgToLen) {
                msgTo = new Array(msgTl);
                msgToLen = msgTl;
            }
            // convert message char codes array
            for (var k = 0; k < msgFl;) {
                msgFrom[k] = msgF.charCodeAt(k++) - minChar;
            }
            // convert message char codes array
            for (var k = 0; k < msgTl;) {
                msgTo[k] = msgT.charCodeAt(k++) - minChar;
            }
            // process messages and rules
            ProcessMessage(rulesValidatedFrom32, rulesValidatedTo32, 1 << mi, idx + mi + 1, rulesTreeFrom, rulesTreeTo, msgFrom, msgTo, msgFl, msgTl, rules, rl);
        }
        // process results
        ProcessResults32(rulesValidatedTo32, msgIds, 32, rules, rl, messages);
    }
	
    // process remain by one
    msgIds = new Array(32);
    for (; idx < kl; idx++) {
        var id = msgIds[0] = keys[idx];
        // get message
        msg = messages[id];
        msgF = msg.from;
        msgT = msg.to;
        msgFl = msgF.length;
        msgTl = msgT.length;
        // check current len
        if (msgFl > msgFromLen) {
            msgFrom = new Array(msgFl);
            msgFromLen = msgFl;
        }
        if (msgTl > msgToLen) {
            msgTo = new Array(msgTl);
            msgToLen = msgTl;
        }
        // convert message char codes array
        for (var k = 0; k < msgFl;) {
            msgFrom[k] = msgF.charCodeAt(k++) - minChar;
        }
        // convert message char codes array
        for (var k = 0; k < msgTl;) {
            msgTo[k] = msgT.charCodeAt(k++) - minChar;
        }
        //
        rulesValidatedFrom32.fill(0);
        rulesValidatedTo32.fill(0);
        ProcessMessage(rulesValidatedFrom32, rulesValidatedTo32, 1, idx + 1, rulesTreeFrom, rulesTreeTo, msgFrom, msgTo, msgFl, msgTl, rules, rl);
        // process result
        ProcessResults32(rulesValidatedTo32, msgIds, 1, rules, rl, messages);
    }
    return messages;
}
function ProcessValidate32(value, ridx, total, results, rules) {
    var act = rules[ridx].action;
    var fl = 1;
    for (var i = 0; i < total; ++i, fl = fl << 1) {
        if (value & fl) {
            results[i].push(act);
        }
    }
}
function ProcessResults32(rulesValidated32, msgIds, total, rules, rl, res) {
    var results = new Array([], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []);
    var rv;
    // check validated
    // go throught 32 bit array
    for (var i = 0, j = rulesValidated32.length; i < j; i++) {
        rv = rulesValidated32[i];
        if (rv != 0) {
            ProcessValidate32(rv, i, total, results, rules);
        }
    }
    for (var i = 0; i < total; ++i) {
        res[msgIds[i]] = results[i];
    }
}
function ProcessRuleNode(idx, curTree, ch, minLen, maxLen) {
    // add filter for way detection
    curTree[IDX_FWAY].push(idx);
    var ctI8 = curTree[IDX_I8][ch];
    // create inner array
    if (!ctI8) {
        curTree[IDX_I8][ch] = minLen + 1;
        curTree[IDX_CHILD][ch] = Node();
        curTree[IDX_DICTUSE] = true;
    } else {
        if (ctI8 > minLen) {
            curTree[IDX_I8][ch] = minLen + 1;
        }
    }
    // remember lengths
    if (curTree[IDX_MAXLEN] < maxLen) {
        curTree[IDX_MAXLEN] = maxLen;
    }
    if (curTree[IDX_MINLEN] > minLen) {
        curTree[IDX_MINLEN] = minLen;
    }
}
function ProcessRule(ruleStr, rl, idx, curTree) {
    // process char part
    for (var i = 0, minmax = rl; i < rl;) {
        var ch = ruleStr.charCodeAt(i++) - minChar;
        ProcessRuleNode(idx, curTree, ch, minmax, minmax--);
        // move next
        curTree = curTree[IDX_CHILD][ch];
    }
    // add filter to the last level
    curTree[IDX_FENDS].push(idx);
}

function ProcessRuleStar(ruleStr, rl, splittedRule, sl, idx, curTree) {
    var minLen = rl - sl + 1;

    // process splitted parts
    for (var i = 0; i < sl; i++) {
        // process char part
        var curPart = splittedRule[i];
        var cl = curPart.length;
        var lastNode = (i == sl - 1);
        var maxLen = lastNode ? cl : MAX_STR_LEN;
        for (var j = 0; j < cl;) {
            var ch = curPart.charCodeAt(j++) - minChar;
            ProcessRuleNode(idx, curTree, ch, minLen--, maxLen--);
            // move next
            curTree = curTree[IDX_CHILD][ch];
        }
        // process "*"
        if (!lastNode) {
            ProcessRuleNode(idx, curTree, starChar, minLen, MAX_STR_LEN);
            // move next
            curTree = curTree[IDX_CHILD][starChar];
        }
    }
    // add filter to the last level
    curTree[IDX_FENDS].push(idx);
}

function ProcessMessage(rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, rulesTreeFrom, rulesTreeTo, msgFrom, msgTo, msgFromLen, msgToLen, rules, rl) {
    // process from
    ProcessMessageReq(msgFrom, 0, msgFromLen, rulesTreeFrom, true, rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, false);
    // process to
    ProcessMessageReq(msgTo, 0, msgToLen, rulesTreeTo, false, rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, false);
}

function ProcessMessageReq(msgArray, pos, len, curTree, wayFrom, rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, star) {
    // add all end filters
    var dictUse = curTree[IDX_DICTUSE];
    if (star || pos == len) {
        var ct2 = curTree[IDX_FENDS];
        var i = ct2.length;
        while (i) {
            // increment
            var idx = ct2[--i];
            if (wayFrom) {
                rulesValidatedFrom32[idx] |= flag;
            } else {
                if (rulesValidatedFrom32[idx] & flag) {
                    rulesValidatedTo32[idx] |= flag;
                }
            }
        }
        if (!dictUse) {
            // mark we were here
            curTree[IDX_LASTUSED] = idxMsg;
        }
    }
    // don't process empty children
    if (!dictUse) {
        return;
    }
    // check way len
    var remain = len - pos;
    var remain1 = remain + 1;
    var curMin = curTree[IDX_MINLEN];
    var curMax = curTree[IDX_MAXLEN];
    if (curMin > remain) {
        return;
    }
    if (curMax < remain && !star) {
        return;
    }
    // check if we have necessary filters in way to. Skip lvl 0
    if (!wayFrom && pos) {
        var found = false;
        var ct3 = curTree[IDX_FWAY];
        for (var i = ct3.length; i; --i) {
            if (rulesValidatedFrom32[ct3[i - 1]] & flag) {
                found = true;
                break;
            }
        }
        if (!found) {
            return;
        }
    }
    var ct0 = curTree[IDX_I8];
    var ct0sch = ct0[starChar];
    var ct0qch = ct0[questChar];
    // check '*'
    if (ct0sch && ct0sch <= remain1) {
        var nextTree = curTree[IDX_CHILD][starChar];
        if (nextTree[IDX_LASTUSED] != idxMsg) {
            ProcessMessageReq(msgArray, pos, len, nextTree, wayFrom, rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, true);
        }
    }
    var posc = pos;
    var lenc = len;
    // process string
    var ct1 = curTree[IDX_CHILD];
    var nextTreeQuest = ct0qch ? ct1[questChar] : null;
    while (posc < lenc && curMin < remain1) {
        // process '?'
        if (ct0qch && ct0qch <= remain1 && nextTreeQuest[IDX_LASTUSED] != idxMsg) {
            ProcessMessageReq(msgArray, posc + 1, lenc, nextTreeQuest, wayFrom, rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, false);
        }
        // check character
        var ch = msgArray[posc];
        var ct0ch = ct0[ch];
        if (ct0ch && ct0ch <= remain1 && ch != starChar && ch != questChar) {
            var nextTree = ct1[ch];
            if (nextTree[IDX_LASTUSED] != idxMsg) {
                ProcessMessageReq(msgArray, posc + 1, lenc, nextTree, wayFrom, rulesValidatedFrom32, rulesValidatedTo32, flag, idxMsg, false);
            }
        }
        // check for previous star
        if (!star) return;
        posc++;
        remain1--;
    }
}

module.exports = filter;