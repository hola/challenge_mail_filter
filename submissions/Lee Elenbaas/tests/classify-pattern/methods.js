module.exports = {
	"for..charAt": forWithStates,
	"multi RegExp.text": multiRegExpTest,
	"single RegExp.match": singleRegExpMatch
};

var patternRegExp = /^(\**)([^\*\?]*)(\?*)([^\*]*)(\**)$/;

function singleRegExpMatch(pattern) {
	if (!pattern)
		return "nullMatch";
		
	var match = patternRegExp.exec(pattern);
	
	if (!match)
		return "complex";

	if (match[1] && !match[2] && !match[3])
		return "nullMatch";
		
	if (match[1] && !match[3] && match[5])
		return "contained";

	if (!match[1] && !match[3] && !match[5])
		return "exactMatch";

	if (match[1] && !match[5])
		return "ends-with";

	if (!match[1] && match[5])
		return "starts-with";
		
	return "complex";
}

function forWithStates(pattern) {
	if (!pattern)
		return "nullMatch";

	var hasFreeEnd = false;
	for(var ei = pattern.length; ei-- > 0;) {
		if (pattern.charAt(ei) !== '*')
			break;
			
		hasFreeEnd = true;
	}

	if (ei < 0)
		return "nullMatch";
		
	var hasFreeStart = false;
	for(var si = 0; si <= ei; ++si) {
		if (pattern.charAt(si) !== '*')
			break;
			
		hasFreeStart = true;
	}
	
	var hasQuestionWildCard = false;
	var hasStarWildCard = false;
	for(var i = si; i <= ei; ++i) {
		var ch = pattern.charAt(i);
		
		if (ch === '?') {
			if (hasFreeStart && hasFreeEnd)
				return "complex";
				
			hasQuestionWildCard = true;
		}
		
		if (ch === '*')
			return "complex";
	}
	
	if (hasFreeStart && hasFreeEnd)
		return "contained";
		
	if (hasFreeStart)
		return "ends-with";

	if (hasFreeEnd)
		return "starts-with";
		
	if (!hasQuestionWildCard)
		return "exactMatch";
		
	return "complex";
}

var nullMatchRegExp = /^\**$/;
var exactMatchRegExp = /^[^\?\*]+$/;
var endsWithRegExp = /^\*+[^\*]+$/;
var startsWithRegExp = /^[^\*]+\*+$/;
var containsRegExp = /^\*+[^\?\*]+\*+$/;

function multiRegExpTest(pattern) {
	if (!pattern || nullMatchRegExp.test(pattern))
		return "nullMatch";
		
	if (exactMatchRegExp.test(pattern))
		return "exactMatch";

	if (startsWithRegExp.test(pattern))
		return "starts-with";

	if (endsWithRegExp.test(pattern))
		return "ends-with";

	if (containsRegExp.test(pattern))
		return "contained";
		
	return "complex";
}
