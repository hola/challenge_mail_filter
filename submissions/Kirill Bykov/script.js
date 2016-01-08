var REG_EXPS = {
	"*": /.*/
};

var _getRegExp = function(pattern) {
	if ( REG_EXPS[ pattern ] === undefined ) {
		var re = pattern.replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
		REG_EXPS[ pattern ] = new RegExp('^' + re + '$');
	}
	
	return REG_EXPS[ pattern ];
}

var _filter = function(msg, rule) {
	if ( !rule.from && !rule.to ) {
		return true;
	}
	
	var from = _getRegExp(rule.from || '*');
	var to = _getRegExp(rule.to || '*');

	return from.test(msg.from) && to.test(msg.to);
};

var _map = function(rule) {
	return rule.action;
};

function filter(messages, rules) {

	var result = {};

	for (var id in messages) {
		result[id] = rules.filter(function(rule){
			return _filter(messages[id], rule);
		}).map(_map);
	}

	return result;
}

exports.filter = filter;