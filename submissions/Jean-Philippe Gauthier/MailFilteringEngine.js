// Hola.org, JS challenge Winter 2015: Mail Filtering Engine
// Written Jean-Philippe Gauthier
module.exports = {
  filter: function( messages,rules ) {
	var map = new Object();
	var rlen = rules.length;
	var i;

	for(var m in messages) {
		map[m] = [];
		
		i = 0;
		while( i < rlen ) {
			if( 
				(!rules[i].from || rules[i].from == '*' || StringMatchPattern( messages[m].from,rules[i].from )) &&
				(!rules[i].to || rules[i].to == '*' || StringMatchPattern( messages[m].to,rules[i].to )) 
			)
			{
				map[m].push(rules[i].action);
			}
			i++;
		}
 	}
	
	return map;
  }
};

function StringMatchPattern( str,pat ) {
	var s = 0;
	var p = 0;

	while( pat[p] ) {
		if( pat[p] == '*' ) {
			if( !pat[++p] ) {	
				return true; 
			}
			
			while( str[s] && str[s] != pat[p] ) {
				s++;
			}
		} else if( str[s] != pat[p] && pat[p] != '?' ) {
			return false;
		}
		
		if( !str[s] ) {
			break;
		}
		
		s++;
		p++;
	}
	return !str[s] && !pat[p];
}