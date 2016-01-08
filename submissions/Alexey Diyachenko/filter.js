// Author Alleha 

function Filter(messages, rules){
	this.messages = messages;
	this.rules = convert_rules(rules);
};

Filter.prototype = {
						rules : [],
						cache : {},						
						max_email_repeats : 1 // cache email if meet it more then "max_email_repeats"
					}

Filter.prototype.init_cache = function init_cache(){	
	this.cache = create_cache(this.messages, this.rules, this.max_email_repeats);
}

// find intersection between two sets of emails ("from" and "to") and return them
Filter.prototype.intersection = function(aFrom, aTo){
	var n = aFrom.length, m = aTo.length, i = 0, k = 0, j = 0, result = [];
	
	while ((i < n) && (j < m))
	{
		if (aFrom[i] == aTo[j])
		{ 
			result.push(this.rules[aFrom[i]].action);
			k++,i++,j++;
		} else 
			if (aFrom[i] < aTo[j])  i++; else  j++; 
		
	}
	
	return result;
} 

// use this functon for filtration if cache is empty
Filter.prototype.check = function(message){
	for(var i = 0, len = this.rules.length, obj = {}, result = []; i < len; i++){
		obj = this.rules[i];
	
		if ((obj.from == undefined || obj.from.test(message.from)) && (obj.to == undefined || obj.to.test(message.to))){
			result.push(obj.action);
		}
			
	}
	return result;
}

// check emails only in one side  ("from" or "to")  if opposite side is chached
Filter.prototype.check_one_side = function(email, side, rules){
	for(var i = 0, len = rules.length, obj = {}, result = []; i < len; i++){
		obj = this.rules[rules[i]];		
		if ((obj[side] == undefined || obj[side].test(email))) result.push(obj.action);	
	}

	return result;
}

// main function to filter emails if cache is not empty  
Filter.prototype.check_with_cache = function check_with_cache(message){
	var from = this.cache[message.from] && this.cache[message.from]['from'], 
		to = this.cache[message.to] && this.cache[message.to]['to'], 
		is_from_exists = from instanceof Array && from.length > 0, 
		is_to_exists = to instanceof Array && to.length > 0;

	if (is_from_exists && is_to_exists)
		return this.intersection(from, to);
			
	if (is_from_exists)		
		return this.check_one_side(message.to, 'to', from);	
	
	if (is_to_exists)		
		return this.check_one_side(message.from, 'from', to);
	
	return this.check(message);
};

// main filter function
Filter.prototype.exec = function exec(){
	var messages = this.messages, 
		cache = this.cache
		exec_function = cache !== null ? 'check_with_cache' : 'check';		

	for(var message in messages)
		messages[message] = this[exec_function](messages[message]);
		
	return messages;
};

//convert rules to regexp
function convert_rules(rules){	
	function to_regexp(rule){
		return rule && new RegExp('^' + rule.replace(/[.?*]/g, function(str){
			switch(str){
				case '.': return '\\.';
				case '?': return '[\\x20-\\x7F]';
				case '*': return '([\\x20-\\x7F]*?)';
				
			}
			return str;
		}) + '$');
	}

	return rules.map(function(rule){
							  return {
										from: to_regexp(rule.from), 
										to: to_regexp(rule.to), 
										action: rule.action
									 };
							 
	});
};

function Counter(from, to){
	this.from = from || 0;
	this.to = to || 0;
}
	
//  builds cache for  most frequently emails   
function count_emails(messages, mess_keys){
	var emails = Object.create(null);	

	for(var i = 0; i < mess_keys.length; i++){
		var obj = messages[mess_keys[i]];
		
		if (!(obj.from in emails)) emails[obj.from] = new Counter();
		emails[obj.from]['from']++;
	
		if (!(obj.to in emails)) emails[obj.to] = new Counter();
		emails[obj.to]['to']++;
	}

	return emails;
}

function add_cached_filter(email, type, rules){
	for(var i = 0, result = [], len = rules.length; i < len; i++)
			if ((rules[i][type] == undefined || rules[i][type].test(email))) result.push(i);
		
	return result;
}
		
function create_cache(messages, rules, max_email_repeat){
	var cache = Object.create(null), 
		mess_keys = Object.keys(messages),
		emails_count = count_emails(messages, mess_keys),
		counter = 0;
							
		for(var message in emails_count){ 
			var obj = emails_count[message];
			
			if (emails_count[message]['from'] > max_email_repeat){ 
				var values = add_cached_filter(message, 'from', rules);
				cache[message] = {from: values, to:[]};
				counter++;
			}
			
			if (emails_count[message]['to'] > max_email_repeat){ 
				var values = add_cached_filter(message, 'to', rules);
				if (cache[message] == undefined) cache[message] = {from:[], to: values};
				else cache[message].to = values;
				
				counter++;
			}
		}	
	
	return (counter && mess_keys.length && (100 * counter)/mess_keys.length > 10) ? cache : null;	//use cache only if there are more then 10% emails
}

function filter(messages, rules){
	var filter = new Filter(messages, rules);	   
	filter.init_cache();	
	return filter.exec();
};

exports.filter = filter;