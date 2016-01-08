/**
 * JS challenge Winter 2015: Mail Filtering Engine
 * @see http://hola.org/challenge_mail_filter
 * @author Vitalii Petrychuk <vitaliy@petrychuk.com>
 * @licence
 * Copyright (c) 2015 Example Corporation Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var MASK_HAS_PLAIN_TEXT_ONLY = 0;
var MASK_HAS_ASTERISK_ONLY = 1;
var MASK_HAS_QUESTION_ONLY = 2;
var MASK_HAS_BOTH_ASTERISK_AND_QUESTION = 3;

/**
 * Merry Christmas :)
 * @type {Array<string>}
 */
var MATCH_ANY = [
  '*',
  '**',
  '***',
  '****',
  '*****',
  '***',
  '****',
  '*****',
  '******',
  '*******',
  '********',
  '*********',
  '******',
  '*******',
  '********',
  '*********',
  '**********',
  '***********',
  '************',
  '*************',
  '**************'
];

/**
 * @param mask {string}
 * @returns {number}
 */
function getSecondAsteriskIndex(mask) {
  var index = 0;
  var found = 0;
  while (index < mask.length) {
    if (mask[index] === '*' && ++found === 2) {
      return index;
    }
    index++;
  }
  return -1;
}

/**
 * @param string {string}
 * @param substring {string}
 * @returns {number}
 */
function indexOf(string, substring) {
  return string.indexOf(substring);
}

/**
 * @param string {string}
 * @param [start] {number}
 * @param [end] {number}
 * @returns {string}
 */
function slice(string, start, end) {
  return string.substring(start, end);
}

/**
 * Optimize the mask.
 *   1. Replace sequence of asterisks by single one.
 * @param mask {string}
 * @returns {string}
 */
function optimizeAsteriskMask(mask) {
  var newMask = '';

  var i = 0;
  while (i < mask.length) {
    var char = mask[i];

    switch (char) {
      case '*':
        while (mask[i + 1] === '*') {
          i++;
        }
        newMask += '*';
        break;

      default:
        newMask += char;
        break;
    }

    i++;
  }
  return newMask;
}

/**
 * Create the most suitable match method.
 * @param mask {string}
 * @returns {Object}
 */
function createMask(mask) {
  var hasAsterisk = ~indexOf(mask, '*');
  var hasQuestion = ~indexOf(mask, '?');

  if (hasAsterisk && hasQuestion) {
    return {
      type: MASK_HAS_BOTH_ASTERISK_AND_QUESTION,
      value: optimizeAsteriskMask(mask),
      secondAsteriskIndex: void 0
    };
  }
  else if (hasAsterisk) {
    var optimizedMask = optimizeAsteriskMask(mask);
    return {
      type: MASK_HAS_ASTERISK_ONLY,
      value: optimizedMask,
      secondAsteriskIndex: getSecondAsteriskIndex(optimizedMask)
    };
  }
  else if (hasQuestion) {
    return {
      type: MASK_HAS_QUESTION_ONLY,
      value: mask,
      secondAsteriskIndex: void 0
    };
  }
  else {
    return {
      type: MASK_HAS_PLAIN_TEXT_ONLY,
      value: mask,
      secondAsteriskIndex: void 0
    };
  }
}

/**
 * @param mask {string}
 * @param input {string}
 * @param secondAsteriskIndex {number}
 * @returns {boolean}
 */
function isMaskWithAsteriskMatch(mask, input, secondAsteriskIndex) {
  var inputIndex = 0;
  var maskIndex = 0;

  while (maskIndex < mask.length) {
    var maskChar = mask[maskIndex];

    switch (maskChar) {
      case '*':

        // Look for the next mandatory phrase before the next *
        var nextPhrase = slice(mask, maskIndex + 1, secondAsteriskIndex === -1 ? mask.length : secondAsteriskIndex);
        if (nextPhrase) {
          var restInput = slice(input, inputIndex);
          var nextInputCharIndex;
          while (~(nextInputCharIndex = indexOf(restInput, nextPhrase))) {
            var restMask = slice(mask, maskIndex + 1);
            restInput = slice(restInput, nextInputCharIndex);
            if (isMaskWithAsteriskMatch(restMask, restInput, getSecondAsteriskIndex(restMask))) {
              return true;
            }
            restInput = slice(restInput, 1);
          }
          return false;
        }
        else {
          return true;
        }

      default:
        if (maskChar !== input[inputIndex]) {
          return false;
        }
    }

    inputIndex++;
    maskIndex++;
  }

  return inputIndex === input.length;
}

/**
 * @param mask {string}
 * @param input {string}
 * @returns {boolean}
 */
function isMaskWithAsteriskAndQuestionMatch(mask, input) {
  var inputIndex = 0;
  var maskIndex = 0;

  while (maskIndex < mask.length) {
    var maskChar = mask[maskIndex];
    var inputChar = input[inputIndex];
    if (inputChar === void 0 && maskChar !== '*') {
      return false;
    }

    switch (maskChar) {
      case '*':
        var restMask = slice(mask, maskIndex + 1);
        var nextChar = restMask[0];
        if (nextChar) {
          var restInput;
          var asteriskIndex = indexOf(restMask, '*');
          var hasMoreAsterisks = ~asteriskIndex;

          // Any could match, have to check all possible options
          if (nextChar === '?') {
            restInput = slice(input, inputIndex);
            while (restInput.length) {
              if (hasMoreAsterisks) {
                if (isMaskWithAsteriskAndQuestionMatch(restMask, restInput)) {
                  return true;
                }
              }
              else if (isMaskWithQuestionMatch(restMask, restInput)) {
                return true;
              }
              restInput = slice(restInput, 1);
            }
            return false;
          }

          // Look for the next mandatory phrase before the next * or ?
          else {
            var questionIndex = indexOf(restMask, '?');
            var hasQuestion = ~questionIndex;
            var nextPhraseToIndex;
            if (hasMoreAsterisks) {
              nextPhraseToIndex = hasQuestion ?
                (questionIndex < asteriskIndex ? questionIndex : asteriskIndex) :
                (asteriskIndex);
            }
            else {
              nextPhraseToIndex = hasQuestion ?
                questionIndex :
                restMask.length;
            }
            var nextInputCharIndex;
            var nextPhrase = slice(restMask, 0, nextPhraseToIndex);
            restInput = slice(input, inputIndex);
            while (~(nextInputCharIndex = indexOf(restInput, nextPhrase))) {
              restInput = slice(restInput, nextInputCharIndex);
              if (hasMoreAsterisks) {
                if (isMaskWithAsteriskAndQuestionMatch(restMask, restInput)) {
                  return true;
                }
              }
              else {
                if (hasQuestion) {
                  if (isMaskWithQuestionMatch(restMask, restInput)) {
                    return true;
                  }
                }
                else {
                  return restMask === restInput;
                }
              }
              restInput = slice(restInput, 1);
            }
            return false;
          }
        }
        else {
          return true;
        }

      case '?':
        break;

      default:
        if (maskChar !== inputChar) {
          return false;
        }
    }

    inputIndex++;
    maskIndex++;
  }

  return inputIndex === input.length;
}

/**
 * @param mask {string}
 * @param input {string}
 * @returns {boolean}
 */
function isMaskWithQuestionMatch(mask, input) {
  if (input.length !== mask.length) {
    return false;
  }

  var tempInputArray = 0;
  while (tempInputArray < input.length) {
    var maskChar = mask[tempInputArray];
    if (maskChar !== '?' && maskChar !== input[tempInputArray]) {
      return false;
    }
    tempInputArray++;
  }
  return true;
}

/**
 * @param mask {Object}
 * @param input {string}
 * @returns {boolean}
 */
function isMatch(mask, input) {
  switch (mask.type) {
    case MASK_HAS_PLAIN_TEXT_ONLY:
      return mask.value === input;

    case MASK_HAS_ASTERISK_ONLY:
      return isMaskWithAsteriskMatch(mask.value, input, mask.secondAsteriskIndex);

    case MASK_HAS_BOTH_ASTERISK_AND_QUESTION:
      return isMaskWithAsteriskAndQuestionMatch(mask.value, input);

    case MASK_HAS_QUESTION_ONLY:
      return isMaskWithQuestionMatch(mask.value, input);
  }
}

/**
 * @param rules {Array<Object>}
 * @returns {Array<Object>}
 */
function normalizeRules(rules) {
  var normalizedRules = [];
  var rulesLength = rules.length;
  var index = 0;
  while (index < rulesLength) {
    var rule = rules[index];
    var from = rule.from;
    var to = rule.to;
    var appliesToAll = false;
    var maskFrom = void 0;
    var maskTo = void 0;

    if (~MATCH_ANY.indexOf(from)) {
      from = void 0;
    }
    if (~MATCH_ANY.indexOf(to)) {
      to = void 0;
    }

    if (from && to) {
      maskFrom = createMask(from);
      maskTo = createMask(to);
    }
    else if (from) {
      maskFrom = createMask(from);
    }
    else if (to) {
      maskTo = createMask(to);
    }
    else {
      appliesToAll = true;
    }

    normalizedRules.push({
      action: rule.action,
      maskFrom: maskFrom,
      maskTo: maskTo,
      appliesToAll: appliesToAll
    });

    index++;
  }

  return normalizedRules;
}

/**
 * @param messages {Object}
 * @param rules {Array<Object>}
 * @returns {Object}
 */
function applyRules(messages, rules) {
  var result = {};
  var messagesRulesCache = {};
  var messageKeys = Object.keys(messages);

  var messageKeysLengthTemp = messageKeys.length;
  while (messageKeysLengthTemp--) {
    var key = messageKeys[messageKeysLengthTemp];
    var message = messages[key];
    var messageFrom = message.from;
    var messageTo = message.to;

    // faster than using [from][to]
    var cachedMessageResultKey = messageFrom + '✔' + messageTo;
    var cachedMessageResult = messagesRulesCache[cachedMessageResultKey];
    if (cachedMessageResult) {
      result[key] = cachedMessageResult;
      continue;
    }

    var indexes = [];
    var rulesLength = rules.length;
    var ruleIndex = 0;
    while (ruleIndex < rulesLength) {
      var rule = rules[ruleIndex];
      if (rule.appliesToAll) {
        indexes.push(ruleIndex);
        ruleIndex++;
        continue;
      }

      var maskFrom = rule.maskFrom;
      var maskTo = rule.maskTo;
      if (maskFrom && maskTo) {
        if (isMatch(maskFrom, messageFrom) && isMatch(maskTo, messageTo)) {
          indexes.push(ruleIndex);
        }
      }
      else if (maskFrom) {
        if (isMatch(maskFrom, messageFrom)) {
          indexes.push(ruleIndex);
        }
      }
      else {
        if (isMatch(maskTo, messageTo)) {
          indexes.push(ruleIndex);
        }
      }

      ruleIndex++;
    }

    var strLength = indexes.length;
    if (strLength) {
      var messageRules = result[key] = messagesRulesCache[cachedMessageResultKey] = new Array(strLength);
      var strLengthTemp = strLength;
      while (strLengthTemp--) {
        messageRules[strLengthTemp] = rules[indexes[strLengthTemp]].action;
      }
    }
    else {
      result[key] = messagesRulesCache[cachedMessageResultKey] = [];
    }
  }

  return result;
}

/**
 * @param messages {Object}
 * @param rules {Array<Object>}
 * @returns {Object}
 */
function filter(messages, rules) {
  return applyRules(messages, normalizeRules(rules));
}

module.exports = filter;
