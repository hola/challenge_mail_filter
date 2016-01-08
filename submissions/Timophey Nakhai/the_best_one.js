function filter(messages,rules)
{
	var o_r = [];
	var rules_len = rules.length;
	var i;
	for (i = 0; i < rules_len; ++i) {
		if (!rules[i].hasOwnProperty('from'))
			rules[i]['from'] = '';

		if (!rules[i].hasOwnProperty('to'))
			rules[i]['to'] = '';

		rules[i]['from'] = rules[i]['from'].replace('*', "[\\x20-\\x7f]*").replace('?', "[\\x20-\\x7f]");
		rules[i]['to'] = rules[i]['to'].replace('*', "[\\x20-\\x7f]*").replace('?', "[\\x20-\\x7f]");

		o_r.push([rules[i]['from'],rules[i]['to'],rules[i]['action']]);
	}
	var t2 = mtime.now();

	var result = {};
	var key;
	var from;
	var to;
	var act;
	var j;
	var actions;
	var o_r_len = o_r.length;

	for (key in messages) {
		actions = [];
		for (j = 0; j < o_r_len; ++j) {
			
			from = o_r[j][0];
			to = o_r[j][1];
			act = o_r[j][2];

			if (from == '') {
				if(to == '' || 
					to == messages[key]['to'] ||
					(to.indexOf("[") !=-1 && (new RegExp(to, "")).test(messages[key]['to']))  ) {
					actions.push(act);
				}
			}
			else if ((to == '' ||
					to == messages[key]['to'] ||
					(to.indexOf("[") !=-1 && (new RegExp(to, "")).test(messages[key]['to']))) &&
					(from == messages[key]['from'] ||
					(from.indexOf("[") !=-1 && (new RegExp(from, "")).test(messages[key]['from'])))) {
						
						actions.push(act);
			}
		}
		result[key] = actions;
	}
	return result;
}