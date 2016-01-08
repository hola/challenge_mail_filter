/**
 * @file MailFilter.js
 *
 * @breif JS challenge Winter 2015: Mail Filtering Engine
 *
 * @author 	Ulasiankou Dz. 
 * @email 	-------------
 * @version V1.0.0
 * @date    23-December-2015
 * @brief   Main program body
 *
 ***************************************************
*/

/**
 * Function tests by mask
 *
 * @param mask [string]  pattern includes * and ?
 * @param name [string]  compared string
 */

function wildcmp(mask, name){	
	var 	last, 
			imask=0, 
			iname=0, 
			ch,
			ch2; //use only local vars
	//if(!mask) return true;
	/* Compare up to first '*' */
	for(;; imask+=1, iname+=1){
		ch = name[iname], 
		ch2 = mask[imask];		
		if(!ch) return !ch2; /* mask == EOS */
		if(ch2 !== '?' && ch2 !== ch) break;  
	}

	if(ch2 != '*') return false;

	for(;; imask+=1, iname+=1){	
		ch2 = mask[imask];
		while(ch2 === '*'){ /* safe "**" */
			last = imask++;
			/* Break if '*' is last char */
			if(!(ch2 = mask[imask])) return true; 
		}
		/* return compare result */
		ch = name[iname];
		if(!ch) return !ch2; /* *mask == EOS */
		if(ch2 !== '?' && ch2 !== ch)	iname -= (imask - last) - 1,	imask = last;
	} 
}// eo wildcmp();

/**
 * main function filter
 *
 * @param msgs [array]  array of messages
 * @param ruules [arroy]  array of rules
*/
function filter(msgs,rules){
	var a = {},
		from,
		to,
		tag,
		current;
			
	for(var i in msgs) a[i] = [];
	
	for(var i=0; i<rules.length; i++){
		from 	= rules[i].from,
		to 		= rules[i].to,
		tag 	= rules[i].action;
		
		for(var j in msgs){	
			current = msgs[j];		
			if(!!from)
				if (!wildcmp(from,current.from)) 	continue;			
			if(!!to)	
				if (!wildcmp(to,current.to)) 		continue;				
			a[j].push(tag);					
		}		
	}
	return a;
}
