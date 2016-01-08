function filter(messages, rules) {
  var mlength = Object.keys(messages).length;
  var rlength = rules.length;
  var complexity = mlength * rlength * 1.3;
  if (complexity < 10000) return speedRun(messages, rules, rlength);
  return asmRun(messages, rules, rlength, mlength);
}


function speedRun(messages, rules, rlength) {
  'almost asm';

  var starMark = '*'.charCodeAt(0);
  var questionMark = '?'.charCodeAt(0);
  var starStack = new Uint16Array(50);
  var q_starStack = new Uint16Array(50);

  for (var i in messages) {
    var matches = [];
    var message = messages[i];
    for (var j = 0; j < rlength; j++) {
      var rule = rules[j];
      var action = rule.action;
      var ruleMatches = 1;
      for (var ruleField in rule) {
        if (ruleField !== 'from' && ruleField !== 'to') continue;

        var text = message[ruleField];
        var query = rule[ruleField];
        //insert matching function below


        var tlen = text.length | 0;
        var qlen = query.length | 0;
        var mode = 0 | 0;
        var starStackCount = 0 | 0; //starStack = qb - qbeginning (const), tb - tbeginning (changing)
        var result = 0 | 0;
        var newT = 0 | 0;

        outer: for (var q = 0, t = 0; ; q++) {
          if (q >= qlen) {
            if (!mode && t === tlen) {
              result = 1;
              break;
            }
            if (mode === 1) {
              break;
            }
            if (mode === 2 && t === tlen) {
              result = 1;
              break;
            }
            else {  //broken sequence; retry
              while (true) {
                if (!starStackCount) {
                  break outer;
                }
                newT = starStack[starStackCount] + 1;
                if (newT >= tlen) {  //current star search reached the end; descend to a lower stack level
                  starStackCount--;
                  continue;
                }
                starStack[starStackCount] = newT;
                t = newT;
                q = q_starStack[starStackCount] - 1;
                mode = 1;
                continue outer;
              }
            }
          }

          var qch = query.charCodeAt(q);
          if (qch === starMark) {
            if (mode === 1) {
              break;
            }
            if (qlen - q - 1 && query.charCodeAt(q + 1) === starMark) continue; //if there are two stars in a row
            if (q === qlen - 1) {
              result = 1;
              break;
            }
            mode = 1;
            starStack[++starStackCount] = t | 0;
            q_starStack[starStackCount] = (q + 1) | 0;
            continue;
          }

          while (true) {
            var tch = text.charCodeAt(t++);
            if (t > tlen) tch = 0;
            if (qch === tch) break;
            if (qch === questionMark) {
              if (t > tlen) {
                break outer;
              }
              break;
            }
            if (!mode) {
              break outer;
            }
            if (mode === 1) {
              if (t >= tlen) {
                break outer;
              }
              continue; //instead of switch
            }
            if (mode === 2) { //broken sequence; retry
              while (true) {
                if (!starStackCount) {
                  break outer;
                }
                newT = starStack[starStackCount] + 1;
                if (newT >= tlen) {  //current star search reached the end; descend to a lower stack level
                  starStackCount--;
                  continue;
                }
                starStack[starStackCount] = newT;
                t = newT;
                q = q_starStack[starStackCount] - 1;
                mode = 1;
                continue outer;
              }
            }
          }

          if (mode === 1) mode = 2;
        }


        //insert matching function above
        if (!result) {
          ruleMatches = false;
          break;
        }
      }
      if (ruleMatches && action) {
        matches.push(action);
      }
    }
    messages[i] = matches;
  }

  return messages;
}




function pureAsm(HEAP8, messageHeap, HEAP32, ptextLength, pqueryLength) {
  'use asm';
  //compiled code with strange indents - leave them as is
  //$0 - query index
  //$1 - text index
  var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
  var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
  var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
  var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
  var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
  var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
  var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0;
  var $mode = 0, $newT = 0, $q = 0, $q_starStack = 0, $qch = 0, $qlen = 0, $questionMark = 0, $result = 0, $starMark = 0, $starStack = 0, $starStackCount = 0, $t = 0, $tch = 0, $tlen = 0, label = 0, sp = 0;
  $starStack = sp + 232|0;
  $q_starStack = sp + 32|0;
  $starMark = 42;
  $questionMark = 63;
  $tlen = ptextLength|0;
  $qlen = pqueryLength|0;
  $mode = 0;
  $starStackCount = 0;
  $newT = 0;
  $q = -1;
  $t = 0;
  L8: while(1) {
    $18 = $q;
    $19 = (($18) + 1)|0;
    $q = $19;
    $20 = $q;
    $21 = $qlen;
    $22 = ($20|0)>=($21|0);
    if ($22) {
      $23 = $mode;
      $24 = ($23|0)!=(0);
      if (!($24)) {
        $25 = $t;
        $26 = $tlen;
        $27 = ($25|0)==($26|0);
        if ($27) {
          label = 10;
          break;
        }
      }
      $28 = $mode;
      $29 = ($28|0)==(1);
      if ($29) {
        label = 39;
        break;
      }
      $30 = $mode;
      $31 = ($30|0)==(2);
      if ($31) {
        $32 = $t;
        $33 = $tlen;
        $34 = ($32|0)==($33|0);
        if ($34) {
          label = 14;
          break;
        }
      }
      while(1) {
        $35 = $starStackCount;
        $36 = ($35|0)!=(0);
        if (!($36)) {
          label = 39;
          break L8;
        }
        $37 = $starStackCount;
        $38 = (($starStack) + ($37<<2)|0);
        $39 = HEAP32[$38>>2]|0;
        $40 = (($39) + 1)|0;
        $newT = $40;
        $41 = $newT;
        $42 = $tlen;
        $43 = ($41|0)>=($42|0);
        if (!($43)) {
          break;
        }
        $44 = $starStackCount;
        $45 = (($44) + -1)|0;
        $starStackCount = $45;
      }
      $46 = $newT;
      $47 = $starStackCount;
      $48 = (($starStack) + ($47<<2)|0);
      HEAP32[$48>>2] = $46;
      $49 = $newT;
      $t = $49;
      $50 = $starStackCount;
      $51 = (($q_starStack) + ($50<<2)|0);
      $52 = HEAP32[$51>>2]|0;
      $53 = (($52) - 1)|0;
      $q = $53;
      $mode = 1;
      continue;
    }
    $54 = $q;
    $55 = $0;
    $56 = (($55) + ($54)|0);
    $57 = HEAP8[$56>>0]|0;
    $qch = $57;
    $58 = $qch;
    $59 = $58 << 24 >> 24;
    $60 = $starMark;
    $61 = $60 << 24 >> 24;
    $62 = ($59|0)==($61|0);
    if ($62) {
      $63 = $mode;
      $64 = ($63|0)==(1);
      if ($64) {
        label = 39;
        break;
      }
      $65 = $qlen;
      $66 = $q;
      $67 = (($65) - ($66))|0;
      $68 = (($67) - 1)|0;
      $69 = ($68|0)!=(0);
      if ($69) {
        $70 = $q;
        $71 = (($70) + 1)|0;
        $72 = $0;
        $73 = (($72) + ($71)|0);
        $74 = HEAP8[$73>>0]|0;
        $75 = $74 << 24 >> 24;
        $76 = $starMark;
        $77 = $76 << 24 >> 24;
        $78 = ($75|0)==($77|0);
        if ($78) {
          continue;
        }
      }
      $79 = $q;
      $80 = $qlen;
      $81 = (($80) - 1)|0;
      $82 = ($79|0)==($81|0);
      if ($82) {
        label = 24;
        break;
      }
      $mode = 1;
      $83 = $t;
      $84 = $starStackCount;
      $85 = (($84) + 1)|0;
      $starStackCount = $85;
      $86 = (($starStack) + ($85<<2)|0);
      HEAP32[$86>>2] = $83;
      $87 = $q;
      $88 = (($87) + 1)|0;
      $89 = $starStackCount;
      $90 = (($q_starStack) + ($89<<2)|0);
      HEAP32[$90>>2] = $88;
      continue;
    }
    while(1) {
      $91 = $t;
      $92 = (($91) + 1)|0;
      $t = $92;
      $93 = $1;
      $94 = (($93) + ($91)|0);
      $95 = messageHeap[$94>>0]|0;
      $tch = $95;
      if ($t > $tlen) $tch = 0;
      $96 = $qch;
      $97 = $96 << 24 >> 24;
      $98 = $tch;
      $99 = $98 << 24 >> 24;
      $100 = ($97|0)==($99|0);
      if ($100) {
        break;
      }
      $101 = $qch;
      $102 = $101 << 24 >> 24;
      $103 = $questionMark;
      $104 = $103 << 24 >> 24;
      $105 = ($102|0)==($104|0);
      if ($105) {
        label = 28;
        break;
      }
      $109 = $mode;
      $110 = ($109|0)!=(0);
      if (!($110)) {
        label = 39;
        break L8;
      }
      $111 = $mode;
      $112 = ($111|0)==(1);
      if ($112) {
        $113 = $t;
        $114 = $tlen;
        $115 = ($113|0)>=($114|0);
        if ($115) {
          label = 39;
          break L8;
        } else {
          continue;
        }
      } else {
        $116 = $mode;
        $117 = ($116|0)==(2);
        if ($117) {
          label = 33;
          break;
        } else {
          continue;
        }
      }
    }
    if ((label|0) == 28) {
      label = 0;
      $106 = $t;
      $107 = $tlen;
      $108 = ($106|0)>($107|0);
      if ($108) {
        label = 39;
        break;
      }
    }
    else if ((label|0) == 33) {
      while(1) {
        label = 0;
        $118 = $starStackCount;
        $119 = ($118|0)!=(0);
        if (!($119)) {
          label = 39;
          break L8;
        }
        $120 = $starStackCount;
        $121 = (($starStack) + ($120<<2)|0);
        $122 = HEAP32[$121>>2]|0;
        $123 = (($122) + 1)|0;
        $newT = $123;
        $124 = $newT;
        $125 = $tlen;
        $126 = ($124|0)>=($125|0);
        if (!($126)) {
          break;
        }
        $127 = $starStackCount;
        $128 = (($127) + -1)|0;
        $starStackCount = $128;
        label = 33;
      }
      $129 = $newT;
      $130 = $starStackCount;
      $131 = (($starStack) + ($130<<2)|0);
      HEAP32[$131>>2] = $129;
      $132 = $newT;
      $t = $132;
      $133 = $starStackCount;
      $134 = (($q_starStack) + ($133<<2)|0);
      $135 = HEAP32[$134>>2]|0;
      $136 = (($135) - 1)|0;
      $q = $136;
      $mode = 1;
      continue;
    }
    $137 = $mode;
    $138 = ($137|0)==(1);
    if (!($138)) {
      continue;
    }
    $mode = 2;
  }
  return ((label|0) == 10) || ((label|0) == 14) || ((label|0) == 24);
}


function preProcessStarredRules(rules, index, ruleType, skipRules, allStarsFlag, noStarsFlag) {
  var rule = rules[index][ruleType];
  var starMark = 42;

  if (rule) {
    var allStars = true;
    var anyStar = false;
    var length = rule.length;
    for (var k = 0; k < length; k++) {
      if (rule.charCodeAt(k) === starMark) {
        anyStar = true;
        if (!allStars) break;
      }
      else {
        allStars = false;
        if (anyStar) break;
      }
    }
    if (allStars) skipRules[index] = skipRules[index] | allStarsFlag;
    if (!anyStar) skipRules[index] = skipRules[index] | noStarsFlag;
  }
}


function asmRun(messages, rules, rlength) {
  'use strict';
  var HEAP32 = new Int32Array(110);
  var messageToHeap = new Int8Array(200);
  var messageFromHeap = new Int8Array(200);
  var pquery, pqueryLength, x, y;
  const toAllStarsFlag = 0x1,
      fromAllStarsFlag = 0x2,
      toNoStarsFlag = 0x4,
      fromNoStarsFlag = 0x8;

  var skipRules = new Int32Array(rules.length);

  for (var k = 0; k < rlength; k++) {
    preProcessStarredRules(rules, k, 'to', skipRules, toAllStarsFlag, toNoStarsFlag);
    preProcessStarredRules(rules, k, 'from', skipRules, fromAllStarsFlag, fromNoStarsFlag);
  }


  for (var i in messages) {
    var matches = [];
    const message = messages[i];
    const messageTo = message.to;
    const messageFrom = message.from;
    const messageToLength = messageTo.length;
    const messageFromLength = messageFrom.length;
    for (y = 0; y < messageToLength; y++) messageToHeap[y] = messageTo.charCodeAt(y);
    for (y = 0; y < messageFromLength; y++) messageFromHeap[y] = messageFrom.charCodeAt(y);

    for (var j = 0; j < rlength; j++) {
      var rule = rules[j];
      const skipRule = skipRules[j];

      if (rule.to && !(skipRule & toAllStarsFlag)) {
        pquery = rule.to;
        pqueryLength = pquery.length|0;
        if ((skipRule & toNoStarsFlag) && pqueryLength !== messageToLength) continue;
        if (!rule.toNumeric) {
          rule.toNumeric = new Int8Array(pqueryLength);
          for (x = 0; x < pqueryLength; x++) rule.toNumeric[x] = pquery.charCodeAt(x);
        }
        if (!pureAsm(rule.toNumeric, messageToHeap, HEAP32, messageToLength, pqueryLength)) continue;
      }

      if (rule.from && !(skipRule & fromAllStarsFlag)) {
        pquery = rule.from;
        pqueryLength = pquery.length|0;
        if ((skipRule & fromNoStarsFlag) && pqueryLength !== messageFromLength) continue;
        if (!rule.fromNumeric) {
          rule.fromNumeric = new Int8Array(pqueryLength);
          for (x = 0; x < pqueryLength; x++) rule.fromNumeric[x] = pquery.charCodeAt(x);
        }
        if (!pureAsm(rule.fromNumeric, messageFromHeap, HEAP32, messageFromLength, pqueryLength)) continue;
      }

      matches.push(rule.action);
    }
    messages[i] = matches;
  }

  return messages;
}


module.exports = {filter: filter};
