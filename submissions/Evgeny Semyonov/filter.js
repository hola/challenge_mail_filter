/**
 * filter massages
 * @param messages Object
 * @param rules Array
 * @returns {Object}
 * @autor Evgeniy Semenov
 * @mail semenovem@gmail.com
 */
function filter(messages, rules) {
	"use struct";
	var k, msg;

	// convert rules to RegExp
	rules.forEach( rule => {
		var r;
		r = rule.from || rule.to;
		while (r) {

			r = new RegExp(
				(r[0] != '*' ? '^' : '') +                // start string
				r.replace(
					/([.[+$^|\\()])|(\*)|(\?)/g,
					(s, bkt1, bkt2, bkt3) => {
						return (
							bkt1 && '\\' + bkt1 ||
							bkt2 && '.*' ||
							bkt3 && '.'
						);
					}
				) +
				(r[r.length - 1] != '*' ? '$' : '')     // complete str
			);

			r = rule.from && rule.from[0] && (rule.from = r) && rule.to || rule.to && (rule.to = r) && false;
		}
	} );

	// iteration for compare message to rules
	for (k in messages) {
		msg = messages[k];
		messages[k] = [];

		// iteration rules
		rules.forEach( rule => {

			( !rule.from || rule.from.test(msg.from) ) &&
			( !rule.to || rule.to.test(msg.to) ) &&
			messages[k].push(rule.action);

		} );
	}

	return messages;
}