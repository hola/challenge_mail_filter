var regExpSpecialChars = '*?\^$+.()|{}[]';

function ruleToRegExp(p) {
	var exp = "";
	for(var i = 0; i < p.length; i++) {
		var c = p[i];
		var index = regExpSpecialChars.indexOf(c);
		switch(index) {
			case -1:
				exp += c;
				break;
			case 0:
				exp += '.*';
				break;
			case 1:
				exp += '.';
				break;
			default:
				exp += '\\' + c;
		}
	}
	return new RegExp('^'+exp+'$');
}

function getActions(m, rules) {
	var actions = [];
	for(var i = 0; i < rules.length; i++) {
		var r = rules[i];
		if( (!r._from || r._from.test(m.from)) &&
			(!r._to || r._to.test(m.to)) ) {
			actions.push(r.action);
		}
	}
	return actions;
}

function filter(messages, rules) {
	if(!rules._cached) {
		for(var i = 0; i < rules.length; i++) {
			var r = rules[i];
			if(r.from) {
				r._from = ruleToRegExp(r.from);
			}
			if(r.to) {
				r._to = ruleToRegExp(r.to);
			}
		}
		rules._cached = true;
	}
	var allActions = {};
	var ids = Object.keys(messages);
	for(var i = 0; i < ids.length; i++) {
		var id = ids[i];
		var m = messages[id];
		allActions[id] = getActions(m, rules);
	}
	return allActions;
}

module.exports = filter;