//version 3.9
//by ionicman

var filter = ( function() {
	var
    	//regexps to compile a rule
    	//escape all characters that can be used in regular expressions
    	reEscE = new RegExp( '[\\-\\[\\]\\/\\{\\}\\(\\)\\+\\.\\\\\^\\$\\|]', 'g' ),
    	//? replaced by "."
    	reQstE = new RegExp( '\\?', 'g' ),
    	//* replaced by ".*?" (non-greedly matching)
    	reAstE = new RegExp( '\\*', 'g' );

	return function( msgs, rules ) {
		var i, j, m, k, matches, c, cn, ret = {}, rl = rules.length - 1, d = "\x81", reEsc = reEscE, reQst = reQstE, reAst = reAstE;

   		for ( j = 0; j <= rl; j++ ) {
			k = rules[j];
   			//k.from / k.to: string with replaced all regexp symbols on \ + symbols except * and ?, than replaced ? on . and than replaced * on .*?
   			//make re like ^ + k.from (or .*? if not exists) + \x81 + k.to (or .*? if not exists) + $
   			k.re = new RegExp(
   				'^' +
   				( k.from ? k.from.replace( reEsc, "\\$&" ).replace( reQst, '.' ).replace( reAst, '.*?' ) : '.*?' )  +
   				d +
   				( k.to ? k.to.replace( reEsc, "\\$&" ).replace( reQst, '.' ).replace( reAst, '.*?' ) : '.*?' )  +
   				'$'
   			);
		}

		matches = {};

		for ( i in msgs ) {
			if ( !msgs.hasOwnProperty( i ) ) continue;

			m = msgs[i];

			var k = m.from + d + m.to;

			if ( matches[k] ) {
				ret[ i ]  = matches[k];
				continue;
			}

			c = [];
			cn = 0;
			for ( j = 0; j <= rl; j++ ) {
				if ( !rules[j].re.test( k ) ) continue;
				c[cn++] = rules[j].action;
			}
			ret [ i ] = matches[ k ] = c;
		}

		return ret;
	}
} )();

exports.filter = filter;
