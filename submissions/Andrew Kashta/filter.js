/**
 * Copyright 2015 Andrey Kashta av.kashta@gmail.com
 */

"use strict";

const CACHE_THRESHOLD = 1;

/**
 * Filter messages by rules
 *
 * @param   {Object}   messages - messages to filter
 * @param   {Object[]} rules    - filter rules
 * @returns {Object}            - filtered messages
 */
function filter(messages, rules) {
  let keys        = Object.keys(messages),
      msgsFromMap = new Map(), // all unique values of messages.from
      msgsToMap   = new Map(); // all unique values of messages.to

  prepareRules(rules);

  for (let i = 0; i < keys.length; i++) {
    let message = messages[keys[i]],
        to      = message.to,
        from    = message.from;

    let fromMap = msgsToMap.get(to);
    if (fromMap === undefined) {
      fromMap = new Map();
      msgsToMap.set(to, fromMap)
    }

    let value = fromMap.get(from);
    if (value === undefined) {
      let fromRules = msgsFromMap.get(from);
      if (fromRules === undefined) {
        fromRules = [];
        fromRules.count = 1;
        msgsFromMap.set(from, fromRules);
      } else {
        fromRules.count++;
      }

      value = {fromRules: fromRules, msgKeys: []};
      fromMap.set(from, value);
    }

    value.msgKeys.push(keys[i]);
  }

  msgsFromMap.forEach(function (fromRules, from) {
    if (fromRules.count > CACHE_THRESHOLD) {
      for (let i = 0; i < rules.length; i++) {
        if (match(from, rules[i].from)) {
          fromRules.push(i)
        }
      }
    }
  });

  msgsToMap.forEach(function (fromMap, to) {
    let toRules = [];
    for (let i = 0; i < rules.length; i++) {
      if (match(to, rules[i].to)) {
        toRules.push(i)
      }
    }
    fromMap.forEach(iterate, toRules);
  });

  function iterate (value, from) {
    let toRules = this,
        fromRules = value.fromRules,
        msgKeys = value.msgKeys,
        actions = [],
        i = 0,
        j = 0;

    if (fromRules.count > CACHE_THRESHOLD) {
      while (i < fromRules.length && j < toRules.length) {
        if(fromRules[i] < toRules[j]) {
          i++;
        } else if (fromRules[i] > toRules[j]) {
          j++;
        } else {
          actions.push(rules[fromRules[i]].action);
          i++;
          j++;
        }
      }
    } else {
      for (i = 0; i < toRules.length; i++ ) {
        let rule = rules[toRules[i]];
        if (match(from, rule.from)) {
          actions.push(rule.action);
        }
      }
    }

    for (i = 0; i < msgKeys.length; i++) {
      messages[msgKeys[i]] = actions;
    }
  }

  return messages;
}

/**
 * Checks if the string matches the rule
 * @param {string} string         - string to check
 * @param {object} rule
 * @param {string} [rule.pattern] - rule's pattern
 * @param {number} [rule.stars]   - number of wildcards in pattern
 * @param {number} [rule.quests]  - number of question marks in pattern
 * @returns {boolean}
 */
function match(string, rule) {
  if (rule === null) {
    return true;
  }

  let pattern    = rule.pattern,
      stars      = rule.stars,
      quests     = rule.quests,
      stringLen  = string.length,
      patternLen = pattern.length;

  if ((patternLen - stars > stringLen) || stars === 0 && stringLen !== patternLen) {
    return false;
  }

  if (stars === 0 && quests === 0) {
    return string === pattern;
  }

  // if the first char is wildcard and the last one is not, then start the loop from the end of the string
  if (pattern[0] !== '*' || pattern[0] === '*' &&  pattern[patternLen - 1] === '*') {
    let stringPos  = 0,
        patternPos = 0,
        curPos     = 0,
        wildPos    = -1;

    while (stringPos < stringLen) {
      if (patternPos < patternLen && (string[stringPos] === pattern[patternPos] && pattern[patternPos] !== '*' || pattern[patternPos] === '?')) {
        stringPos++;
        patternPos++;
      } else if (patternPos < patternLen && pattern[patternPos] === '*') {
        if(patternPos === patternLen - 1) {
          return true;
        }
        curPos = stringPos;
        wildPos = patternPos;
        patternPos++;
      } else if (wildPos >= 0) {
        curPos++;
        stringPos = curPos;
        patternPos = wildPos + 1;
      } else {
        return false;
      }
    }

    if (stringPos !== stringLen) {
      return false;
    }
    while (patternPos < patternLen && pattern[patternPos] === '*') {
      patternPos++;
    }
    return patternPos === patternLen;
  } else  {
    let stringPos  = stringLen - 1,
        patternPos = patternLen - 1,
        curPos     = stringPos,
        wildPos    = -1;

    while (stringPos >= 0) {
      if (patternPos >= 0 && (string[stringPos] === pattern[patternPos] && pattern[patternPos] !== '*' || pattern[patternPos] === '?')) {
        stringPos--;
        patternPos--;
      } else if (patternPos >= 0 && pattern[patternPos] === '*') {
        if(patternPos === 0) {
          return true;
        }
        curPos = stringPos;
        wildPos = patternPos;
        patternPos--;
      } else if (wildPos >= 0) {
        curPos--;
        stringPos = curPos;
        patternPos = wildPos - 1;
      } else {
        return false;
      }
    }

    if (stringPos !== -1) {
      return false;
    }
    while (patternPos >= 0 && pattern[patternPos] === '*') {
      patternPos--;
    }
    return patternPos === -1;
  }
}

/**
 * Counts number of special symbols in pattern of each rule
 * @param {Object[]} rules
 */
function prepareRules(rules) {
  for (let i = 0; i < rules.length; i++) {
    let rule  = rules[i];
    rule.from = preparePattern(rule.from);
    rule.to = preparePattern(rule.to);
  }
}

/**
 * Counts number of special symbols in pattern
 * @param {string} pattern
 * @returns {Object}
 */
function preparePattern(pattern) {
  if (!pattern || pattern === '*') {
    return null;
  }
  return {
    pattern: pattern,
    stars:   pattern.split('*').length - 1,
    quests:  pattern.split('?').length - 1
  };
}

module.exports = {
  filter: filter
};