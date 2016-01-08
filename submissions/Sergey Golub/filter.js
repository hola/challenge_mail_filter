var r1 = /([.+^$[\]\\(){}|-])/g,
	r2 = /\*+/g,
	r3 = /\?/g;

function toRegExp(mask){
	return new RegExp('^' + mask.replace(r1, '\\$1').replace(r2, '(.*)').replace(r3, '(.)') + '$');
}

function Rule(rule){
	this.action = rule.action;
	this.notFrom = !rule.from || rule.from === '*';
	this.notTo = !rule.to || rule.to === '*';
	this.from = this.notFrom ? null : toRegExp(rule.from);
	this.to = this.notTo ? null : toRegExp(rule.to);
}

function filter(msgs, rules){
	var l = rules.length,
		msg,
		rule,
		cached = {},
		actions,
		key = '',
		d = String.fromCharCode(160);

	for (var i = 0; i < l; i++) {
		rules[i] = new Rule(rules[i]);
	}

	for (var x in msgs) {
		msg = msgs[x];
		key = msg.from + d + msg.to;
		if (cached[key]) {
			msgs[x] = cached[key];
		} else {
			actions = msgs[x] = cached[key] = [];
			for(i = 0; i < l; i++){
				rule = rules[i];
				if ((rule.notFrom || rule.from.test(msg.from)) &&
					(rule.notTo || rule.to.test(msg.to))) {
					actions.push(rule.action);
				}
			}
		}
	}

	return msgs;
}

module.exports.filter = filter;