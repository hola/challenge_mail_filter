/// Author Alexey Semashkevich
var filter = function (messages, rules) {
	var _regexp = new RegExp();
	var compare = function(text, template) {
		_regexp.compile('^' + template + '$');
		return _regexp.test(text);
	};

	var result = {};
	var check_messages = function(buff) {
		var r = this;
		var k = Object.keys(r);
		var m = null;
		var l = msg_keys.length;
		var _check = function(param) {
			var sw = null;
			var mk = null;
			if (param) {
				r[param] = r[param].replace(/\?/g, ".");
				r[param] = r[param].replace(/\*/g, ".*");
			}
			for (;l--;) {
				mk = msg_keys[l];
				m = messages[mk];
				if (!result[mk])
					result[mk] = [];
				sw = param ? compare(m[param], r[param]) : compare(m.from, r.from) && compare(m.to, r.to);
				if (sw) {
					if (!buff.length) {
						result[mk].push(r.action);
						continue;
					}
					result[mk] = result[mk].concat(buff);
					result[mk].push(r.action);
				} else if (buff.length) {
					result[mk] = result[mk].concat(buff);
				}
			}
		};

		if (k.length == 2 && r.from) {
			_check("from");
		} else if (k.length == 2 && r.to) {
			_check("to");
		} else {
			_check();
		}
	};

	var msg_keys = Object.keys(messages);
	msg_keys.reverse();

	var _rules = rules.reverse();
	var rl = _rules.length;
	var r = null;
	var buff = [];
	for (;rl--;) {
		r = _rules[rl];
		if (!r.from && !r.to) {
			buff.push(r.action);
			continue;
		}
		check_messages.call(r, buff);
		if (buff.length)
			buff = [];
	}
	if (buff.length) {
		check_messages.call(r, buff);
	}
	return result;
};

module.exports = filter;