"use strict";

function wildcard (str, pattern) {
  var s = 0,
    p = 0,
    starIdx = -1,
    match = 0,
    length = str.length,
    patternLength = pattern.length
  while (s < length) {
    if (p < patternLength) {
      if (pattern[p] == str[s] || pattern[p] == '?'){
        p++;
        s++;
      } else if (pattern[p] == '*'){
          starIdx = p
          p++
          match = s
      } else if (starIdx != -1) {
        s = ++match;
        p = starIdx + 1
      } else {
          return false;
      }
    } else if (starIdx != -1) {
        s = ++match;
        p = starIdx + 1
    } else {
        return false;
    }
  }
  while (p < patternLength && pattern[p] == '*')
    p++
  return p == patternLength;
}

var intersect = function(a, b) {
  var ai = 0, bi = 0;
  var result = [], aLength = a.length, bLength = b.length

  while( ai < aLength && bi < bLength )
  {
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }
  return result;
}
var unique = function(a) {
  return a.filter(function(item, index, items){ return items.indexOf(item) === index })
}
var getFromRules = function(rules, email) {
  var result = [], rulesLength = rules.length, rule
  for(var index2 = 0; index2 < rulesLength; index2++) {
    rule = rules[index2]
    if (!rule.from || wildcard(email, rule.from))
      result.push(index2)
  }
  return result
}
var getToRules = function(rules, email) {
  var result = [], rulesLength = rules.length, rule
  for(var index2 = 0; index2 < rulesLength; index2++) {
    rule = rules[index2]
    if (!rule.to || wildcard(email, rule.to))
      result.push(index2)
  }
  return result
}
var getCached = function(cache, key, callback) {
  var result
  cache.reads++
  if (result = cache.cache[key]) {
    cache.hits++
    return result
  }
  return cache.cache[key] = callback()
}

function getRulesCached(rules, message, cacheFrom, cacheTo) {
  var intersected, intersectedLength, currentRules,
    matchFrom, matchTo, index2
  matchFrom = getCached(cacheFrom, message.from, function() {
    return getFromRules(rules, message.from)
  })
  if (matchFrom.length == 0)
    return []
  matchTo = getCached(cacheTo, message.to, function() {
    return getToRules(rules, message.to)
  })
  intersected = intersect(matchTo, matchFrom)
  intersectedLength = intersected.length
  currentRules = []
  for(index2 = 0; index2 < intersectedLength; index2++) {
    currentRules.push(rules[intersected[index2]].action)
  }
  return currentRules
}
var getRulesNaive = function(rules, message) {
  var currentRules =  [], rule, rulesLength = rules.length
  for(var index2 = 0; index2 < rulesLength; index2++) {
    rule = rules[index2]
    if ((!rule.from || (wildcard(message.from, rule.from))) &&
      (!rule.to || wildcard(message.to, rule.to))) {
      currentRules.push(rule.action)
    }
  }
  return currentRules
}
module.exports = function (messages, rules) {
  var key, result = {},
    keys = Object.keys(messages),
    index = 0,
    keysLength = keys.length,
    rulesLength = rules.length,
    cacheFrom = {
      hits: 0,
      reads: 0,
      cache: {}
    },
    cacheTo = {
      hits: 0,
      reads: 0,
      cache: {}
    }, getRules = rulesLength > 70 ? getRulesCached : getRulesNaive
  for (; index < keysLength; index++) {
    key = keys[index]
    result[key] = getRules(rules, messages[key], cacheFrom, cacheTo)
    if (getRules === getRulesCached && index == Math.floor(keysLength / 10) &&  cacheFrom.reads > 0 && cacheTo.reads > 0
      && Math.min(cacheFrom.hits / cacheFrom.reads, cacheTo.hits / cacheTo.reads) < 0.2) {
      getRules = getRulesNaive
    }
  }

  return result
}

module.exports.filter = module.exports
