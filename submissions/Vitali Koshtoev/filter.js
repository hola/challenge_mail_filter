"use strict";

function match(pat, str) {
    let pi = 0, si = 0;
    let spi = -1, ssi = -1;   
    let pl = pat.length;
    let sl = str.length;
    
    for (;;) {
        if (si === sl) {
            for (; pat[pi] === '*'; ++pi);
            return pi === pl;
        }
                      
        if (pat[pi] === '*') {
            for (; pat[pi + 1] === '*'; ++pi);
            if (pi + 1 === pl) {
                return true;
            } else if (si === sl) {
                return false;
            }
            ++pi;
            spi = pi;
            ssi = si;
            continue;
        }
        
        if (pat[pi] === '?' || pat[pi] === str[si]) {
            ++pi;
            ++si;
            continue;
        }

        if (ssi === -1 || ssi === sl) {
            return false;
        }

        pi = spi;
        si = ++ssi;
    }
    return false;
}


exports.filter = function (messages, rules) {
    let msgIds = Object.keys(messages);
    let result = {};
    for (let i=msgIds.length; i--;) {
        let msgId = msgIds[i];
        let msg = messages[msgId];
        let actions = [];
        let ruleCnt = rules.length;
        for (let j=0; j < ruleCnt; ++j) {
            let rule = rules[j];
            if ((rule.from === undefined || rule.from === '*' || match(rule.from, msg.from)) 
                && (rule.to === undefined || rule.to === '*' || match(rule.to, msg.to))) {
                actions.push(rule.action);
            }
        }
        result[msgId] = actions;
    }
    return result;
}