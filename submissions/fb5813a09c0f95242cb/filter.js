function mkRegex (glob) {
	glob = glob.replace(/(\?*\*+\?*)+/g,'*');//remove redundant wildcards
	//if(glob == '*')return null;//already checked in mkSimpleMatcher
	var specialChars = "\\^$*+?.()|{}[]";
	var regexChars = ["^"];
	for (var i = 0; i < glob.length; ++i) {
		var c = glob.charAt(i);
		switch (c) {
			case '?':
				regexChars.push(".");
				break;
			case '*':
				regexChars.push(".*");
				break;
			default:
				if(specialChars.indexOf(c) >= 0)regexChars.push("\\");
				regexChars.push(c);
		}
	}
	regexChars.push("$");
	return new RegExp(regexChars.join(""));
}

function escapeDblQuotesAndBackslashes(s){
	return s.replace(/(["\\])/g,"\\$1");
}

function mkSimpleMatcher(glob){//* or *xxx or xxx* or *xxx* or xxx*xxx or xxx
	glob = glob.replace(/(\?*\*+\?*)+/g,'*');//remove redundant wildcards
	if(glob == '*')return '*';
	if(glob.indexOf('?') >= 0)return '';
	
	if(glob.substr(0,1) == '*'){
		var occ = glob.indexOf('*',1);
		if (occ == -1){//no more wildcards *xxx case
			return 'return (s.length >= '+(glob.length-1)+')&&(s.substr(-'+(glob.length-1)+') == "'+escapeDblQuotesAndBackslashes(glob.substr(1))+'");';
		}else if(occ == (glob.length-1)){// *xxx*
			return 'return (s.indexOf("'+escapeDblQuotesAndBackslashes(glob.substr(1,glob.length-2))+'")>=0);';
		}
	}else{
		var occ = glob.indexOf('*',1);
		if(occ == (glob.length-1)){// xxx*
			return 'return (s.length >= '+(glob.length-1)+')&&(s.substr(0,'+(glob.length-1)+') == "'+escapeDblQuotesAndBackslashes(glob.substr(0,glob.length-1))+'");';
		}else if (occ == -1){// xxx
			return 'return s == "'+escapeDblQuotesAndBackslashes(glob)+'";';
		}else if (glob.indexOf('*',occ+1) == -1){// xxx*xxx
			return 'return (s.length >= '+(glob.length-1)+')&&(s.substr(-'+(glob.length-1-occ)+') == "'+escapeDblQuotesAndBackslashes(glob.substr(occ+1))+'")&&(s.substr(0,'+occ+') == "'+escapeDblQuotesAndBackslashes(glob.substr(0,occ))+'");';
		}
	}
	return '';
}

function isFirstSimplier(a,b){
	function countStars(s){
		var cnt = 0;
		var c = 0;
		while((c = s.indexOf('*',c)) >= 0){
			cnt++;
			c++;
		}
		return cnt;
	}
	
	if( (a.length * countStars(a)) < (b.length * countStars(b)))return true;
	
	return false;
}
function ParsedRule(rule){
	this.skipSmFrom = true;
	this.skipReFrom = true;
	this.skipSmTo = true;
	this.skipReTo = true;
	this.smFrom = function(){};
	this.smTo = function(){};
	this.reFrom = /./;
	this.reTo = /./;
	this.checkFromFirstThenTo = true;
	this.action = rule.action;
		
	if(rule.from){
		var smFrom = mkSimpleMatcher(rule.from);
		if(smFrom != ''){
			if(smFrom != '*'){
				this.smFrom = new Function('s',smFrom);
				this.skipSmFrom = false;
			}
		}else {
			this.reFrom = mkRegex(rule.from);
			this.skipReFrom = false;
		}
	}
	
	if(rule.to){
		var smTo = mkSimpleMatcher(rule.to);
		if(smTo != ''){
			if(smTo != '*'){
				this.smTo = new Function('s',smTo);
				this.skipSmTo = false;
			}
		}else {
			this.reTo = mkRegex(rule.to);
			this.skipReTo = false;
		}
	}
	
	if(!this.skipSmTo && this.skipSmFrom){//to is probably faster because of simplepattern
		this.checkFromFirstThenTo = false;
	}else if(!this.skipReTo && !this.skipReFrom){//decide which is probably faster
		this.checkFromFirstThenTo = isFirstSimplier(this.reFrom.toString(),this.reTo.toString());
	}
	return this;
}

module.exports = {filter:function(messages,rules){
	function testMsg(m){
		var actions = [];
		for(var i = 0; i < parsedRules.length; i++){
			var pR = parsedRules[i];
			if(pR.checkFromFirstThenTo){
				if(((pR.skipSmFrom || pR.smFrom(m.from))&&
				(pR.skipReFrom || pR.reFrom.test(m.from))) &&
				((pR.skipSmTo || pR.smTo(m.to))&&
				(pR.skipReTo || pR.reTo.test(m.to))))
				{
					actions.push(pR.action);
				}
			}else{
				if(((pR.skipSmTo || pR.smTo(m.to))&&
				(pR.skipReTo || pR.reTo.test(m.to))) &&
				((pR.skipSmFrom || pR.smFrom(m.from))&&
				(pR.skipReFrom || pR.reFrom.test(m.from))))
				{
					actions.push(pR.action);
				}
			}
		}
		
		return actions;
	}
	
	var result = {};
	var parsedRules = [];
	var cache = [];
	var cacheAvailable = 10000;//let's try to cache
		
	for(var i = 0; i < rules.length; i++){
		parsedRules.push(new ParsedRule(rules[i]));
	}
	
	for(var msgid in messages){
		var msg = messages[msgid];
		if(cacheAvailable>0){
			var cid = msg.from+'\t'+msg.to;
			if(cache[cid]){//hit cache
				result[msgid] = cache[cid];
				cacheAvailable++;//cache is useful, continue caching
			}else{
				cacheAvailable--;//step to give up caching
				cache[cid] = result[msgid] = testMsg(msg);
			}
		}else{
			result[msgid] = testMsg(msg);
		}
	}
	
	return result;
}
}//exports
