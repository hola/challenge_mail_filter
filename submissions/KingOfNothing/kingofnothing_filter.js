/**
* Copyright 2015, KingOfNothing, All rights reserved.
*/

'use strict';

var cache = new Map();

// var RULE_LITERAL = 0;
// var RULE_MIXED = 1;
// var RULE_STAR_ONLY = 2;
// var RULE_QMARK_ONLY = 3;
// var RULE_ONE_STAR_END = 4;
// var RULE_ONE_STAR_START = 5;
// var RULE_STAR_ON_ENDS = 6;
// var RULE_STAR_MIDDLE = 7;
// var RULE_ALWAYS_TRUE = 8;

function getRuleType(rule) {
  if (rule === '*') {
    return 8;
  }
  var ruleLen = rule.length; // rule && rule length
  var last = ruleLen - 1;
  var ns = 0; // number of stars
  var nq = 0; // number of qmarks
  for (var i = 0; i < ruleLen; i++) {
    var char = rule[i];
    if (char === '*') {
      ns++;
    } else if (char === '?') {
      nq++;
    }
  }
  if (ns > 0 && nq > 0) {
    return 1;
  }
  if (nq === 0 && ns === 0) {
    return 0;
  }
  if (ns === 1) {
    if (rule[0] === '*') {
      return 5;
    }
    if (rule[last] === '*') {
      return 4;
    }
    return 7;
  } else if (ns === 2) {
    if (rule[0] === '*' && rule[last] === '*') {
      return 6;
    }
  } else if (ns > 0) {
    return 2;
  }
  if (nq > 0) {
    return 3;
  }
  return 1;
}

function startsWith(str, rule) {
  var l = rule.length - 1;
  while (l--) {
    if (str[l] !== rule[l]) {
      return false;
    }
  }
  return true;
}

function qmarkTest(str, rule) {
  var len = rule.length;
  if (len !== str.length) {
    return false;
  }

  while (len--) {
    if (str[len] !== rule[len] && rule[len] !== '?') {
      return false;
    }
  }

  return true;
}

function endsWithTest(str, rule) {
  var l = rule.length;
  if (l > str.length) {
    return false;
  } else if (l === str.length) {
    return str === rule;
  }
  return str.slice(-l) === rule;
}

function startsWithTest(str, rule) {
  var l = rule.length;
  if (l > str.length) {
    return false;
  } else if (l === str.length) {
    return str === rule;
  }
  while (l--) {
    if (str[l] !== rule[l]) {
      return false;
    }
  }
  return true;
}

var REPLACE_SPECIAL_CHARS = /[.+^${}()|[\]\\]/g;
var REPLACE_STAR_WITH_CHAR_RANGE = /\*/g;
var REPLACE_Q_MARK = /\?/g;
var REPLACE_STAR_REGEXP = /\*\*+/g;

function compile(tester) {
  var rule = tester.fromRule;
  var type = getRuleType(rule);
  var ruleLen = rule.length;
  var index = 0;
  tester.fromType = type;

  if (type === 1) {
    if (!cache.has(rule)) {
      tester.fromRegExp = new RegExp('^' + rule
        .replace(REPLACE_SPECIAL_CHARS, '\\$&')
        .replace(REPLACE_STAR_WITH_CHAR_RANGE, '[\\x20-\\x7F]*') // *(*..) -> [range]*
        .replace(REPLACE_Q_MARK, '[\\x20-\\x7F]') + '$');
      cache.set(rule, tester.fromRegExp);
    } else {
      tester.fromRegExp = cache.get(rule);
    }
  } else if (type === 2) {
    if (!cache.has(rule)) {
      tester.fromRegExp = new RegExp('^' + rule
        .replace(REPLACE_SPECIAL_CHARS, '\\$&')
        .replace(REPLACE_STAR_WITH_CHAR_RANGE, '[\\x20-\\x7F]*') + '$'); // *(*..) -> [range]*
      cache.set(rule, tester.fromRegExp);
    } else {
      tester.fromRegExp = cache.get(rule);
    }
  } else if (type === 4) {
    tester.fromRule = rule.substring(0, ruleLen - 1);
  } else if (type === 5) {
    tester.fromRule = rule.substring(1);
  } else if (type === 6) {
    tester.fromRule = rule.substring(1, ruleLen - 1);
  } else if (type === 7) {
    index = rule.indexOf('*');
    tester.fromLeft = rule.substring(0, index);
    tester.fromRight = rule.substring(index + 1);
  }

  rule = tester.toRule;
  type = getRuleType(rule);
  ruleLen = rule.length;
  tester.toType = type;
  if (type === 1) {
    if (!cache.has(rule)) {
      tester.toRegExp = new RegExp('^' + rule
        .replace(REPLACE_SPECIAL_CHARS, '\\$&')
        .replace(REPLACE_STAR_WITH_CHAR_RANGE, '[\\x20-\\x7F]*') // *(*..) -> [range]*
        .replace(REPLACE_Q_MARK, '[\\x20-\\x7F]') + '$');
      cache.set(rule, tester.toRegExp);
    } else {
      tester.toRegExp = cache.get(rule);
    }
  } else if (type === 2) {
    if (!cache.has(rule)) {
      tester.toRegExp = new RegExp('^' + rule
        .replace(REPLACE_SPECIAL_CHARS, '\\$&')
        .replace(REPLACE_STAR_WITH_CHAR_RANGE, '[\\x20-\\x7F]*') + '$'); // *(*..) -> [range]*
      cache.set(rule, tester.toRegExp);
    } else {
      tester.toRegExp = cache.get(rule);
    }
  } else if (type === 4) {
    tester.toRule = rule.substring(0, ruleLen - 1);
  } else if (type === 5) {
    tester.toRule = rule.substring(1);
  } else if (type === 6) {
    tester.toRule = rule.substring(1, ruleLen - 1);
  } else if (type === 7) {
    index = rule.indexOf('*');
    tester.toLeft = rule.substring(0, index);
    tester.toRight = rule.substring(index + 1);
  }
}

function filter(messages, rules) {
  var result = {};
  var messageIds = Object.keys(messages);
  var messagesLength = messageIds.length;
  var ruleLen = rules.length;
  var newRules = new Array(ruleLen);

  for (var k = 0; k < ruleLen; k++) {
    var rule = rules[k];
    var toRule = rule.to === undefined ? '*' : rule.to.replace(REPLACE_STAR_REGEXP, '*');
    var fromRule = rule.from === undefined ? '*' : rule.from.replace(REPLACE_STAR_REGEXP, '*');
    var newRule = {
      action: rule.action,
      toRule: toRule,
      toRegExp: null,
      toLeft: '',
      toRight: '',
      toType: 0,
      fromRule: fromRule,
      fromRegExp: null,
      fromLeft: '',
      fromRight: '',
      fromType: 0
    };
    compile(newRule);
    newRules[k] = newRule;
  }

  for (var i = 0; i < messagesLength; i++) {
    var messageId = messageIds[i];
    var message = messages[messageId];
    result[messageId] = [];
    for (var j = 0; j < ruleLen; j++) {
      var nrule = newRules[j];
      var toResult = false;
      switch (nrule.toType) {
        case 0:
          toResult = nrule.toRule === message.to;
          break;
        case 1:
          toResult = nrule.toRegExp.test(message.to);
          break;
        case 2:
          toResult = nrule.toRegExp.test(message.to);
          break;
        case 3:
          toResult = qmarkTest(message.to, nrule.toRule);
          break;
        case 4:
          toResult = startsWithTest(message.to, nrule.toRule);
          break;
        case 5:
          toResult = endsWithTest(message.to, nrule.toRule);
          break;
        case 6:
          toResult = message.to.indexOf(nrule.toRule) !== -1;
          break;
        case 7:
          toResult = startsWithTest(message.to, nrule.toLeft) && endsWithTest(message.to, nrule.toRight);
          break;
        case 8:
          toResult = true;
          break;
      }
      var fromResult = false;
      switch (nrule.fromType) {
        case 0:
          fromResult = nrule.fromRule === message.from;
          break;
        case 1:
          fromResult = nrule.fromRegExp.test(message.from);
          break;
        case 2:
          fromResult = nrule.fromRegExp.test(message.from);
          break;
        case 3:
          fromResult = qmarkTest(message.from, nrule.fromRule);
          break;
        case 4:
          fromResult = startsWithTest(message.from, nrule.fromRule);
          break;
        case 5:
          fromResult = endsWithTest(message.from, nrule.fromRule);
          break;
        case 6:
          fromResult = message.from.indexOf(nrule.fromRule) !== -1;
          break;
        case 7:
          fromResult = startsWithTest(message.from, nrule.fromLeft) && endsWithTest(message.from, nrule.fromRight);
          break;
        case 8:
          fromResult = true;
          break;
      }
      if (fromResult && toResult) {
        result[messageId].push(nrule.action);
      }
    }
  }
  return result;
}

module.exports.filter = filter;
