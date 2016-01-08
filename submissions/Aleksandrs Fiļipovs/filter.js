function filter(messages, rules) {
	var ropts = ['from','to'];
	var ret = {};
	var regs = {'from':[],'to':[]};
	var once = true;
	
	//check mails
	for( var i in messages ) {
		var obj = messages[i];
		
		ret[i] = [];
		
		//check each rule for match
		for( var j = 0; j < rules.length; j ++ ) {
			var rr = rules[j];
			var ok = true;
			for( var k = 0; k < ropts.length; k ++ ) {
				var opt = ropts[k];
				if( !rr[opt] ) continue;				//OK
				if( rr[opt] == '*' ) continue;			//OK
				if( rr[opt] == obj[opt] ) continue;	//OK
				
				//once mask convertion to regular expression
				if( once ) regs[opt][j] = mask2reg( rr[opt] );
				
				//match for regexp, if it is
				if( regs[opt][j] && regs[opt][j].test( obj[opt] ) ) continue;	//OK
				
				//if we are here it means this rule not match by "from" or "to"
				ok = false;
				break;
			}
			if( !ok ) continue;	//rule not match
			
			//rule match
			ret[i].push( rr.action );
		}
		once = false;
	}
	return ret;
	
	//converts mask value to regular expression
	function mask2reg(mask) {
		if( !/[\*\?]/.test( mask ) ) return false;	//not a mask
		
		var tmp = mask.replace( /([\.\\\+\*\?\[\^\]\$\(\)\{\}\|])/g, "\\$1");	//escapes reg spec. symbols
		tmp = tmp.replace( /\\\*/g, '.+' ).replace( /\\\?/g, '.' );				//'*' -> '.+', '?' -> '.'
		tmp = ('^'+tmp+'$').replace( /^\^\.\+/, '' ).replace( /\.\+\$$/, '' );	//'^.+@aa\.com$' -> '@aa\.com$'
		return new RegExp( tmp );
	}
}