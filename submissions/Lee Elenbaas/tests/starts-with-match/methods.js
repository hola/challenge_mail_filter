module.exports = {
  'string.match(string)': matchStr,
  'string.match(RegExp)': matchRegExp,
  'regex.test': regexTest,
  'Pattern': patternTest,
  'for..charAt': ForCharAtIteration,
  'startsWith': startsWith
};

var Pattern = require('../pattern-matching/match-pattern');

function matchStr(pattern) {
  pattern = '^'+pattern.replace(/\*/g,".*")+'$';

	return {
    test: (text) => !!text.match(pattern)
  };
}

function matchRegExp(pattern) {
  var regExp = new RegExp('^'+pattern.replace(/\*/g,".*")+'$');

	return {
    test: (text) => !!text.match(regExp)
  };
}

function patternTest(pattern, text) {
	return new Pattern(pattern);
}

function regexTest(pattern, text) {
	return new RegExp('^'+pattern.replace(/\*/g,".*")+'$');
}

function ForCharAtIteration(pattern) {
	var len = pattern.length;

  return {
    test: (text) => {
      var textLen = text.length;

      for(var i = 0; i < len && i < textLen; ++i) {
    		if (pattern.charAt(i) == '*')
    			return true;

    		if (pattern.charAt(i) !== text.charAt(i))
    			return false;
    	}

    	return false;
    }
  };
}

function startsWith(pattern) {
	pattern = pattern.replace(/\*/g,'');

	return {
    test: (text) => text.startsWith(pattern)
  };
}
