/*
 * Vasiliy Kostin for Hola's Post-filter challenge
 * v0.7
 * + grouping rules by types added
 *
 *
 */
'use strict';

var rulesDictionary,

//16 rules lists
	r_aa, //any to any
	r_ae, //any to email
	r_ad, //any to domain
	r_ar, //any to regex

	r_ea, //email to any
	r_ee, //email to email
	r_ed, //email to domain
	r_er, //email to regex

	r_da, //domain to any
	r_de, //domain to email
	r_dd, //domain to domain
	r_dr, //domain to regex

	r_ra, //regex to any
	r_re, //regex to email
	r_rd, //regex to domain
	r_rr, //regex to regex


	emailTo,
	emailFrom,
	actions,

	typesCount;


function filter(messages, rules) {

	rules = rules.map(prepareRule); //prevent polymorphic types

	typesCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	//===================
	//== prepare rules ==
	//===================
	//
	// Sort rules by 4 types:
	// any(a) - *
	// email(e) - full email without symbols '*' and '?'
	// domain(d) - rules started by '*@' sequence
	// regex(r) - any other rules (expected that they will be rare)
	//

	rulesDictionary = new Array(rules.length);
	
	r_aa = []; //any to any
	r_ae = []; //any to email
	r_ad = []; //any to domain
	r_ar = new Array(128); //any to regex


	r_ea = []; //email to any
	r_ee = []; //email to email
	r_ed = []; //email to domain
	r_er = []; //email to regex

	r_da = []; //domain to any
	r_de = []; //domain to email
	r_dd = []; //domain to domain
	r_dr = []; //domain to regex

	r_ra = new Array(128); //regex to any
	r_re = []; //regex to email
	r_rd = []; //regex to domain
	r_rr = new Array(128); //regex to regex


	rules.forEach(compileRule);

	console.log(typesCount);

	var a = [],
		suba = [],

		domaintToI = 0,
		domainTo = '',

		domainFromI = 0,
		domainFrom = '',

		toi = 0,
		fromi = 0,

	//===================
	//== filter emails ==
	//===================
		mk = Object.keys(messages),
		k = '',
		m  = {};

	for (k in mk) {
		
		k = mk[k];
		m = messages[k];

		emailTo = m.to;
		emailFrom = m.from;

		domaintToI = emailTo.lastIndexOf("@");
		domainTo = emailTo.substring(++domaintToI);

		domainFromI = emailFrom.lastIndexOf("@");
		domainFrom = emailFrom.substring(++domainFromI);

		toi = emailTo.charCodeAt(0);
		fromi = emailFrom.charCodeAt(0);

		//a to a
		actions = r_aa.slice(0);

		//a to e
		a = r_ae[emailTo];
		if (a) {
			actions = actions.concat(a);
		}

		if (domaintToI) {
			//a to d
			a = r_ad[domainTo];
			if (a) {
				actions = actions.concat(a);
			}

			//e to d
			a = r_ed[emailFrom];
			if (a) {
				suba = a[domainTo];
				if (suba) {
					actions = actions.concat(suba);
				}
			}

			//r to d
			a = r_rd[domainTo];
			if (a) {
				suba = a[fromi];
				if (suba) {
					suba.forEach(foreach_testEmailFrom);
				}

				suba = a[31];
				if (suba) {
					suba.forEach(foreach_testEmailFrom);
				}
			}

		}

		//a to r
		a = r_ar[toi];
		if (a) {
			a.forEach(foreach_testEmailTo);
		}

		a = r_ar[31];
		if (a) {
			a.forEach(foreach_testEmailTo);
		}

		//e to a
		a = r_ea[emailFrom];
		if (a) {
			actions = actions.concat(a);
		}

		//e to e
		a = r_ee[emailFrom];
		if (a) {
			suba = a[emailTo];
			if (suba) {
				actions = actions.concat(suba);
			}
		}

		//e to r
		a = r_er[emailFrom];
		if (a) {
			suba = a[toi];
			if (suba) {
				suba.forEach(foreach_testEmailTo);
			}

			suba = a[31];
			if (suba) {
				suba.forEach(foreach_testEmailTo);
			}
		}

		if (domainFromI) {

			//d to a
			a = r_da[domainFrom];
			if (a) {
				actions = actions.concat(a);
			}

			//d to e
			a = r_de[domainFrom];
			if (a) {
				suba = a[emailTo];
				if (suba) {
					actions = actions.concat(suba);
				}
			}

			if (domaintToI) {
				//d to d
				a = r_dd[domainFrom];
				if (a) {
					suba = a[domainTo];
					if (suba) {
						actions = actions.concat(suba);
					}
				}
			}

			//d to r
			a = r_dr[domainFrom];
			if (a) {
				suba = a[toi];
				if (suba) {
					suba.forEach(foreach_testEmailTo);
				}

				suba = a[31];
				if (suba) {
					suba.forEach(foreach_testEmailTo);
				}
			}
		}

		//r to a
		a = r_ra[fromi];
		if (a) {
			a.forEach(foreach_testEmailFrom);
		}

		a = r_ra[31];
		if (a) {
			a.forEach(foreach_testEmailFrom);
		}

		//r to e
		a = r_re[emailTo];
		if (a) {
			suba = a[fromi];
			if (suba) {
				suba.forEach(foreach_testEmailFrom);
			}

			suba = a[31];
			if (suba) {
				suba.forEach(foreach_testEmailFrom);
			}
		}

		//r to r
		a = r_rr[fromi];
		if (a) {
			suba = a[toi];
			if (suba) {
				suba.forEach(foreach_testEmailBoth);
			}

			suba = a[31];
			if (suba) {
				suba.forEach(foreach_testEmailBoth);
			}
		}

		a = r_rr[31];
		if (a) {
			suba = a[toi];
			if (suba) {
				suba.forEach(foreach_testEmailBoth);
			}

			suba = a[31];
			if (suba) {
				suba.forEach(foreach_testEmailBoth);
			}
		}
		
		
		//repair actions order
		messages[k] = actions.sort(rulesSort).map(repairRuleName);

	}

	return messages;
}

if (typeof (module) !== 'undefined') {
	module.exports = filter; //in browser debugging compatibility
}




function prepareRule(r) {
	return {
		from : r.from,
		to : r.to,
		action : r.action
	};
}


function addArrayToArrayI(arr, index) {
	var a = arr[index];
	if (!a) {
		a = [];
		arr[index] = a;
	}
	return a;
}

function addArrayToArray(arr, name) {
	var a = arr[name];
	if (!a) {
		a = [];
		arr[name] = a;
	}
	return a;
}

function addArrayToArrayI(arr, name) {
	var a = arr[name];
	if (!a) {
		a = new Array(128);
		arr[name] = a;
	}
	return a;
}

function addActionToArray(arr, name, action) {
	var a = arr[name];
	if (!a) {
		arr[name] = [action];
	} else {
		a.push(action);
	}
}

function addObjToArray(arr, index, obj) {
	var a = arr[index];
	if (!a) {
		arr[index] = [obj];
	} else {
		a.push(obj);
	}
}


function repairRuleName(a) {
	return rulesDictionary[a];
}

function RuleSet(r) {

	this.type = 0; //empy expression
	this.str = '';
	this.reg = /.*/;
	this.index = 0;

	if (!r) {
		return;
	}

	if (r.lastIndexOf('*') === -1) {
		if (r.lastIndexOf('?') === -1) {
			this.str = r;
			this.type = 1; //'email is exact' expression
			return;
		}
	} else {
		if (r.lastIndexOf('?') === -1) {
			var da = r.split('@');
			if ((da.length === 2) && (da[0] === '*')) {
				this.str = da[1];
				this.type = 2; //'domain is exact' expression
				return;
			}
		}
	}

	r = r.replace(/\*(\*)*/g, '*'); //more that one equal to one

	if (r === '*') {
		return;
	}

	this.index = r.charCodeAt(0); //first symbol for target email
	if (this.index === 42 || this.index === 63) {
		this.index = 31; //unknown first symbol for target email
	}

	r = r.replace(/\\/g, '\\\\'); //isolate regex symbols
	r = r.replace(/\./g, '\\.');
	r = r.replace(/\$/g, '\\$');
	r = r.replace(/\[/g, '\\[');
	r = r.replace(/\]/g, '\\]');
	r = r.replace(/\(/g, '\\(');
	r = r.replace(/\)/g, '\\)');
	r = r.replace(/\+/g, '\\+');
	r = r.replace(/\^/g, '\\^');
	r = r.replace(/\|/g, '\\|');
	r = r.replace(/\!/g, '\\!');
	r = r.replace(/\//g, '\\/');

	r = r.replace(/\*/g, '.*'); //convert mask to regex notation
	r = r.replace(/\?/g, '.');

	r = '^(' + r + ')$'; //whole line only.

	this.reg = new RegExp(r);
	this.type = 3; //'regex' (extended) expression
}

function compileRule(r, actionNum) {

	rulesDictionary[actionNum] = r.action;

	var rto = new RuleSet(r.to),
		rfrom = new RuleSet(r.from),
		i,
		a,
		suba,

		toReg = {
			r : rto.reg,
			a : actionNum
		},
		fromReg = {
			r : rfrom.reg,
			a : actionNum
		};

	typesCount[rto.type]++;
	typesCount[rfrom.type]++;

	switch (rto.type + rfrom.type * 4) {
	case 0: //any to any
		r_aa.push(actionNum);
		break;
	case 1: //any to email
		addActionToArray(r_ae, rto.str, actionNum);
		break;

	case 2: //any to domain
		addActionToArray(r_ad, rto.str, actionNum);
		break;

	case 3: //any to reg
		addObjToArray(r_ar, rto.index, toReg);
		break;

	case 4: //email to any
		addActionToArray(r_ea, rfrom.str, actionNum);
		break;

	case 5: //email to email

		a = addArrayToArray(r_ee, rfrom.str);
		addActionToArray(a, rto.str, actionNum);
		break;

	case 6: //email to domain
		a = addArrayToArray(r_ed, rfrom.str);
		addActionToArray(a, rto.str, actionNum);
		break;

	case 7: //email to reg
		a = addArrayToArrayI(r_er, rfrom.str);
		addObjToArray(a, rto.index, toReg);
		break;

	case 8: //domain to any
		addActionToArray(r_da, rfrom.str, actionNum);
		break;

	case 9: //domain to email
		a = addArrayToArray(r_de, rfrom.str);
		addActionToArray(a, rto.str, actionNum);
		break;

	case 10: //domain to domain
		a = addArrayToArray(r_dd, rfrom.str);
		addActionToArray(a, rto.str, actionNum);
		break;

	case 11: //domain to reg

		a = addArrayToArrayI(r_dr, rfrom.str);
		addObjToArray(a, rto.index, toReg);
		break;

	case 12: //reg to any
		addObjToArray(r_ra, rfrom.index, fromReg);
		break;

	case 13: //reg to email
		a = addArrayToArrayI(r_re, rto.str);
		addObjToArray(a, rfrom.index, fromReg);
		break;

	case 14: //reg to domain
		a = addArrayToArrayI(r_rd, rto.str);
		addObjToArray(a, rfrom.index, fromReg);
		break;

	case 15: //reg to reg
		a = addArrayToArrayI(r_rr, rfrom.index);
		addObjToArray(a, rto.index, {
			rf : rfrom.reg,
			rt : rto.reg,
			a : actionNum
		});
		break;
	}
}

function rulesSort(a, b) {
	return a - b;
}

function foreach_testEmailTo(r) {
	if (r.r.test(emailTo)) {
		actions.push(r.a);
	}
}
function foreach_testEmailFrom(r) {
	if (r.r.test(emailFrom)) {
		actions.push(r.a);
	}
}

function foreach_testEmailBoth(r) {
	if (r.rf.test(emailFrom)) {
		if (r.rt.test(emailTo)) {
			actions.push(r.a);
		}
	}
}
