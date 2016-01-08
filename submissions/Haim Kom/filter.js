function test(src, dst){
	/*
	 * This function recieves a source string and a destination string wich represents a condition.
	 * Checks if the source string satisfies the dst condition.
	 */
	var src_len = src.length;
	var dst_len = dst.length;
	
	if (0 == dst_len){
		return true;
	}	
	var current_word = 0;
	var is_ok;
	var is_wild = false;
	
	for (src_iter = 0; src_iter < src_len; src_iter++){
		is_ok = true;
		for(word_iter = 0; word_iter < dst_len - current_word; word_iter++){
			if (dst.charAt(current_word + word_iter) == '?'){
				continue;
			}
			
			if (dst.charAt(current_word + word_iter) == '*'){
				is_wild = true;
				current_word += word_iter + 1;
				if (current_word >= dst_len){
					return true;
				}
				src_iter += word_iter - 1;
				is_ok = false;
				break;
			}
			
			if (dst.charAt(current_word + word_iter) != src.charAt(src_iter + word_iter)){
				is_ok = false
				break;
			}
		}	
		if (is_ok && src_iter + word_iter == src_len){
			return true;
		}
		
		if (!is_wild){
			return false;
		}		
	}
	return false;
}


function Condition(a, f, t, index){
	this.from = typeof f !== 'undefined' ? f : "*";
	this.to = typeof t !== 'undefined' ? t : "*";
	this.action = a;
	this.index = index;
	
	// Array containing all the other conditions which implies this one.
	this.stronger = new Array();	
	// I could just use .length but it might be faster this way?
	this.stronger_count = 0;
	
	// When checking a specific email, this specifies if we already ruled this condition out.
	this.checked = -1;
	
	this.check = function (message, status){		
		if (this.checked == status){
			return false;
		}
		this.checked = status;
		
		check_result = test(message.from, this.from) && test(message.to, this.to);
		
		if (!check_result){
			// If this condition isn't satisfied, we automatically rule out all the stronger ones.
			this.mark_stronger(status);
			return false;
		}
		return true;
	}
	
	// Checks if this logically implies the given condition.
	this.compare = function(condition){	
		return test(this.from, condition.from) && test(this.to, condition.to);
	}
	
	this.mark_stronger = function(status){			
		for (t = 0; t < this.stronger_count; t++){
			this.stronger[t].checked = status;
		}
	}
}
// Sets all the logical relations between the conditions.
function initialize_condition_hyrarchy(conditions){
	condition_amount = conditions.length;
	
	for (i = 0; i < condition_amount; i++){
		for (j = 0; j < condition_amount; j++){
			if (i == j){
				continue;
			}
			if (conditions[i].compare(conditions[j])){
				conditions[j].stronger.push(conditions[i]);
				conditions[j].stronger_count++;
			}
		}
	}
}

function filter(messages, rules){
	message_count = messages.length;
	rules_count = rules.length;
	conditions = new Array(rules_count);
	for (j = 0; j < rules_count; j++){
		conditions[j] = new Condition(rules[j]["action"], rules[j]["from"], rules[j]["to"], j);
	}
	initialize_condition_hyrarchy(conditions);
	
	conditions.sort(function(a,b){return b.stronger_count - a.stronger_count;});
	
	filtered = {}
	temp = new Array(rules_count);
	// We use this counting variable to avoid initalization every iteration.
	count = 0;
	for (var msg in messages){
		if (messages.hasOwnProperty(msg)){	
			for (i = 0; i < rules_count; i++){
				if (conditions[i].check(messages[msg], count % 2)){
					temp[conditions[i].index] = count;
				}
			}		
			filtered[msg] = new Array();
			for (i = 0; i <= rules_count; i++){
				if (temp[i] === count){
					filtered[msg].push(rules[i].action);
				}
			}	
			count++;
		}
	}
	return filtered;
}