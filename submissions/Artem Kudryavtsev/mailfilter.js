/**
 * JS challenge Winter 2015: Mail Filtering Engine
 * Code written by Artem Kudryavtsev, 24.11.2015
 * Version 1.1 
 *  - with a caching of the compiled RegExps
 *  - reading of the 'matchs' dictionary optimized
 * Example:
	filter({
	    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
	    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
	    msg3: {from: 'boss@work.com', to: 'jack@example.com'}
	}, [
	    {from: '*@work.com', action: 'tag work'},
	    {from: '*@spam.com', action: 'tag spam'},
	    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
	    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
	])
	returns
	{
	    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
	    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
	    msg3: ['tag work']
	}
 */
function filter(messages, rules) {
	var rslt = {};
	var msg, msgFrom, msgTo, actions, rule, ruleFrom, ruleTo;		
	for (var prop in messages) {				
		msg = messages[prop];
		msgFrom = msg.from;
		msgTo = msg.to;
		actions = [];		
		for (var i = 0; i < rules.length; i++) {
			rule = rules[i];
			ruleFrom = rule.from || '*';
			ruleTo = rule.to || '*';			
			if (FilterUtil.hasMatch(msgFrom, ruleFrom) && FilterUtil.hasMatch(msgTo, ruleTo)) {
				actions.push(rule.action);
			}			
		}
		rslt[prop] = actions;		
	}	
	return rslt;
}

FilterUtil = function() {};
FilterUtil.matchs = {};
FilterUtil.regexps = {};
FilterUtil.hasMatch = function(str, rule) {
	if (!rule) rule = '*';	
	var matchs = FilterUtil.matchs;
	var regexps = FilterUtil.regexps;
	var key = FilterUtil.buildMatchKey(str, rule);
	var val = matchs[key];
	if (val != undefined) {			
		return val;
	}	
	if (rule == '*') {
		matchs[key] = true;
		return true;
	}		
	var hasWildcard = rule.indexOf('*') >= 0;
	var hasQuestionmark = rule.indexOf('?') >= 0;
	if (hasWildcard || hasQuestionmark) {		
		if (rule.indexOf('.') >= 0)			
			rule = rule.replace(/\./g, '\\.');
		if (hasQuestionmark)
			rule = rule.replace(/\?/g, '.');
		if (hasWildcard)
			rule = rule.replace(/\*/g, '.+');
		matchs[key] = val = str.match(regexps[rule] || (regexps[rule] = new RegExp(['^', rule, '$'].join('')))) != null;		
	} else {
		matchs[key] = val = str == rule;		
	}
	return val;
}

FilterUtil.buildMatchKey = function(str, rule) {
	return str + rule;
}