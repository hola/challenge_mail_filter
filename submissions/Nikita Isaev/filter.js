exports.filter = function(messages, rules) {
  var actions = {};
	for (var key in messages) {
	  actions[key] = [];
		rules.forEach(function(rule) {
			if(perform(messages[key], rule)) {
			  actions[key].push(rule.action);
			}
		});
	}
	return actions;
}
function perform(message, rule) {
  function check(property) {
		if (rule[property] === undefined) {
			return true;
		}
    if ((rule[property].indexOf('*') != -1) || (rule[property].indexOf('?') != -1)) {
      return compare(message[property], rule[property]);
    }
    return message[property] === rule[property];
  }
	return check('from') && check('to');
}
function compare(text, mask) {
	var escSyms = /['^', '$', '.', '+', '=', '!', ':', '|', '\\', '/', '(', ')', '\[', '\]', '{', '}', '-']/g;
	mask = mask.replace(escSyms, '\\$&');
	mask = mask.replace(/\*/g, '.*');
	mask = mask.replace(/\?/g, '.');
	mask = '^' + mask + '$';
	mask = new RegExp(mask, 'g');
	return mask.test(text);
}