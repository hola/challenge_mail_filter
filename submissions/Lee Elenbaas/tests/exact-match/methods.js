module.exports = {
  '==': equalityCheck,
  '===': identityCheck,
  'string.localeCompare': localeCompare,
  'string.match(string)': matchStr,
  'string.match(RegExp)': matchRegExp,
  'regex.test': regexTest,
  'Pattern': patternTest,
  'for..charAt': ForCharAtIteration,
  'endsWith': endsWith,
  'startsWith': startsWith
};

var Pattern = require('../pattern-matching/match-pattern');

function equalityCheck(pattern) {
	return {
    test: (text) => pattern == text
  };
}

function identityCheck(pattern, text) {
  return {
    test: (text) => pattern === text
  };
}

function localeCompare(pattern, text) {
  return {
    test: (text) => pattern.localeCompare(text) === 0
  };
}

function matchStr(pattern) {
  pattern = '^'+pattern+'$';

	return {
    test: (text) => !!text.match(pattern)
  };
}

function matchRegExp(pattern) {
  var regExp = new RegExp('^'+pattern+'$');

	return {
    test: (text) => !!text.match(regExp)
  };
}

function patternTest(pattern, text) {
	return new Pattern(pattern);
}

function regexTest(pattern, text) {
	return new RegExp('^'+pattern+'$');
}

function ForCharAtIteration(pattern) {
	var len = pattern.length;

  return {
    test: (text) => {
      if (text.length !== len)
    		return false;

    	for(var i = 0; i < len; ++i) {
    		if (pattern.charAt(i) !== text.charAt(i))
    			return false;
    	}

    	return true;
    }
  };
}

function endsWith(pattern) {
	return {
    test: (text) => (pattern.length === text.length) && text.endsWith(pattern)
  };
}

function startsWith(pattern) {
	return {
    test: (text) => (pattern.length === text.length) && text.startsWith(pattern)
  };
}
