var module = require("./app")
var test1 = require("./test1.json")
var test3 = require("./test3.json")


function averageActions(actions){
	var sum = 0;
	var count = 0;
	for(var msgId in actions){
		var action = actions[msgId];
		sum += action.length;
		count++;
	}
	return sum/count;
}

function case1(){
	var domains = [];
	var ruleCount = 1000;
	
	for(var i=0; i<ruleCount; i++){
		domains.push(i + "abc"  + i + "def" + i + ".com");
	}


	function generateMessages (){
		var result = {};
		for(var i=0; i<ruleCount; i++){
			for(var j=0; j<ruleCount/10; j++){
				result["msg_" + i + "_" + j] = {"from":(i + "" + j+ "@" + domains[i]) , "to":(j + "" + i+ "@" + domains[i])};
			}
		}
		return result;
		
	}

	function generateRules (){
		var result = [];
		for(var i=0; i<ruleCount; i++){
			result.push(
				{
					from:("*@" +domains[i].replace(/10/g, "??").replace("a","?").replace("d", "?").replace("om", "*")),
					to:("*@" +domains[i].replace(/10/g, "??").replace("ab","??").replace("e", "?").replace("co", "*"))
				}
			);
			// result.push(
			// 	{
			// 		from:("*z*"),
			// 		to:("*1*")
			// 	}
			// );

		}
		return result;
		
	}
	var input = {};
	input.messages = generateMessages();
	input.rules = generateRules();
	return input;
}

function case2(){
	var ruleCount = 1000;
	function generateMessages (){
		var result = {};
		for(var i=0; i<ruleCount; i++){
			for(var j=0; j<ruleCount/10; j++){
				result["msg_" + i + "_" + j] = {"from":(i + "aaaaaaaaaaaaaaaa" + j+ "@" + i) , "to":(j + "bbbbbbaaaaaaaabbbb" + i+ "@" + i)};
			}
		}
		return result;
		
	}

	function generateRules (){
		var result = [];
		for(var i=0; i<ruleCount; i++){
			result.push(
				{
					from:("*"),
					to:("*")
				}
			);
			

		}
		return result;
		
	}
	var input = {};
	input.messages = generateMessages(100000);
	input.rules = generateRules(1000);
	return input;
}

function reverse(input){
	input.rules = input.rules.reverse();
	return input;
}

function randomise(input){//randomise rule order
	for(var i=0; i<10000000; i++){
		var a = parseInt(Math.random()*100000)%input.rules.length;
		var b = parseInt(Math.random()*100000)%input.rules.length;
		var tmp = input.rules[a];
		input.rules[a] = input.rules[b];
		input.rules[b] = tmp;
	}
	return input;
}



 var input = randomise(case1());
// var input = randomise(input);
//console.log(input.messages);
var input = case1();
var start = new Date()
var s = module.filter(input.messages, input.rules);
console.log("          Case1=" + (new Date()-start)/1000 + ", avg=" + averageActions(s))

var input = randomise(case1());
var start = new Date()
var s = module.filter(input.messages, input.rules);
console.log("randomise-Case1=" + (new Date()-start)/1000 + ", avg=" + averageActions(s))


var input = randomise(test1);
var start = new Date()
var s = module.filter(input.messages, input.rules);
console.log("randomise-test1=" + (new Date()-start)/1000 + ", avg=" + averageActions(s))

var input = randomise(test3);
var start = new Date()
var s = module.filter(input.messages, input.rules);
console.log("randomise-test3=" + (new Date()-start)/1000 + ", avg=" + averageActions(s))
