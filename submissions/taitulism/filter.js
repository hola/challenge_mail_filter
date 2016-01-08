var rgxMap = {
	escapeDot: /\./g,
	wildcard: /\*/g,
	oneChar: /\?/g
};

var resolvedRgx = {};

module.exports = function filter (messages, rules) {
	var msgID,
		results      = {};
		checkMessage = createCheckMessage(rules, results);

	for (msgID in messages){
		checkMessage(msgID, messages[msgID]);
	}

	return results;
};

function strMatch (msgStr, ruleStr) {
	var rgxStr, rgx;

	ruleStr = ruleStr || '*';

	resolvedRgx[ruleStr] = resolvedRgx[ruleStr] || ruleStr.replace(rgxMap.escapeDot, '\\.')
														  .replace(rgxMap.wildcard, '.*')
														  .replace(rgxMap.oneChar, '.');

	rgx = new RegExp('^' + resolvedRgx[ruleStr] + '$');

	return rgx.test(msgStr);
}

function isMsgMatchRule (msg, rule) {
	if (strMatch(msg.to, rule.to)
		 &&
		strMatch(msg.from, rule.from))
	{return true;}
	
	return false;
}

function createCheckMessage (rules, results) {
	return function checkMessage (msgID, msgObj) {
		var rule,
			rulesLen = rules.length,
			i        = rulesLen-1,
			actions  = [];
		
        for (; i >= 0 ; i-=1) {
			rule = rules[i];
			
			if (isMsgMatchRule(msgObj, rule)) {
				actions.unshift(rule.action);
			}
			
			results[msgID] = actions;
		}	
	};
}
