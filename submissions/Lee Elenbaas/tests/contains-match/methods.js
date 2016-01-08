module.exports = {
  'indexOf': indexOf,
  'regex.test': regexTest,
  'string.match(RegExp)': matchRegExp,
  'string.match(string)': matchStr,
  'Pattern': patternTest
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

function patternTest(pattern) {
	return new Pattern(pattern);
}

function regexTest(pattern) {
	return new RegExp('^'+pattern.replace(/\*/g,".*")+'$');
}

function indexOf(pattern) {
  pattern = pattern.replace(/\*/g, '');

  return {
    test: (text) => (text.length >= pattern.length) && (text.indexOf(pattern) !== -1)
  };
}
