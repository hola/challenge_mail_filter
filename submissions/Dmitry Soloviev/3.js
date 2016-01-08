var fs = require("fs");
var f=require ('./filter.js');
var Benchmark = require('benchmark');
function filter1(messages, rules){
    if ( typeof filter.all_regs == 'undefined' ) {
        filter.all_regs={};
    }
	function match_adr(str, mask){
		if (mask=='*') {
			return true;
		}
		var fm;
		if (!filter.all_regs.hasOwnProperty(mask)){
			var zi = mask.indexOf('*');
			if (zi>-1||mask.indexOf('?')>-1){
				var mask2reg = mask.replace(/\./g,'\\.');
				if (zi>-1){
					mask2reg = mask2reg.replace(/\*+/g,'.*');
				}
				// if (part_of_email==1){
					// special symbols in login: ! # $ % & ' * + - / = ? ^ _ ` { | } ~
					mask2reg = mask2reg
						.replace(/\$/g,'\\$')
						.replace(/\+/g,'\\+')
						.replace(/\//g,'\\/')
						.replace(/\^/g,'\\^')
						.replace(/\{/g,'\\{')
						.replace(/\}/g,'\\}')
						;
				// }
				filter.all_regs[mask] = [ 
					function(s){return new RegExp('^'+mask2reg.replace(/\?/g,'.') +'$').test(s);}
					, {}
					];
			}
			else{
				filter.all_regs[mask] = [ 
					function(s){return s==mask;}
					, {}
					];
			}
			fm = filter.all_regs[mask];
		}else{
			fm = filter.all_regs[mask];
			if ( fm[1].hasOwnProperty(str) ){
				return fm[1][str];
			}
		}
		fm[1][str] = fm[0](str);
		return fm[1][str]; 
	}
	function match_filter(message, rule){
		return (!rule.hasOwnProperty('from') || match_adr(message.from,rule.from) ) &&
			   (!rule.hasOwnProperty('to')   || match_adr(message.to,rule.to)     );
	}
	ret={};
	for(var messindex in messages){
		ret = [];
		for(var ruleindex =0;ruleindex < rules.length;ruleindex++){
			if ( match_filter( messages[messindex], rules[ruleindex]) ){
				ret.push(rules[ruleindex].action);
			}
		}
		messages[messindex] = ret;
	}
	return messages;
}
var mes, rules;
var json;
if(1){ // 20000+500=18.9
	console.log('started');
 	mes = {};
	for (var i = 0; i < 20000; i++) {
		mes['msg1'+i]= {from: 'jack'+i+'@example.com', to: 'jill'+i+'@example.org'};
		mes['msg2'+i]= {from: 'noreply'+i+'@spam.com', to: 'jill'+i+'@example.org'};
		mes['msg3'+i]= {from: 'boss'+i+'@work.com', to: 'jack@example.com'}

	}
	rules = [
		    {from: '*@work.com', action: 'tag work'},
		    {from: '*@spam.com', action: 'tag spam'},
		    ];
	for (var i = 0;i < 250;i++){
		rules.push(
		    // {from: '*@sp?m.com', action: 'tag sp!m'},
		    {from: 'jack'+i+'@example.com', to: 'jill'+i+'@example.org', action: 'folder jack'},
		    {to: 'jill'+i+'@example.org', action: 'forward to jill'+i+'@elsewhere.com'}
		);
	}
	console.log('created');
	f.filter( mes, rules);
}
// else if(0){
// 	var content = fs.readFileSync("test1.json");
// 	json= JSON.parse(content);
// 	// console.log(j.rules.length);
// 	var bench = new Benchmark('foo', function() {
// 		console.log(json.rules.length);
// 		// f.filter( json.messages, json.rules);
// 	});
// 	bench.run({count:1});
// }
else{
	mes = {
	    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
	    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
	    msg3: {from: 'boss@work.com', to: 'jack@example.com'},
	    msg4: {from: 'jill@example.org', to: 'boss@example.org'},
	};

	rules = [
		    {from: '*@work.com', action: 'tag work'},
		    {from: '*@spam.com', action: 'tag spam'},
		    // {from: '*@sp?m.com', action: 'tag sp!m'},
		    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
		    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'},
		    // {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
		];

	console.log( f.filter( mes, rules) );
}


// {
//     msg1: ['folder jack', 'forward to jill@elsewhere.com'],
//     msg2: ['tag spam', 'forward to jill@elsewhere.com'],
//     msg3: ['tag work']
// }

