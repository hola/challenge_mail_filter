exports.filter = function(messages, rules){
  var result = {};
  for (var message in messages) {
    if(messages.hasOwnProperty(message)) {
      result[message] = [];
      for (var i = 0; i < rules.length; i++) {
        var fromRes, toRes;
        if (rules[i].from) {
          fromRes = testRegex(messages[message].from, rules[i].from);
        } else {
          fromRes = true;
        }

        if (rules[i].to) {
          toRes = testRegex(messages[message].to, rules[i].to);
        } else {
          toRes = true;
        }

        if (fromRes && toRes) {
          result[message].push(rules[i].action);
        }
      }
    }
  }

  return result;
}

function testRegex(text, regex){
  var i = 0;
  var textLength = text.length;

  var stateInfo = generatePossibleStates(regex);
  var states = stateInfo[0];
  var statesRev = stateInfo[1];
  var minLength = stateInfo[2];

  if (text.length < minLength) {
    return false;
  }

  var numStates = states.length;

  var stateIndex = 0;
  var revStateIndex = 0;

  var lastSelfLoop = null;
  var lastLoopCharIndex = null;
  var isSpecialLoop = false;

  var revLastSelfLoop = null;
  var revLastLoopCharIndex = null;
  var isRevSpecialLoop = false;

  var j = 0;

  while (i < textLength) {
    // Starting from the beginning of the string
    var textChar = text[i];

    if (states[stateIndex].next == 1 || states[stateIndex].next == textChar) {
      if (states[stateIndex].isSelfLoop) {
        lastSelfLoop = stateIndex;
        lastLoopCharIndex = i + 1;
        isSpecialLoop = states[stateIndex].next == 1;
      }
      stateIndex++;
      i++;
    } else if (states[stateIndex].isSelfLoop) {
      i++;
    } else {
      if (lastSelfLoop !== null) {
        if (isSpecialLoop) {
          i = lastLoopCharIndex;
        } else {
          if (textChar != states[lastSelfLoop].next) {
            i++;
          }
        }
        stateIndex = lastSelfLoop;
      } else {
        return false;
      }
    }

    if (stateIndex == numStates - 1) {
      if (i == textLength || states[stateIndex].isSelfLoop) {
        return true;
      } else {
        if (lastSelfLoop != null) {
          if (isSpecialLoop) {
            i = lastLoopCharIndex;
          } else {
            i++;
          }
          stateIndex = lastSelfLoop;
        } else {
          return false;
        }
      }
    }

    //Starting from the end of the string
    var revTextChar = text[textLength - j - 1];
    if (!(statesRev[revStateIndex].next == 1 || statesRev[revStateIndex].isSelfLoop)) {
      if (statesRev[revStateIndex].next == revTextChar) {
        revStateIndex++;
        j++;
      } else {
        return false;
      }
    }

    if (stateIndex >= (numStates - revStateIndex - 1)) {
      if (i == textLength) {
        return false;
      } else {
        return true;
      }
    }

  }

  return false;
}

function generatePossibleStates(regex) {
  var strLength = regex.length;
  var states = [];
  var statesRev = [];
  var minLength = 0;
  for (var i = 0; i < strLength; i++) {
    var regexChar = regex[i];
    if (regexChar == '*') {
      var nextChar = regex[i + 1];
      var nextVal = nextChar;
      if (nextChar !== undefined) {
        minLength++;
      }
      if (nextChar == '?') {
        nextVal = 1;
      }
      states[states.length] = {
        isSelfLoop: true,
        next: nextVal
      };
      i++;
    } else if (regexChar == '?') {
      states[states.length] = {
        next: 1
      };
      minLength++;
    } else {
      states[states.length] = {
        next: regexChar
      };
      minLength++;
    }
  }

  for (var i = strLength - 1; i >= 0; i--) {
    var regexChar = regex[i];
    if (regexChar == '*') {
      var nextChar = regex[i - 1];
      var nextVal = nextChar;
      if (nextChar == '?') {
        nextVal = 1;
      }
      statesRev[statesRev.length] = {
        isSelfLoop: true,
        next: nextVal
      };
      break;
    } else if (regexChar == '?') {
      statesRev[statesRev.length] = {
        next: 1
      };
      break;
    } else {
      statesRev[statesRev.length] = {
        next: regexChar
      };
    }
  }

  if(!states[states.length - 1].isSelfLoop || (states.length == 1 && states[states.length - 1].next)) {
    states[states.length] = {
      next: null
    }
  }

  statesRev[statesRev.length] = {
    next: null
  }

  return [states, statesRev, minLength];
}
