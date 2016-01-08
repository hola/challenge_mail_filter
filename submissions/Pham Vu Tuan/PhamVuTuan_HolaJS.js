/* Participant name: Pham Vu Tuan
   Email address: tuan007@e.ntu.edu.sg
*/

module.exports = function filter(messages,rules){
	// function performing string comparison between 
	// 1 message property (from or to) and 1 rule property (from or to).
	function compare(messageProperty,ruleProperty){
		var messageArray = messageProperty.split('');
		var ruleArray = ruleProperty.split('');
		var messageLength = messageArray.length;
		var ruleLength = ruleArray.length;
		var messageIndex = 0;
		var ruleIndex = 0;
 		while(messageIndex < messageLength && ruleIndex < ruleLength){
 			if(ruleArray[ruleIndex] === '*'){ // when rule property has symbol '*'.
 				if(ruleIndex === rule.Length - 1){ // the symbol '*' is the last character of the rule string
 					ruleIndex++;
 					messageIndex = messageLength;
 				}else{
 					messageIndex++;
 					if(messageArray[messageIndex] === ruleArray[ruleIndex + 1]){
 						ruleIndex++;
 					}
 				}
 				continue;
 			}else if((ruleArray[ruleIndex] !== '?') && (ruleArray[ruleIndex] !== messageArray[messageIndex])){ 
 				return false; // when 2 characters are not matched
 			}
 			messageIndex++;
 			ruleIndex++;
 		}
		if(messageIndex === messageLength && ruleIndex === ruleLength){
			return true;
		}
		return false;
	}
	// function performing checking the match between 1 message and 1 rule.
	function matching(message,rule){
		var action = null;
		if(rule.from === undefined && rule.to === undefined){
			action = rule.action;
		}else if(rule.from === undefined && rule.to !== undefined){
			if(compare(message.to,rule.to)){
				action = rule.action;
			}
		}else if(rule.to === undefined && rule.from !== undefined){
			if(compare(message.from,rule.from)){
				action = rule.action;
			}
		}else{
			if(compare(message.from,rule.from) && compare(message.to,rule.to)){
				action = rule.action;
			}
		}
		return action;
	}

	var result = {};
	var count = 1; // counter to count number of messages
	for(var index in messages){
		var message = 'msg' + count;
		result[message] = []; // result array.
		for(var rule in rules){
			var match = matching(messages[message],rules[rule]);
			if(match !== null){ 
				result[message].push(match);
			}
		}
		count++;
	}
	return result;
}