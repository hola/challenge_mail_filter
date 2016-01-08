/*

Hola Mail Filter 
Author: Susheel ML
Date: 25/12/15
Messages is a mapping of unique message IDs to objects
 with two string properties: from and to. Each object describes
  one e-mail message.rules is an array of objects with three 
  string properties: from (optional), to (optional), and action (mandatory).
   Each object describes one mail filtering rule.
*/
exports.filter = function(messages, rules){

var filtered = new Array();

for (var key in messages)
{
	var msg = messages[key];
	filtered[key] = new Array();
	var from_msg = msg['from'];
	var to_msg = msg['to'];
	for(var i = 0; i<rules.length;i++ ){
		
		var obj = rules[i];
		var action = obj.action;
		var from_pass = 0;
		var  to_pass = 0;
		var pass = 0;
		// Check Message Against each Rule - Max #3 iterations
		for(var rule_key in obj){
			
			if(rule_key.localeCompare("action") == 0){
				
				if(pass == Object.keys(obj).length - 1){
					filtered[key].push(action);	
					break
					
				}

			}
			if(rule_key.localeCompare("from") == 0){
				var from_rule = obj[rule_key]
				if(checkFrom(from_rule,from_msg))
					pass += 1;
			}
			if(rule_key.localeCompare("to") == 0){
				var to_rule = obj[rule_key]
				if(checkTo(to_rule,to_msg))
					pass += 1;
			}
		}
	}
}
return( filtered);
}


function checkFrom(from_rule, from_msg){

		var domain = from_rule.split('@')[0];
		var ext = from_rule.split('@')[1];		
		if(domain == '*'){
			if(from_msg.indexOf(ext) >-1){		
						return true;
			}
		}
		else if( from_msg.localeCompare(from_rule) == 0	){
				return true		
		}
	return false
}


function checkTo(to_rule, to_msg){

	var domain = to_rule.split('@')[0];
	var ext = to_rule.split('@')[1];
	if(domain == '*'){
		if(to_msg.indexOf(ext) >-1){
			return true
			}
	}
	else if( to_msg.localeCompare(to_rule) == 0	){
				return true					
	}
	return false
}