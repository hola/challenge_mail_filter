"use strict";

var filter = function (mails, rules) {
 var rf, rt, rfn, rtn, ref, lf, lt, ret, sr, s, from, to;
 var rec = /[.*?\^$+(|{[]/g;
 var repl = function (m, o) {
  switch (m) {
    case '*': ret = sr = 1; return '.*'; break; 
    case '?': ret = 1; return '.'; break;
    default: return '\\'+m;
  }
 };

 for (var i = 0; i < rules.length; i++) {
  rf = rules[i]['from']; rt = rules[i]['to'];
  lf = rf?rf.length:0; lt = rt?rt.length:0;
  ret = sr = 0; 
  if (lf===1 && rf==='*') 
   rf = 0 
  else if (rf) 
   rfn = rf.replace(rec, repl);
  ref = ret; 
  if (ret) {
    ret = 0; rf = rfn;
   if (sr) lf = sr = 0;
  }
  if (lt===1 && rt==='*')
   rt = 0
  else if (rt)
   rtn = rt.replace(rec, repl);
  if (ret) {
    rt = rtn;
    if (sr) lt = 0;
  }
  rules[i] = [ref?new RegExp('^'+rf+'$'):rf, ret?new RegExp('^'+rt+'$'):rt, rules[i]['action'], ref, ret, lf, lt];
 }

 for (var l in mails) { 
  from = mails[l]['from']; to = mails[l]['to']; mails[l] = []; 
  for (var i = 0; i < rules.length; i++)  
   if ((!rules[i][0] || (rules[i][3]?((rules[i][5] && rules[i][5]!==from.length)?false:rules[i][0].test(from)):rules[i][0]===from)) 
    && (!rules[i][1] || (rules[i][4]?((rules[i][6] && rules[i][6]!==to.length)?false:rules[i][1].test(to)):rules[i][1]===to))) 
    mails[l].push(rules[i][2]); 
 }
 return mails;
}

exports.filter = filter;
