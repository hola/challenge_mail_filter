function occurrences(string, subString, start) {
  if (subString.length <= 0) return string.length + 1;

  var n = 1,
    pos = start,
    step = subString.length;

  for (;;) {
    pos = string.indexOf(subString, pos);
    if (pos >= 0) {
      n++;
      pos += step;
    } else break;
  }
  return n;
}

function compare(r, m, rl, ml) {
  if (rl !== ml) {
    return 0;
  }

  return compare2(r, m, rl);
}

function compare2(r, m, rl) {
  var i = 1, r1;

  for (; i < rl;) {
    r1 = r.charCodeAt(i);
    if (r1 === m.charCodeAt(i) || 63 === r1) {
      i += 1;
      continue;
    }

    return 0;
  }
  return 1;
}

var regexpRules = {};
var re1 = /([\.\\\+\[\|\{\(\)\$\^])/g;
var re2 = /\*\?\*/g;
var re3 = /\*/g;
var re4 = /\?/g;
function getRegexp(v) {
  if (!regexpRules[v]) {
    return regexpRules[v] = new RegExp('^' + v.replace(re1, '\\$1').replace(re2, '.+').replace(re3, '.*').replace(re4, '.') + '$');
  }
  return regexpRules[v];
}


function filter(messages, rules) {
  var msgKeys = Object.keys(messages),
    ml = msgKeys.length,
    rl = rules.length,
    needs = new ArrayBuffer(rl), rlsFromNeedsIdx = new Buffer(rl).fill(0), rlsToNeedsIdx = new Buffer(rl).fill(0),
    i, k, f, t, ff, tf, rule, tmp, tmp2, tmp3, tmp4,
    actions = new Array(rl), ruleFrom = new Array(rl), ruleTo = new Array(rl),
    ruleFirstFrom = new ArrayBuffer(rl), ruleFirstTo = new ArrayBuffer(rl),
    ruleLastFrom = new ArrayBuffer(rl), ruleLastTo = new ArrayBuffer(rl),
    ruleAstQtyFrom = new Uint8Array(rl), ruleAstQtyTo = new Uint8Array(rl),
    ruleLengthFrom = new Uint32Array(rl), ruleLengthTo = new Uint32Array(rl),
    ruleLengthFromMin = new Uint32Array(rl), ruleLengthToMin = new Uint32Array(rl),
    offset = 32, ruleFirstAstFromIdx = new Uint32Array(rl), ruleFirstAstToIdx = new Uint32Array(rl),
    ruleFromSubstr1G = new Array(rl), ruleToSubstr1G = new Array(rl);

  i = rl;
  for (; i > 0;) {
    k = 0;
    rule = rules[--i];
    f = rule.from;
    t = rule.to;
    actions[i] = rule.action;

    if (f && f !== '*') {
      f = f.replace(/\*{2,32}/g, '*');
      if (f !== '*') {
        ruleFrom[i] = f;
        ff = f.charCodeAt(0) - offset;
        ruleFirstFrom[i] = ff;
        tmp = f.length;
        ruleLastFrom[i] = f.charCodeAt(tmp - 1) - offset;
        tmp2 = 10 === ff ? 0 : f.indexOf('*', 1);
        if (tmp2 >= 0) {
          rlsFromNeedsIdx[i] |= 2;
          ruleLengthFrom[i] = tmp;
          tmp4 = occurrences(f, '*', tmp2);
          ruleAstQtyFrom[i] = tmp4;
          ruleFirstAstFromIdx[i] = tmp2;
          tmp3 = tmp2 - 1;
          if (tmp3 > 0) ruleFromSubstr1G[i] = f.substr(1, tmp3);
          ruleLengthFromMin[i] = tmp - tmp4;
        } else {
          if (31 === ff || f.indexOf('?', 1) > 0) {
            rlsFromNeedsIdx[i] |= 1;
            ruleLengthFromMin[i] = tmp - 1;
            ruleLengthFrom[i] = tmp;
          }
        }
        k |= 1;
      }
    }

    if (t && t !== '*') {
      t = t.replace(/\*{2,32}/g, '*');
      if (t !== '*') {
        ruleTo[i] = t;
        tf = t.charCodeAt(0) - offset;
        ruleFirstTo[i] = tf;
        tmp = t.length;
        ruleLastTo[i] = t.charCodeAt(tmp - 1) - offset;
        tmp2 = 10 === tf ? 0 : t.indexOf('*', 1);
        if (tmp2 >= 0) {
          rlsToNeedsIdx[i] |= 2;
          ruleLengthTo[i] = tmp;
          tmp4 = occurrences(t, '*', tmp2);
          ruleAstQtyTo[i] = tmp4;
          ruleFirstAstToIdx[i] = tmp2;
          tmp3 = tmp2 - 1;
          if (tmp3 > 0) ruleToSubstr1G[i] = t.substr(1, tmp3);
          ruleLengthToMin[i] = tmp - tmp4;
        } else {
          if (31 === tf || t.indexOf('?', 1) > 0) {
            rlsToNeedsIdx[i] |= 1;
            ruleLengthToMin[i] = tmp - 1;
            ruleLengthTo[i] = tmp;
          }
        }
        k |= 2;
      }
    }

    if (k) needs[i] = k;
  }

  var msg, mff, mft, mlf, mlt, rff, rft, res, rlf, rlt, fl, tl, h, g,
    j = 0;

  for (; j < ml; j++) {
    msg = messages[msgKeys[j]];
    f = msg.from;
    t = msg.to;
    i = 0;
    h = 0;

    fl = f.length;
    mff = f.charCodeAt(0) - offset;
    mft = t.charCodeAt(0) - offset;

    tl = t.length;
    mlf = f.charCodeAt(fl - 1) - offset;
    mlt = t.charCodeAt(tl - 1) - offset;

    messages[msgKeys[j]] = [];
    msg = messages[msgKeys[j]];

    l: for (; i < rl; i++) {
      k = needs[i];
      if (!k) {
        msg[h++] = actions[i];
        continue l;
      }

      if (1 === k) {
        rff = ruleFirstFrom[i];
        rlf = ruleLastFrom[i];
        tmp = rlsFromNeedsIdx[i];

        if (!tmp) {
          if (mff !== rff || mlf !== rlf) {
            continue l;
          }
        } else {
          if (1 === tmp) {
            if ((rff !== mff && 31 !== rff) || (rlf !== mlf && 31 !== rlf)) {
              continue l;
            }
          } else {
            if ((rff !== mff && 10 !== rff && 31 !== rff) || (rlf !== mlf && 10 !== rlf && 31 !== rlf)) {
              continue l;
            }

            g = ruleFirstAstFromIdx[i] - 1;
            if (g > 0) {
              if (!compare2(ruleFromSubstr1G[i], f.substr(1, g), g)) {
                continue l;
              }
            }
          }
        }

        if (!tmp) {
          if (f !== ruleFrom[i]) {
            continue l;
          }
        } else {
          if (1 === tmp) {
            if (!compare(ruleFrom[i], f, ruleLengthFromMin[i], fl - 1)) {
              continue l;
            }
          } else {
            if (!getRegexp(ruleFrom[i]).test(f)) {
              continue l;
            }
          }
        }
      } else if (k === 2) {
        rft = ruleFirstTo[i];
        rlt = ruleLastTo[i];
        tmp = rlsToNeedsIdx[i];

        if (!tmp) {
          if (mft !== rft || mlt !== rlt) {
            continue l;
          }
        } else {
          if (1 === tmp) {
            if ((rft !== mft && 31 !== rft) || (rlt !== mlt && 31 !== rlt)) {
              continue l;
            }
          } else {
            if ((rft !== mft && 10 !== rft && 31 !== rft) || (rlt !== mlt && 10 !== rlt && 31 !== rlt)) {
              continue l;
            }

            g = ruleFirstAstToIdx[i] - 1;
            if (g > 0) {
              if (!compare2(ruleToSubstr1G[i], t.substr(1, g), g)) {
                continue l;
              }
            }
          }
        }

        if (!tmp) {
          if (t !== ruleTo[i]) {
            continue l;
          }
        } else {
          if (1 === tmp) {
            if (!compare(ruleTo[i], t, ruleLengthToMin[i], tl - 1)) {
              continue l;
            }
          } else {
            if (!getRegexp(ruleTo[i]).test(t)) {
              continue l;
            }
          }
        }
      } else {
        rff = ruleFirstFrom[i];
        rlf = ruleLastFrom[i];
        tmp = rlsFromNeedsIdx[i];

        if (!tmp) {
          if (mff !== rff || mlf !== rlf) {
            continue l;
          }
        } else {
          if (1 === tmp) {
            if ((rff !== mff && 31 !== rff) || (rlf !== mlf && 31 !== rlf)) {
              continue l;
            }
          } else {
            if ((rff !== mff && 10 !== rff && 31 !== rff) || (rlf !== mlf && 10 !== rlf && 31 !== rlf)) {
              continue l;
            }

            g = ruleFirstAstFromIdx[i] - 1;
            if (g > 0) {
              if (!compare2(ruleFromSubstr1G[i], f.substr(1, g), g)) {
                continue l;
              }
            }
          }
        }

        rft = ruleFirstTo[i];
        rlt = ruleLastTo[i];
        tmp2 = rlsToNeedsIdx[i];

        if (!tmp2) {
          if (mft !== rft || mlt !== rlt) {
            continue l;
          }
        } else {
          if (1 === tmp2) {
            if ((rft !== mft && 31 !== rft) || (rlt !== mlt && 31 !== rlt)) {
              continue l;
            }
          } else {
            if ((rft !== mft && 10 !== rft && 31 !== rft) || (rlt !== mlt && 10 !== rlt && 31 !== rlt)) {
              continue l;
            }

            g = ruleFirstAstToIdx[i] - 1;
            if (g > 0) {
              if (!compare2(ruleToSubstr1G[i], t.substr(1, g), g)) {
                continue l;
              }
            }
          }
        }

        if (!tmp) {
          if (f !== ruleFrom[i]) {
            continue l;
          }
        } else {
          if (1 === tmp) {
            if (!compare(ruleFrom[i], f, ruleLengthFromMin[i], fl - 1)) {
              continue l;
            }
          } else {
            if (!getRegexp(ruleFrom[i]).test(f)) {
              continue l;
            }
          }
        }

        if (!tmp2) {
          if (t !== ruleTo[i]) {
            continue l;
          }
        } else {
          if (1 === tmp2) {
            if (!compare(ruleTo[i], t, ruleLengthToMin[i], tl - 1)) {
              continue l;
            }
          } else {
            if (!getRegexp(ruleTo[i]).test(t)) {
              continue l;
            }
          }
        }
      }

      msg[h++] = actions[i];
    }
  }

  return messages;
}

module.exports = filter;
