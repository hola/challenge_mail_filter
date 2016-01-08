/*!
* (c) NAR 2015 (web_soft@mail.ru)
*/
exports.filter = function(messages, rules){	
	var returnResult = {};		
	var msgIDs = Object.keys(messages);//all message IDs
	var alreadyCheckedFromDomainByRule = [];
	var alreadyCheckedToByRule = [];
	
	function regQuote(str) {		
		return str.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
	};
	
	function prepareRegExpression(str){		
		if(!str) str = '*';
		str = regQuote(str);		
		str = str.split("\\*").join('[\x20-\x7F]{0,}');
		str = str.split("\\?").join('[\x20-\x7F]{1}');		
		return str;
	}
	
	function prepareMessages(obj){
		ret = {};
		for(var msgID in obj){
			if(!ret[obj[msgID].to]) ret[obj[msgID].to] = {};		
			
			var emailAddressStructure = obj[msgID].from.toString().split('@');
			if(!ret[obj[msgID].to][emailAddressStructure[1]]) ret[obj[msgID].to][emailAddressStructure[1]] = [];
			if(!ret[obj[msgID].to][emailAddressStructure[1]][obj[msgID].from]) ret[obj[msgID].to][emailAddressStructure[1]][obj[msgID].from] = [];			
			ret[obj[msgID].to][emailAddressStructure[1]][obj[msgID].from][msgID]=1;
		}		
		return ret;
	}
	
	function prepareRules(obj){
		var ret = [];
		for(var rulesID in obj){			
			if(!obj[rulesID].from) obj[rulesID].from = '*';
			if(!obj[rulesID].to) obj[rulesID].to = '*';
			if(obj[rulesID].from != '*' && obj[rulesID].to != '*'){
				ret[rulesID] = {
					from:new RegExp('^'+prepareRegExpression(obj[rulesID].from)+'$'),
					to:new RegExp('^'+prepareRegExpression(obj[rulesID].to)+'$'),
					cleanFrom:obj[rulesID].from,
					needCheck:1,					
					action:obj[rulesID].action,					
					funcTo:function(d,r){
						return (r.to.test(d.to))?true:false;						
					},
					funcFrom:function(d,r){
						return (r.from.test(d.from))?true:false;						
					}
				};
			}else if(obj[rulesID].from != '*' && obj[rulesID].to == '*'){				
				ret[rulesID] = {
					from:new RegExp('^'+prepareRegExpression(obj[rulesID].from)+'$'),
					cleanFrom:obj[rulesID].from,
					needCheck:1,										
					action:obj[rulesID].action,
					funcTo:function(d,r){
						return true;						
					},
					funcFrom:function(d,r){						
						return (r.from.test(d.from))?true:false;						
					}
				};
			}else if(obj[rulesID].to != '*' && obj[rulesID].from == '*'){
				ret[rulesID] = {
					to:new RegExp('^'+prepareRegExpression(obj[rulesID].to)+'$'),
					cleanFrom:'*',
					needCheck:1,					
					action:obj[rulesID].action,					
					funcTo:function(d,r){
						return (r.to.test(d.to))?true:false;						
					},
					funcFrom:function(d,r){
						return true;
					}
				};
			}else{				
				ret[rulesID] = {					
					needCheck:0,					
					action:obj[rulesID].action
				};				
			}
		}		
		return ret;
	}		
	
	function checkDomainPartInFormField(domain, exp){
		if(!exp) exp = '*';
		if(~exp.indexOf('@')){
			var partExp = exp.toString().split('@');
			exp = '';
			for(var pKey=1;pKey<partExp.length;pKey++){				
				exp += '@'+partExp[pKey];
			}			
			exp = new RegExp('^'+prepareRegExpression(exp)+'$');			
			if(exp.test('@'+domain)){
				return true;
			}else{
				return false;
			}
		}else if(~exp.indexOf('?') || ~exp.indexOf('*')){
			var tempStr = '';
			for(i=(exp.length-1);i>=0;i--){
				tempStr = exp[i]+tempStr;
				if(exp[i] == '?' || exp[i] == '*'){
					var reg = new RegExp('^'+prepareRegExpression(tempStr)+'$');
					if(reg.test(domain)){
						return true;
						break;
					}
				}				
			}
			return false;
		}else{
			return false;
		}
	}
	
	
	var startP = Math.floor(new Date() );
	rules = prepareRules(rules);	
	var stopP = Math.floor(new Date() );
	console.log('prepare rules time: '+((stopP-startP)/1000));		
		
	var startM = Math.floor(new Date() );
	messages = prepareMessages(messages);	
	var stopM = Math.floor(new Date() );
	console.log('prepare msg time: '+((stopM-startM)/1000));				
	
	var rulesforAllMessagesCnt = 0;
	var startCheck = Math.floor(new Date() );
	for(var rulesID in rules)
	{
		alreadyCheckedFromDomainByRule = [];
		alreadyCheckedToByRule = [];
		if(rules[rulesID].needCheck)
		{
			for(var to in messages)
			{
				var isCheckedToField = false;
				if(alreadyCheckedToByRule[to]){
					isCheckedToField = true;
				}else if(rules[rulesID].funcTo({to:to}, rules[rulesID])){
					isCheckedToField = true;
				}
				if(isCheckedToField)
				{
					alreadyCheckedToByRule[to]=1;
					for(var fromDomain in messages[to])
					{
						//check From	
						var isCheckedFromDomain = false;
						if(alreadyCheckedFromDomainByRule[fromDomain]){
							isCheckedFromDomain = true;							
						}else if(checkDomainPartInFormField(fromDomain, rules[rulesID].cleanFrom)){
							isCheckedFromDomain = true;
						}
						
						if(isCheckedFromDomain)
						{
							alreadyCheckedFromDomainByRule[fromDomain]=1;
							for(var from in messages[to][fromDomain])
							{
								//check From
								if(rules[rulesID].funcFrom({from:from}, rules[rulesID]))
								{
									returnResult[rules[rulesID].action] = (!returnResult[rules[rulesID].action])?Object.keys(messages[to][fromDomain][from]):returnResult[rules[rulesID].action].concat(Object.keys(messages[to][fromDomain][from]));																	
								}
							}
						}
					}
				}
			}
		}else{
			returnResult[rules[rulesID].action] = msgIDs;
			rulesforAllMessagesCnt++;
		}
	}
	var stopCheck = Math.floor(new Date() );
	console.log('filtr time: '+((stopCheck-startCheck)/1000));
	console.log('rules for all messages cnt : '+rulesforAllMessagesCnt);
	
	//get normal result
	function prepareReturnResult(arr){
		var ret = {};
		for(var action in arr){			
			arr[action].forEach(function(msgID){
				if(!ret[msgID])ret[msgID]=[];
				ret[msgID].push(action);
			})
		}		
		return ret;
	}	
	var startR = Math.floor(new Date() );
	returnResult = prepareReturnResult(returnResult);
	var stopR = Math.floor(new Date() );
	console.log('prepare result '+((stopR-startR)/1000));
	return returnResult;
}