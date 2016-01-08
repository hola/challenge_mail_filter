var exports  = {}; 

var t0, t1;
var regexArr = [];

exports.filter = function(messages, rules) {

	console.time('Function');
	var result = {};
	if (messages != null && rules != null) { 
 		var rLen = rules.length;
		if (rLen == 0 && (!rules.hasOwnProperty("action"))) 
			return result;

		checkRegexStr(rules);

		var match, ruleIdx = 0; 
 		var k;
		for(k in messages) {
 			result[k] = [];
 			while (ruleIdx < rLen) {
 				if (checkRule(messages[k], rules[ruleIdx], ruleIdx)) result[k].push(rules[ruleIdx].action);
				ruleIdx++;
			}
			ruleIdx = 0; 
 		}  
 	} // IF
 
	console.log("Filter Result : " + JSON.stringify(result));  console.timeEnd('Function');
 	return result;
};
 
var checkRule = function(message, rule, idx) { 
 	var mode;
 	if (regexArr[idx].from && regexArr[idx].to) mode = 1;
	else if (regexArr[idx].from) mode = 2;
	else if (regexArr[idx].to) mode = 3;
	else mode = 4;

	return parseRule(message, rule, idx, mode); 
}

var parseRule = function(message, rule, idx, mode) {
	try {
 		var reg1, reg2;
		switch(mode) {
			case 1: 
 					reg1 = new RegExp(regexArr[idx].fromRegex);
					reg2 = new RegExp(regexArr[idx].toRegex); 
					return (reg1.test(message.from) && reg2.test(message.to));
 			break;
			case 2:
 					reg1 = new RegExp(regexArr[idx].fromRegex); 
					return (reg1.test(message.from));
 			break;
			case 3:
 					reg2 = new RegExp(regexArr[idx].toRegex);
					return (reg2.test(message.to));
 			break;
			case 4:
 				return true;
		}

	} catch (err) { }

	return false; 
}

 
var checkRegexStr = function(rule) {
	var len = rule.length; var r, rObj; var idx = 0;

	while (idx < len) {
		r = rule[idx];
 			rObj = {};
			if (r.hasOwnProperty("from") && isASCII(r.from)) { 
				rObj.from = true;
				rObj.fromRegex = escape(r.from);
			} else rObj.from = false;

			if (r.hasOwnProperty("to") && isASCII(r.to)) { 
				rObj.to = true;
				rObj.toRegex = escape(r.to);
			} else rObj.to = false;

			regexArr.push(rObj);
		 
		idx++;
	} 
}

var isASCII = function(str){
	try {  
    	return /^[\x20-\x7F]*$/.test(str);
    } catch (err) { return false; }
}

var escape = function(text) {
    text = text.replace(/[-[\]{}()+.,\\^$|#\s]/g, "\\$&");
    text = text.replace("*", ".*") + "$";
    text = text.replace(/\?/g, ".+");
    return text;
}


var post = function (data) {
	var url = "http://hola.org/challenge_mail_filter/reference";
	var method = "POST";
 
	var async = true;

	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var request = new XMLHttpRequest();

	// Before we send anything, we first have to say what we will do when the
	// server responds. This seems backwards (say how we'll respond before we send
	// the request? huh?), but that's how Javascript works.
	// This function attached to the XMLHttpRequest "onload" property specifies how
	// the HTTP response will be handled. 
	request.onload = function () {

	   // Because of javascript's fabulous closure concept, the XMLHttpRequest "request"
	   // object declared above is available in this function even though this function
	   // executes long after the request is sent and long after this function is
	   // instantiated. This fact is CRUCIAL to the workings of XHR in ordinary
	   // applications.

	   // You can get all kinds of information about the HTTP response.
	   var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
	   var datax = request.responseText; // Returned data, e.g., an HTML document.
	
		console.log("@@@@@@@@@    Post Datax: " + datax + "   @@@@@@@@@@@@@"); }

	request.open(method, url, async);

	request.setRequestHeader("Content-Type", "application/json");
 
	// Actually sends the request to the server.
	 request.send(JSON.stringify(data));	
 
}
 
module.exports = exports;
 