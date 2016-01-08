module.exports = {
  'string.match(string)': matchStr,
  'string.match(regexp)': matchRegExp,
  'regex.test': regexTest,
  'Pattern': patternTest,
  'null match object': nullObject
};

var Pattern = require('../pattern-matching/match-pattern');

function matchStr(pattern) {
	if (!pattern)
		pattern = "*";

  pattern = '^'+pattern.replace(/\*/g,".*")+'$';

	return {
    test: (text) => !!text.match(pattern)
  };
}

function matchRegExp(pattern) {
	if (!pattern)
		pattern = "*";

  var regExp = new RegExp('^'+pattern.replace(/\*/g,".*")+'$');

	return {
    test: (text) => !!text.match(regExp)
  };
}

function regexTest(pattern) {
	if (!pattern)
		pattern = "*";

	return new RegExp('^'+pattern.replace(/\*/g,".*")+'$');
}

function patternTest(pattern) {
	return new Pattern(pattern);
}

var nullObjectImp = {
  test: () => true
};

function nullObject(pattern) {
	return nullObjectImp;
}
