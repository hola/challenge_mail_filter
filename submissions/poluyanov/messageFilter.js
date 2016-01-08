var needsTokens = /\?|\*/g;

var tokenRe = new RegExp(
	'\\' + ['*', '?', '.', '[',']','(',')','{','}','$','^','|','+','-','/','\\'].join('|\\')
, 'g');

function tokenEscaper(match){
	switch(match){
		case '*':
			return '[\\x20-\\x7E]*';
		case '?':
			return '[\\x20-\\x7E]';
		case '.':
		case '[':
		case ']':
		case '(':
		case ')':
		case '{':
		case '}':
		case '^':
		case '$':
		case '|':
		case '+':
		case '-':
		case '/':
		case '\\':
			return '\\' + match;
	}
}

function getTestFunc(mask){
	var re,
	    foundTokens;

	if(mask && mask !== '*'){
		if(foundTokens = mask.match(needsTokens)){
			if(foundTokens.length === 1 && mask[0] === '*'){
				/* *@smth.com */
				mask = mask.substr(1);

				return value => value.lastIndexOf(mask) === value.length - mask.length;
			} else if(foundTokens.length === 1 && mask[mask.length - 1] === '*'){
				/* smth@* */
				mask = mask.substr(0, mask.length - 1);

				return value => value.indexOf(mask) === 0;
			} else {
				re = new RegExp('^' + mask.replace(tokenRe, tokenEscaper) + '$');

				return value => re.test(value);
			}
		} else {
			return value => value === mask;
		}
	}
}

function generateRule(rule){
	var fromTest = getTestFunc(rule.from),
	    toTest = getTestFunc(rule.to);

	if(!toTest && !fromTest){
		return () => rule.action
	} else if(toTest && fromTest){
		return (fromEmail, toEmail) => fromTest(fromEmail) && toTest(toEmail) && rule.action
	} else if(fromTest){
		return (fromEmail) => fromTest(fromEmail) && rule.action
	} else {
		return (fromEmail, toEmail) =>  toTest(toEmail) && rule.action
	}
};

module.exports = function(messages, rules){
	var currentMessageId,
	    rulesLength = rules.length,
	    messagesIds = Object.keys(messages),
	    messagesLen = messagesIds.length,
	    messageObj,
	    testResult,
	    ii = 0,
	    i = 0;

	rules = rules.map(generateRule);

	for(;i < messagesLen; i++){
		currentMessageId = messagesIds[i];
		messageObj = messages[currentMessageId];
		ii = 0;

		messages[currentMessageId] = [];

		for(;ii < rulesLength; ii++){
			(testResult = rules[ii](messageObj.from, messageObj.to)) && messages[currentMessageId].push(testResult)
		}
	}

	return messages;
};