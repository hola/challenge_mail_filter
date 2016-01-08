
var buildRegEx = function(rule)
{
	var ruleRgex=rule;
	if (ruleRgex.indexOf('*')!=-1)
	{
		ruleRgex = ruleRgex.replace("*","[a-zA-Z]+");
	}
	if (rule.indexOf('?')!=-1) {
		ruleRgex= ruleRgex.replace("?","[a-zA-Z]");
	}
	return  new RegExp(ruleRgex);

}

var add2MsgReult = function(msgName,resArr,rule)
{
	if (!(msgName in resArr)) resArr[msgName]=[];
	resArr[msgName].push(rule['action']);
}

var checkRule = function(msg,rule,traget)
{
	return (msg[traget].search(buildRegEx(rule[traget]))!=-1);
}

var filter = function(messages, rules){
	var ruleBase={}
	for (var m in messages) {
		var msg = messages[m];

		for (var i in rules) {

			var rule = rules[i];
			var lastRule ='';

			if (('from' in rule) && ('to' in rule)){
				if ( checkRule(msg,rule,'from') &&  checkRule(msg,rule,'to')) add2MsgReult(m,ruleBase,rule)

			} else {

				if ('from' in rule && checkRule(msg,rule,'from'))
				{
					add2MsgReult(m,ruleBase,rule);	 
				}
				if  ('to' in rule &&  checkRule(msg,rule,'to')){
					add2MsgReult(m,ruleBase,rule);	 

				}
			}
		}
	}
	console.log("result is ="+JSON.stringify(ruleBase))
	return ruleBase;

}


filter({
    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
    msg3: {from: 'boss@work.com', to: 'jack@example.com'}
}, [
    {from: '*@work.com', action: 'tag work'},
    {from: '*@spam.com', action: 'tag spam'},
    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
])

/*
	 msg1: ['folder jack', 'forward to jill@elsewhere.com'],
    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
    msg3: ['tag work']
	*/
