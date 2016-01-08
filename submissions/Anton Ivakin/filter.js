var domainRegex = /\@[^\?\*\@]*$/
var replaceRegex = /\.|\*|\?/g

function replaceFunc(x){
	var ch = x.charCodeAt(0);
	if (ch == 63) return '.';
	if (ch == 42) return '.*';
	return '\\\.'
}

function filter(messages, rules){
	var defFrDomain = [];
	var defToDomain = [];
	
	var withoutFrom = [];
	var withoutTo = [];
	
	var frDomains = {};
	var toDomains = {};	
	//prepare rules
	for(var i=0;i<rules.length;i++){
		var from = rules[i].from;
		var to = rules[i].to;
		if(from){
			var index = from.search(domainRegex);
			if(index == -1){
				defFrDomain[defFrDomain.length] = [i, new RegExp(('^' + from + '$').replace( replaceRegex, replaceFunc), "")];
			}
			else{
				var domainStr = from.substr(index);
				var domain = frDomains[domainStr];
				var newObj = [i,new RegExp(('^' + from.substr(0,index) + '$').replace( replaceRegex, replaceFunc), "")];
				if(domain){
					domain[domain.length] = newObj;
				}else{
					frDomains[domainStr] = [newObj];
				}
			}
		}
		else {
			withoutFrom[withoutFrom.length] = i
		}
		if(to){
			var index = to.search(domainRegex);
			if(index == -1){
				defToDomain[defToDomain.length] = [i, new RegExp(('^' + to + '$').replace( replaceRegex, replaceFunc), "")];
			}
			else{
				var domainStr = to.substr(index);
				var domain = toDomains[domainStr];
				var newObj = [i,new RegExp(('^' + to.substr(0,index) + '$').replace( replaceRegex, replaceFunc), "")];
				if(domain){
					domain[domain.length] = newObj;
				}else{
					toDomains[domainStr] = [newObj];
				}
			}
		}
		else {
			withoutTo[withoutTo.length] = i
		}
	};
	//Filter messages
	var result = {};
	var froms = {};
	var tos = {}
	var f,t;
	for(var key in messages){
		var message = messages[key];
		if(!froms[message.from]){
			var f = new Array(rules.length);
			var index = message.from.search(domainRegex);
			if(index != -1){
				domainStr = message.from.substr(index);
				domain = frDomains[domainStr];
				if(domain){
					for(var i=0; i<domain.length; i++){
						var obj = domain[i];
						f[obj[0]] = obj[1].test(message.from.substr(0,index));
					}
				}
			}
			for(i = 0; i<defFrDomain.length; i++){
				var obj = defFrDomain[i];
				f[obj[0]] = obj[1].test(message.from);
			}
			for(i = 0; i<withoutFrom.length; i++){
				f[withoutFrom[i]] = true;
			}
			froms[message.from] = f;
		}
		else{
			f = froms[message.from];
		}
		if(!tos[message.to]){
			var t = new Array(rules.length);
			var index = message.to.search(domainRegex);
			if(index != -1){
				domainStr = message.to.substr(index);
				domain = toDomains[domainStr];
				if(domain){
					for(var i=0; i<domain.length; i++){
						var obj = domain[i];
						t[obj[0]] = obj[1].test(message.to.substr(0,index));
					}
				}
			}
			for(i = 0; i<defToDomain.length; i++){
				var obj = defToDomain[i];
				t[obj[0]] = obj[1].test(message.to);
			}
			for(i = 0; i<withoutTo.length; i++){
				t[withoutTo[i]] = true;
			}
			tos[message.to] = t;
		}
		else{
			t = tos[message.to];
		}
		var res = [];
		for(var i=0; i<rules.length; i++){
			if(f[i] && t[i]){
				res[res.length] = rules[i].action;
			}
		}
		result[key] = res;
	}
	return result;
}

exports.filter = filter;