/*  Developer: Sergii Iakymov
*	e-mail: serg.yakimov@gmail.com
*
*	Mail Filtering Engine
*	JS challenge Winter 2015
*/


function filter(messages, rules) {
	var answer = {};
	var fromTamplate, toTamplate, key, i;
	for (i = 0; i < rules.length; i++) {
		if (rules[i].from !== undefined && rules[i].to !== undefined) {
			for (key in messages) {
				fromTamplate = new RegExp('^'+rules[i].from.replace(/\*/g,'(.*)').replace(/\?/g,'(.{1})')+'$');
				toTamplate = new RegExp('^'+rules[i].to.replace(/\*/g,'(.*)').replace(/\?/g,'(.{1})')+'$');
				if (messages[key].from.search(fromTamplate) == 0 && messages[key].to.search(toTamplate) == 0){
					if(answer[key] === undefined){
						answer[key] = [];
						answer[key].push(rules[i].action);
					} else {
						answer[key].push(rules[i].action);
					}
				}
			}
		} else if (rules[i].to !== undefined && rules[i].from === undefined) {
			for (key in messages) {
				toTamplate = new RegExp('^'+rules[i].to.replace(/\*/g,'(.*)').replace(/\?/g,'(.{1})')+'$');
				if (messages[key].to.search(toTamplate) == 0){
					if(answer[key] === undefined){
						answer[key] = [];
						answer[key].push(rules[i].action);
					} else {
						answer[key].push(rules[i].action);
					}
				}
			}
		} else if (rules[i].from !== undefined && rules[i].to === undefined) {
			for (key in messages) {
				fromTamplate = new RegExp('^'+rules[i].from.replace(/\*/g,'(.*)').replace(/\?/g,'(.{1})')+'$');
				if (messages[key].from.search(fromTamplate) == 0){
					if(answer[key] === undefined){
						answer[key] = [];
						answer[key].push(rules[i].action);
					} else {
						answer[key].push(rules[i].action);
					}
				}
			}
		} else {
			for (key in messages) {			
				if(answer[key] === undefined){
					answer[key] = [];
					answer[key].push(rules[i].action);
				} else {
					answer[key].push(rules[i].action);
				}
			}
		}
	}
	return answer;
}

exports.filter = filter;