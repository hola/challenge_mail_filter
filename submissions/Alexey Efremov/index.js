"use strict";

/*
  @author Efremov Alexey (lexich121@gmail.com)
  @date 20.12.2015
 */

/* eslint block-scoped-var:0 */
function tokenize(pattern, index, ast) {
  var offset = Math.floor(index / 31);
  var action = 1 << (index % 31);
  var ch, prevCh, i;
  var len = pattern ? pattern.length : 0;
  var cur = ast || (ast = {});
  if (!cur.mask || offset + 1 > cur.mask) {
    cur.mask = offset + 1;
  }
  cur.deep || (cur.deep = 0);
  cur.len || (cur.len = 0);
  cur.act || (cur.act = []);
  if (cur.act[offset]) {
    cur.act[offset] |= action;
  } else {
    cur.act[offset] = action;
  }
  var result = cur;
  var onlyStar = true;
  for (i = 0; i < len; i++) {
    if (pattern[i] !== "*") {
      onlyStar = false;
      break;
    }
  }

  if (onlyStar) {
    cur.alw || (cur.alw = []);
    if (cur.alw[offset]) {
      cur.alw[offset] |= action;
    } else {
      cur.alw[offset] = action;
    }
    return result;
  }
  var deep;
  for (i = 0; i < len; i++) {
    ch = pattern[i];
    if (ch === "*" && deep === (void 0)) {
      deep = i;
    }
    if (ch === "*" && prevCh === ch) {
      continue;
    }
    if (cur[ch]) {
      cur = cur[ch];
    } else {
      cur.len++;
      cur = cur[ch] = {len: 0};
    }
    prevCh = ch;
  }
  !deep || (deep = i - 1);
  (deep < 0) && (deep = 0);
  (deep > ast.deep) && (ast.deep = deep);
  cur.act || (cur.act = []);
  if (cur.act[offset]) {
    cur.act[offset] |= action;
  } else {
    cur.act[offset] = action;
  }
  return result;
}

function arrayOr(name, arr) {
  var i, tmp;
  var iLen = arr.length;
  var f = [];
  for (i = 0; i < iLen; i++) {
    tmp = arr[i];
    if (tmp) {
      f[f.length] = `${name}_${i}|=${tmp};`;
    }
  }
  return f.join("");
}

function walk(name, f, ast, offset, deep, predefDeep, isStar, andIfIndex) {
  var counter = 0, indexToken, tmp, openBrace = 0;
  var msgName = "m" + name,
    resName = "r" + name,
    lenName = "l" + name;

  for (var key in ast) {
    if (key === "*" || key === "act") {
      continue;
    } else if (key === "?") {
      walk(name, f, ast[key], offset + 1, deep, predefDeep, isStar, (void 0));
    } else if (key.length === 1) {
      if (isStar) {
        indexToken = offset !== 0 ?
          `${offset}+i${deep - 1}` :
          `i${deep - 1}`;
      } else {
        if (deep < 1) {
          indexToken = "" + offset;
        } else {
          indexToken = `i${deep - 1}+${offset}`;
        }
      }
      if (isStar) {
        tmp = deep < 2 ? offset : "i" + (deep - 2) + "+" + offset;
        f[f.length] = `if((i${deep - 1}=${msgName}.indexOf('${key}',${tmp}))>-1){`;
        openBrace++;
        if (offset) {
          f[f.length] = `i${deep - 1}-=${offset};`;
        }
        walk(name, f, ast, offset, deep, predefDeep, false, andIfIndex);
      } else {
        if (counter) {
          f[f.length] = "else ";
        }
        if (deep > 0 || offset >= predefDeep) {
          tmp = `${msgName}[${indexToken}]==='${key}'`;
        } else {
          tmp = `${msgName}_${offset}==='${key}'`;
        }

        if (andIfIndex) {
          f[andIfIndex] += "&&" + tmp;
        } else {
          f[f.length] = "if(";
          f[f.length] = tmp;
        }
        tmp = ast[key];
        var isPlain = tmp.len === 1 && !tmp["?"] && !tmp["*"];
        if (!isPlain) {
          f[f.length] = "){";
          openBrace++;
        }
        walk(name, f, tmp, offset + 1, deep, predefDeep, false,
          isPlain ? (andIfIndex || f.length - 1) : (void 0)
        );
      }
      while (openBrace) {
        f[f.length] = "}";
        openBrace--;
      }
      counter++;
    }
  }
  if (ast.act && offset > 0) {
    var variable = deep > 0 ? `i${deep - 1}+${offset}` : offset;
    if (isStar) {
      f[f.length] = `if(${lenName}>=${variable}){${arrayOr(resName, ast.act)}}`;
    } else {
      f[f.length] =
        `if(${lenName}===${variable}){${arrayOr(resName, ast.act)}}`;
    }
  }
  if (ast["*"]) {
    f[f.length] = `var i${deep} = 0;`;
    walk(name, f, ast["*"], offset, deep + 1, predefDeep, true);
  }
  return f;
}

function compile(name, ast, isStr, f) {
  f || (f = []);
  var msgName = "m" + name,
    resName = "r" + name,
    lenName = "l" + name;
  var i, iLen;

  // null message check
  if (ast.act) {
    var act = ast.act;
    f[f.length] = `if(${msgName}===(void 0)){`;
    for (i = 0, iLen = act.length; i < iLen; i++) {
      f[f.length] = `${resName}_${i}=${ (act && act[i]) || 0};`;
    }
    f[f.length] = `} else { var ${lenName}=${msgName}.length;`;
  }
  var predefDeep = ast.deep;

  // Magic constant, empirically calculate for best perfomance
  var limit = 4;
  if (predefDeep > limit) { predefDeep = limit; }

  for (i = 0; i < predefDeep; i++) {
    f[f.length] = `var ${msgName}_${i}=${ !i ? "" : msgName + "_" + (i - 1) + "&&" }${msgName}[${i}];`;
  }
  const alw = ast.alw;
  for (i = 0, iLen = ast.mask; i < iLen; i++) {
    f[f.length] = `${resName}_${i}=${ (alw && alw[i]) || 0};`;
  }
  f = walk(name, f, ast, 0, 0, predefDeep);
  if (ast.act) {
    f[f.length] = "}";
  }

  if (!isStr) {
    f[f.length] = `var ${resName}=[`;
    for (i = 0, iLen = ast.mask; i < iLen; i++) {
      f[f.length] = `${i > 0 ? "," : ""}${resName}_${i}`;
    }
    f[f.length] = "];";
    f[f.length] = `return ${resName};`;
  }

  if (isStr === 2) { return f; }
  /* eslint no-new-func:0 */
  return isStr ? f.join("") : new Function(msgName, f.join(""));
}

function compileFilter(rules, actions) {
  var rule, fromAST = {}, toAST = {}, i, iLen;

  for (i = 0, iLen = rules.length; i < iLen; i++) {
    rule = rules[i];
    actions[i] = rule.action;
    fromAST = tokenize(rule.from, i, fromAST);
    toAST = tokenize(rule.to, i, toAST);
  }

  var f = [];
  f[f.length] = "var keys=Object.keys(messages),name,data,iterator,i,iLen,tmp,m1,m2;";
  var maxLen = fromAST.mask > toAST.mask ? fromAST.mask : toAST.mask;
  for (i = 0; i < maxLen; i++) {
    f[f.length] = `${i ? "," : "var "}r1_${i}`;
  }
  f[f.length] = ";";
  for (i = 0; i < maxLen; i++) {
    f[f.length] = `${i ? "," : "var "}r2_${i}`;
  }
  f[f.length] = ";";
  f[f.length] = "for (var k=0,kLen=keys.length;k<kLen;k++){";
  f[f.length] = "name=keys[k];msg=messages[name];data=[];m1=msg.from;m2=msg.to;";
  compile("1", fromAST, 2, f);
  compile("2", toAST, 2, f);

  for (i = 0; i < maxLen; i++) {
    f[f.length] = `tmp=r1_${i}&r2_${i};`;
    f[f.length] = `iterator=${i * 31};`;
    f[f.length] = "while(tmp){";
    f[f.length] = "(tmp & 1)&&(data[data.length]=actions[iterator]);iterator++;tmp>>=1;";
    f[f.length] = "}";
  }
  f[f.length] = "messages[name]=data;}";

  return f.join("");
}

function filter(messages, rules) {
  var actions = new Array(rules.length);
  var func = new Function(
    "messages", "actions",
    compileFilter(rules, actions)
  );
  func(messages, actions);
  return messages;
}

filter.filter = filter;
filter.tokenize = tokenize;
filter.compile = compile;
filter.compileFilter = compileFilter;
filter.arrayOr = arrayOr;
module.exports = filter;
