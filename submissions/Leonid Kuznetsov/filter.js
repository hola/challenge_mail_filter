(function () {
	"use strict";

	function mask2reg (mask) {
		return new RegExp(['^', (mask || '*').replace(/([\^\$\+\=\\\!\:\|\/\(\)\[\]\{\}])/g, '\\$1').replace(/\?/g, '.').replace(/\*/g, '.*'), '$'].join(''));
	}

	exports.filter = function filter (messages, rules) {
		rules.forEach(function (r) {
			r.from = mask2reg(r.from);
			r.to = mask2reg(r.to);
		});
		for (var key in messages) {
			var msg = messages[key],
			    actions = messages[key] = [];
			rules.forEach(function (r) {
				if (r.from.test(msg.from) && r.to.test(msg.to))
					actions.push(r.action);
			});
		}
		return messages;
	};
})()