module.exports = {
//  'string.match(string)': matchStr,
//  'string.match(RegExp)': matchRegExp,
//  'regex.test': regexTest,
//  'Pattern': patternTest,
  'endsWith': endsWith,
  'for..charAt': ForCharAtIteration,
  'endsWithObject': endsWithObject
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

function ForCharAtIteration(pattern) {
	var len = pattern.length;

  return {
    test: (text) => {
      for(var j = len-1,i = text.length; i-- > 0;--j) {
    		if (pattern.charAt(j) === '*')
    			return true;

    		if (pattern.charAt(j) !== text.charAt(i))
    			return false;
    	}

    	return false;
    }
  };
}

function endsWith(pattern) {
	pattern = pattern.replace(/\*/g,'');

	return {
    test: (text) => text.endsWith(pattern)
  };
}

function EndsWith(pattern) {
  this.suffix = pattern.replace(/\*/g,'');

  return this;
}

EndsWith.prototype.test = function EndsWith_test(text) {
  return text.endsWith(this.suffix);
};

function endsWithObject(pattern) {
  return new EndsWith(pattern);
}
