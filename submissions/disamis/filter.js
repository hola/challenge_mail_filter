
function filter(messages, rules) {
   var actions = {}, uncondActions = [];
   var reFrom = [], reTo = [], reFromTo = [], reToFrom = [];
   var re2From = [], re2To = [], re2FromTo = [], re2ToFrom = [];
   var from0, to0, lenFrom, lenTo, ruleFrom, ruleTo;
   var wwFrom, wwTo;
   var memo = {}, key, msg;

   for (var i=0, len=rules.length; i<len; i++) {   

      ruleFrom = rules[i].from;
      ruleTo =  rules[i].to;
      
      if (ruleFrom && ruleTo) {
         lenFrom = minLen(ruleFrom);
         lenTo = minLen(ruleTo);
         from0 = ruleFrom[0];
         to0 = ruleTo[0];
         wwFrom = wildOrEmptyFirstTwo(ruleFrom);
         wwTo = wildOrEmptyFirstTwo(ruleTo);
         if (wwFrom && wwTo) {
            if ((from0 == "*" || from0 == "?") && to0 == "*") {
               put12(reFromTo, ruleFrom, ruleTo, lenFrom, lenTo, i);
            } else if (from0 == "*" && to0 == "?") {
               put12(reToFrom, ruleTo, ruleFrom, lenTo, lenFrom, i);
            } else if (from0 != "*" && from0 != "?") {
               put12(reFromTo, ruleFrom, ruleTo, lenFrom, lenTo, i);
            } else { 
               put12(reToFrom, ruleTo, ruleFrom, lenTo, lenFrom, i);
            }
         } else if (!wwFrom) {
            put22(re2FromTo, ruleFrom, ruleTo, lenFrom, lenTo, i);
         } else {
            put22(re2ToFrom, ruleTo, ruleFrom, lenTo, lenFrom, i);
         }
      } else if (ruleFrom) {
         lenFrom = minLen(ruleFrom);
         if (wildOrEmptyFirstTwo(ruleFrom)) {
            put11(reFrom, ruleFrom, lenFrom, i);
         } else {
            put21(re2From, ruleFrom, lenFrom, i);
         }
      } else if (ruleTo) {
         lenTo = minLen(ruleTo);
         if (wildOrEmptyFirstTwo(ruleTo)) {
            put11(reTo, ruleTo, lenTo, i);
         }
         else {
            put21(re2To, ruleTo, lenTo, i);
         }
      } else {
         uncondActions.push(i);
      }
   }

   for (var m in messages) {
      msg = messages[m];   
      key = msg.from.concat("\t", msg.to);
      if (memo[key]) {
         actions[m] = memo[key];
      } else {
         actions[m] = actionsForMsg(msg, rules, reFrom, reTo, reFromTo, reToFrom, re2From, re2To, re2FromTo, re2ToFrom, uncondActions);
         memo[key] = actions[m];
      }
   }

   return actions;
}

function minLen(rule) {
   return rule.replace(/\*/g, "").length;
}

function wildOrEmptyFirstTwo(str) {
   var re = /[?*]/;
   return re.test(str[0]) || re.test(str[1]);
}

function put12(re, ruleLeft, ruleRight, lenLeft, lenRight, i) {
   var n = ruleLeft.charCodeAt(0)-32;
   if (!re[n]) {re[n] = []};
   re[n].push([wildcardToRe(ruleLeft), wildcardToRe(ruleRight), i, lenLeft, lenRight]);
}   

function put11(re, rule, len, i) {
   var n = rule.charCodeAt(0)-32;
   if (!re[n]) {re[n] = []};
   re[n].push([wildcardToRe(rule), i, len]);
}     

function put22(re2, ruleLeft, ruleRight, lenLeft, lenRight, i) {
   var n0 = ruleLeft.charCodeAt(0)-32;
   var n1 = ruleLeft.charCodeAt(1)-32;
   if (!re2[n0]) {
      re2[n0] = []; 
   }
   if (!re2[n0][n1]) {
      re2[n0][n1] = [];
   }
   re2[n0][n1].push([wildcardToRe(ruleLeft), wildcardToRe(ruleRight), i, lenLeft, lenRight]);
}   

function put21(re2, rule, len, i) {
   var n0 = rule.charCodeAt(0)-32;
   var n1 = rule.charCodeAt(1)-32;
   if (!re2[n0]) {
      re2[n0] = []; 
   }
   if (!re2[n0][n1]) {
      re2[n0][n1] = [];
   }
   re2[n0][n1].push([wildcardToRe(rule), i, len]);
}   

function wildcardToRe(rule) {
   if (!rule || rule == "*") return null;
   var r = [];
   var specials = {'\\':'\\\\', '^':'\\^', '$':'\\$', '+':'\\+', '|':'\\|', '{':'\\{', '}':'\\}', '(':'\\(', ')':'\\)', '[':'\\[', ']':'\\]', '.':'\\.', '*':'.*' , '?':'.' } ;
   for (var i=0, len=rule.length; i<len; i++) {
      r[i] = specials[rule[i]] || rule[i];
   }
   return new RegExp("^" + r.join('') + "$");
}

function actionsForMsg(message, rules, reFrom, reTo, reFromTo, reToFrom, re2From, re2To, re2FromTo, re2ToFrom, uncondActions) {
   var index = uncondActions.slice(), actions = [];
   
   resolve12(message.from, message.to, reFromTo, index);
   resolve12(message.to, message.from, reToFrom, index);
   resolve11(message.from, reFrom, index);
   resolve11(message.to, reTo, index);

   resolve22(message.from, message.to, re2FromTo, index);
   resolve22(message.to, message.from, re2ToFrom, index);
   resolve21(message.from, re2From, index);
   resolve21(message.to, re2To, index);
   
   insertionSort(index);
   index.forEach(function(i) {actions.push(rules[i].action)});
   
   return actions;
}

function resolve12(mLeft, mRight, re, actions) {
   // '?'
   if (re[63-32]) { compare12(mLeft, mRight, re[63-32], actions) };
   // '*'
   if (re[42-32]) { compare12(mLeft, mRight, re[42-32], actions) };
   // other
   if (re[mLeft.charCodeAt(0)-32]) { compare12(mLeft, mRight, re[mLeft.charCodeAt(0)-32], actions) };
}

function compare12(mLeft, mRight, re, actions) {
   var r, reLeft, reRight, action, lenLeft, lenRight;
   for (var i=0, size=re.length; i<size; i++) {
      r = re[i];
      reLeft = r[0]; reRight = r[1]; action = r[2]; lenLeft = r[3]; lenRight = r[4];
      if (mLeft.length >= lenLeft && mRight.length >= lenRight && cmp(mLeft, reLeft) && cmp(mRight, reRight)) {
         actions.push(action);
      }
   }
}  

function resolve11(m, re, actions) {
   var x = m.charCodeAt(0)-32;
   // '?'
   if (re[63-32]) { compare11(m, re[63-32], actions)  };
   // '*'
   if (re[42-32]) { compare11(m, re[42-32], actions)  };
   // other
   if (re[x]) { compare11(m, re[x], actions) };
}

function compare11(m, re, actions) {
   var r, rule, action, len;
   for (var i=0, size=re.length; i<size; i++) {
      r = re[i];
      rule = r[0]; action = r[1]; len = r[2];
      if (m.length >= len && cmp(m, rule)) {
         actions.push(action);
      }
   }
}

function resolve22(mLeft, mRight, re, actions) {
   var n0 = mLeft.charCodeAt(0)-32, n1 = mLeft.charCodeAt(1)-32;
   if (re[n0] && re[n0][n1]) { compare12(mLeft, mRight, re[n0][n1], actions) };
}

function resolve21(m, re, actions) {
   var n0 = m.charCodeAt(0)-32, n1 = m.charCodeAt(1)-32;
   if (re[n0] && re[n0][n1]) { compare11(m, re[n0][n1], actions) };
}

function cmp(str, rule) {
   return (!rule || rule.test(str));
}

function insertionSort(unsortedList) {
   var len = unsortedList.length;
   for(var i = 0; i < len; i++) {
      var tmp = unsortedList[i];
      for(var j = i - 1; j >= 0 && (unsortedList[j] > tmp); j--) {
         unsortedList[j+1] = unsortedList[j];
      }
      unsortedList[j+1] = tmp;
   }
}

module.exports = filter;
