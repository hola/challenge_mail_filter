'use strict';

function Fabric( description ){
	var rules = (function(){
		var mask = (function(){
			var regexps = {
				star: /[\*]+/g,
				q: /\?/g,
				special: /[\(\)\[\]\\\.\^\$\|\+]/g
			};

			var mask = function( pattern, canBeBoolean ){
				var hasStars = true,
					hasQstns = true,
					regexp,
					mask = pattern,
					maskTemp = '';

				maskTemp = mask.replace( regexps.special, '\\$&');
				
				mask = maskTemp.replace( regexps.star, '.*');
				hasStars = ( maskTemp !== mask );
				
				maskTemp = mask.replace( regexps.q, '.');
				hasQstns = ( maskTemp !== mask );

				mask = '^' + maskTemp + '$';

				if ( mask === '^.*$' && canBeBoolean) {
					regexp = true;
				} else if ( hasStars || hasQstns ) {
					regexp = new RegExp( mask );
				} else {
					regexp = {
						test: function( str ){
							return ( str.length === pattern.length && str === pattern );
						}
					}
				}

				return regexp;
			}

			return mask;
		})(),
			rules = {
				all: [],
				from: [],
				to: [],
				both: []
			},
			rule = null,
			key = 0,
			s1 = 0,
			s2 = 0;

		for ( var i = 0, length = description.length; i < length; i++ ) {
			rule = {
				from: (description[i].from && mask(description[i].from.toLowerCase(), true)) || true,
				to: (description[i].to && mask(description[i].to.toLowerCase(), true)) || true,
				action: description[i].action,
				index: i
			};

			if ( rule.from !== true && description[i].from.length ) {
				s1 = (description[i].from[0].toLowerCase()).charCodeAt() - 31;
			} else {
				s1 = 0;
			}
			if ( rule.to !== true && description[i].to.length ) {
				s2 = (description[i].to[0].toLowerCase()).charCodeAt() - 31;
			} else {
				s2 = 0;
			}

			if ( rule.from === true && rule.to === true ) {
				rules.all.push( rule );
			} else if ( rule.to === true ) {
				// only from
				if ( typeof rules.from[ s1 ] === 'undefined' ) {
					rules.from[ s1 ] = [ rule ];
				} else {
					rules.from[ s1 ].push( rule );
				}
			} else if ( rule.from === true ) {
				// only to
				if ( typeof rules.to[ s2 ] === 'undefined' ) {
					rules.to[ s2 ] = [ rule ];
				} else {
					rules.to[ s2 ].push( rule );
				}
			}  else {
				// both
				key = (s1 << 7) + s2;
				if ( typeof rules.both[ key ] === 'undefined' ) {
					rules.both[ key ] = [ rule ];
				} else {
					rules.both[ key ].push( rule );
				}
			}
		}

		return rules;
	})();
	
	function checkFrom( temp, pack, item ) {
		for ( var i = 0, length = pack.length; i < length; i++ ) {
			if ( pack[i].from.test(item.from) ) {
				temp[ pack[i].index ] = pack[i].action;
			}
		}
	}

	function checkTo( temp, pack, item ) {
		for ( var i = 0, length = pack.length; i < length; i++ ) {
			if ( pack[i].to.test(item.to) ) {
				temp[ pack[i].index ] = pack[i].action;
			}
		}
	}

	function checkBoth( temp, pack, item ) {
		for ( var i = 0, length = pack.length; i < length; i++ ) {
			if ( pack[i].from.test(item.from) && pack[i].to.test(item.to) ) {
				temp[ pack[i].index ] = pack[i].action;
			}
		}
	}

	var codes = {
		s: '*'.charCodeAt() - 31,
		q: '?'.charCodeAt() - 31
	};

	codes.S = ( codes.s << 7 );
	codes.Q = ( codes.q << 7 );

	codes.ss = codes.S + codes.s;
	codes.sq = codes.S + codes.q;
	codes.qs = codes.Q + codes.s;
	codes.qq = codes.Q + codes.q;

	var memory = {'- ': true};
	delete memory['- '];

	function check( item ){
		var result = [];

		item.from && ( item.from = item.from.toLowerCase());
		item.to && ( item.to = item.to.toLowerCase());

		var key = item.from + '\n' + item.to;

		if ( memory[ key ] ) {
			result = memory[ key ];
		} else {
			var result = [],
				temp = {},
				rule,
				pack = null,
				key = '',
				s1 = 0,
				s2 = 0,
				s11 = 0;

			// check all
			var rulesAll = rules.all;
			for ( var i = 0, length = rulesAll.length; i < length; i++ ) {
				rule = rulesAll[i];
				temp[ rule.index ] = rule.action;
			}

			// check from
			rules.from[ codes.s ] && checkFrom( temp, rules.from[ codes.s ], item );
			
			if ( item.from ) {
				s1 = (item.from[0].toLowerCase()).charCodeAt() - 31;
				s11 = ( s1 << 7 );
				
				rules.from[ codes.q ] && checkFrom( temp, rules.from[ codes.q ], item );
				rules.both[ codes.qs ] && checkBoth( temp, rules.both[ codes.qs ], item );

				rules.from[ s1 ] && checkFrom( temp, rules.from[ s1 ], item );
				rules.both[ s11 + codes.s ] && checkBoth( temp, rules.both[ s11 + codes.s ], item );
			}

			// check to
			rules.to[ codes.s ] && checkTo( temp, rules.to[ codes.s ], item );
			
			if ( item.to ) {
				s2 = (item.to[0].toLowerCase()).charCodeAt() - 31;
				
				rules.to[ codes.q ] && checkTo( temp, rules.to[ codes.q ], item );
				rules.both[ codes.sq ] && checkBoth( temp, rules.both[ codes.sq ], item );

				rules.to[ s2 ] && checkTo( temp, rules.to[ s2 ], item );
				rules.both[ codes.S + s2 ] && checkBoth( temp, rules.both[ codes.S + s2 ], item );
			}

			// check both
			rules.both[ codes.ss ] && checkBoth( temp, rules.both[ codes.ss ], item );
			
			if ( s1 && s2 ) {
				rules.both[ codes.qq ] && checkBoth( temp, rules.both[ codes.qq ], item );

				key = s11 + codes.q;
				rules.both[ key ] && checkBoth( temp, rules.both[ key ], item );

				key = codes.Q + s2;
				rules.both[ key ] && checkBoth( temp, rules.both[ key ], item );

				key = s11 + s2;
				rules.both[ key ] && checkBoth( temp, rules.both[ key ], item );
			}

			// sort rules
			var keys = Object.keys(temp);
			for ( var i = 0, length = keys.length; i < length; i++ ) {
				result.push( temp[keys[i]] );
			}

			// save to cache
			memory[ key ] = result;
		}

		return result;
	};

	function checker( messages ){
		var result = {},
			keys = Object.keys( messages );

		for ( var i = 0, ilength = keys.length, key = ''; i < ilength; i++ ) {
			key = keys[i];
			result[ key ] = check( messages[ key ] );
		}

		return result;
	};

	return checker;
};

var filter = function( messages, rules ){
	var checker = Fabric( rules );

	return checker( messages );
};

module.exports = filter;