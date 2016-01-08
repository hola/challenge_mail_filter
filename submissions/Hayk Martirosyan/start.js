var module = require("./app")
var input = require("./test1.json")

// function multiplayMessages (messages, count){
// 	if(count>1){
// 		var result = {};
// 		for(var i=0; i<count; i++){
// 			var c = '';//i==0?'':i;
// 			for(var msgId in messages){
// 				result[msgId + '_' + i] = {"from":messages[msgId].from +c , "to":messages[msgId].to + c};

// 			}
			

// 		}
// 		return result;
// 	}
// 	else {
// 		return messages;
// 	}
// }

// function multiplayRules (rules, count){
// 	if(count>1){
// 		var result = [];
// 		for(var i=0; i<count; i++){
// 			for(var ruleIndex = 0; ruleIndex<rules.length; ruleIndex ++){
// 				result.push(rules[ruleIndex]);
// 			}
			

// 		}
// 		return result;
// 	}
// 	else if(count==1){
// 		return rules;
// 	}
// 	else {
// 		var result = [];
// 		for(var ruleIndex = rules.length-1; ruleIndex>=0; ruleIndex-- ){
// 			result.push(rules[ruleIndex]);
// 		}
// 		return result;

// 	}
// }
// input.messages = multiplayMessages(input.messages, 1);
// input.rules = multiplayRules(input.rules, 1);

var start = new Date()
var s = module.filter(input.messages, input.rules);
console.log((new Date()-start)/1000)
