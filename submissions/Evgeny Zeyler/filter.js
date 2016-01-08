// @XMypuK
// ver. 2

function m1(value, pattern) {
	"use strict";

	var vl = value.length, pl = pattern.length;
	if ( vl != pl )
		return false;

	for ( var i = 0; i < pl; i++ ) {
		var pc = pattern[i];
		if ( pc != value.charCodeAt(i) && pc != 0x3F )
			return false;
	}

	return true;
}

function m2(value, pattern) {
	"use strict";

	var i = 0, vl = value.length, pl = pattern.length;
	for ( ; i < vl && i < pl; i++ ) {
		var pc = pattern[i];
		if ( pc == 0x2A ) break;
		var vc = value.charCodeAt(i);
		if ( pc != vc && pc != 0x3F ) return false;
	}

	if ( i == pl ) {
		return (i == vl);
	}

	if ( i == vl ) {
		for ( var pi = i; pi < pl; pi++ ) {
			if ( pattern[pi] != 0x2A ) {
				return false;
			}
		}
		return true;
	}

	var viQueue = [i];
	var piQueue = [i];
	var ql = 1;

	for ( var si = 0; si < ql; si++ ) {
		var vi = viQueue[si];
		var pi = piQueue[si];

		for ( ; pi < pl && pattern[pi] == 0x2A ; pi++ ) ;
		if ( pi == pl ) {
			return true;
		}

		for ( ; vi < vl; vi++ ) {

			var vsi = vi;
			var psi = pi;
			var matches = true;

			while ( vsi < vl && psi < pl ) {
				var pc = pattern[psi];
				if ( pc == 0x2A ) break;
				var vc = value.charCodeAt(vsi);
				if ( pc != vc && pc != 0x3F ) { matches = false; break; }
				vsi++;
				psi++;
			}

			if ( matches && psi == pl ) {
				if ( vsi == vl ) { return true; }
				else { matches = false; }
			}

			if ( matches && vsi == vl ) {
				for ( ; psi < pl; psi++ ) {
					if ( pattern[psi] != 0x2A ) {
						matches = false;
						break;
					}
				}

				if ( matches ) return true;
			}

			if ( matches ) {
				viQueue.push(vsi);
				piQueue.push(psi);
				ql++;
			}
		}
	}

	return false;
}

function m3(value, pattern, bl, el) {
	"use strict";

	var vl = value.length;
	if ( vl < ( bl + el ))
		return false;

	for ( var i = 0; i < bl; i++ ) {
		var pc = pattern[i];
		if ( pc != value.charCodeAt(i) && pc != 0x3F )
			return false;
	}

	for ( var i = vl - el, pi = pattern.length - el; i < vl; i++, pi++ ) {
		var pc = pattern[pi];
		if ( pc != value.charCodeAt(i) && pc != 0x3F )
			return false;
	}

	return true;	
}

function m4(value, pattern, bl) {
	"use strict";

	var vl = value.length;
	if ( vl < bl )
		return false;

	for ( var i = 0; i < bl; i++ ) {
		var pc = pattern[i];
		if ( pc != value.charCodeAt(i) && pc != 0x3F )
			return false;
	}

	return true;
}

function m5(value, pattern, el) {
	"use strict";

	var vl = value.length;
	if ( vl < el )
		return false;

	for ( var i = vl - el, pi = pattern.length - el; i < vl; i++, pi++ ) {
		var pc = pattern[pi];
		if ( pc != value.charCodeAt(i) && pc != 0x3F )
			return false;
	}

	return true;
}

function esc(str) {
	"use strict";

	return str.replace('\\', '\\\\').replace('\'', '\\\'')
}

function createPatternMatchFunc( pattern, vvn ) {
	"use strict";

	if ( !pattern ) {
		return '';
	}

	var chars = [];
	var mwcCount = 0;
	var firstSeriaCount = 0;
	var lastSeriaCount = 0;

	var pl = pattern.length;
	for ( var i = 0; i < pl; i++ ) {
		var cc = pattern.charCodeAt(i);
		if ( cc == 0x2A ) {

			if (( i == 0 ) || ( pattern.charCodeAt(i - 1) != 0x2A )) {
				mwcCount++;
				lastSeriaCount = 0;

				chars.push(cc);
			}

		}
		else {

			if ( mwcCount == 0 ) firstSeriaCount++;
			lastSeriaCount++;

			chars.push(cc);
		}
	}

	var bld = [];

	if ( mwcCount == 0 ) {
		bld.push('m1(', vvn, ',[', chars.join(','), '])&&');
	}
	else if ( mwcCount == 1 ) {
		if ( firstSeriaCount && lastSeriaCount ) {
			bld.push('m3(', vvn, ',[', chars.join(','), '],', firstSeriaCount, ',', lastSeriaCount, ')&&');
		}
		else if ( firstSeriaCount ) {
			bld.push('m4(', vvn, ',[', chars.join(','), '],', firstSeriaCount, ')&&');
		}
		else if ( lastSeriaCount ) {
			bld.push('m5(', vvn, ',[', chars.join(','), '],', lastSeriaCount, ')&&');
		}
	}
	else {
		bld.push('m2(', vvn, ',[', chars.join(','), '])&&');
	}

	return bld.join('');
}

function filter( messages, rules ) {
	"use strict";

	var vBld = [];
	var bBld = [];

	var vObj = {};
	var vIndex = 1;

	vBld.push('fl=f.length');
	vBld.push('tl=t.length');
	vBld.push('c=(f.charCodeAt(fl-1)<<24)|(f.charCodeAt(0)<<16)|(t.charCodeAt(tl-1)<<8)|t.charCodeAt(0)');
	vBld.push('a=[]');

	var rl = rules.length;
	for ( var i = 0; i < rl; i++ ) {
		var rule = rules[i], f = rule.from, t = rule.to;
		var fc = createPatternMatchFunc(f, 'f');
		var tc = createPatternMatchFunc(t, 't');

		var mask = 0x00000000;
		var value = 0x00000000;

		if ( fc ) {
			var beg = f.charCodeAt(0);
			if ( beg && beg != 0x2A && beg != 0x3F ) { mask |= 0x00FF0000; value |= (beg << 16); }

			var end = f.charCodeAt(f.length - 1);
			if ( end && end != 0x2A && end != 0x3F ) { mask |= 0xFF000000; value |= (end << 24); }
		}

		if ( tc ) {
			var beg = t.charCodeAt(0);
			if ( beg && beg != 0x2A && beg != 0x3F ) { mask |= 0x000000FF; value |= (beg << 0); }

			var end = t.charCodeAt(t.length - 1);
			if ( end && end != 0x2A && end != 0x3F ) { mask |= 0x0000FF00; value |= (end << 8); }
		}

		if ( mask != 0x00000000 ) {
			var vName = vObj[mask];
			if ( !vName ) {
				vName = (vObj[mask] = ('v' + vIndex++));
				vBld.push(vName + '=c&' + mask);
			}

			bBld.push(vName, '==', value, '&&');
		}

		if ( fc ) { bBld.push(fc); }
		if ( tc ) { bBld.push(tc); }

		bBld.push('a.push(\'', esc(rule.action), '\');');
	}

	var getActions = new Function('f, t', 'var ' + vBld.join(',') + ';' + bBld.join('') + 'return a;');

	rules = null;
	vBld = null;
	bBld = null;

	for ( var key in messages ) {
		var message = messages[key];
		messages[key] = getActions(message.from, message.to);
	}

	return messages;
}

global.m1 = m1;
global.m2 = m2;
global.m3 = m3;
global.m4 = m4;
global.m5 = m5;
exports.filter = filter;
