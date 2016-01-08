/**
messages — это объект, ставящий в соответствие уникальным идентификаторам
	сообщений объекты с двумя свойствами: from и to. 
	Каждый такой объект описывает одно электронное письмо.
rules — это массив объектов с тремя свойствами: 
	from (необязательно), to (необязательно) и action (обязательно). 
	Каждый из этих объектов описывает одно правило фильтрования.
*/
'use strict';


function processEmailDump(fromStr, toStr){


}



exports.filter = function filter (messages, rules){
	var processAll = getProcessAllFunctions(rules);
	return processAll(messages);
}
function getProcessAllFunctions(rules){
	var processMsgName = getProcessMsgNameFunction(rules);
	var functionBodyAll = '\n\n' + 
					'var cache = {}; \n' +
					'var msgName;\n' +
					'var keys = Object.keys(messages); \n' + 
					'var len = keys.length;\n' +
					'var j;\n' +
					'for(j = 0; j < len; j++){\n' +
						'msgName = keys[j]\n' +
						processMsgName +
					'}\n' +
					'return messages;'
	return new Function('messages', functionBodyAll); 
}

function getProcessMsgNameFunction(rules){
	var functionBodyAll;
	functionBodyAll = '\n\n' + 
			'var fromStr = messages[msgName].from; \n' +
			'var toStr = messages[msgName].to; \n' +
			'var actions = cache[fromStr + "\\n" + toStr]; \n' +
			'if (actions) {messages[msgName] = actions; return;} \n' +
			'actions = []; \n' +
			'var fromViewLength = fromStr.length; \n' + 
			'var toViewLength = toStr.length; \n' + 
			'var filter = false;\n' +
			'var begin = 0;\n' +  //текущее место начала и конца поиска ( с нуля, включительно begin, невключительно end)
			'var end = 0;\n' + 
			'var i;\n';
	rules.forEach(function(rule, ruleId){
		functionBodyAll += '// Rule #' + ruleId + '\n'
		functionBodyAll += 'filter = true;\n'
		if(!!rule.from && rule.from !== '*') functionBodyAll += getHalfMask('from', rule.from);
		if(!!rule.to && rule.to !== '*') functionBodyAll += getHalfMask('to', rule.to);
		functionBodyAll += 'if(filter){actions.push("'+ rule.action +'")}\n\n'
	});
	functionBodyAll += 'cache[fromStr + "\\n" + toStr] = actions; messages[msgName] = actions\n';
	//console.log(functionBodyAll)
	return functionBodyAll;
}

function getHalfMask(prefix, mask){
	var i, maskLength, submaskLength, 
		mask, action, 
		submasks, submask, 
		submaskBeginIndex, submaskEndIndex, submaskIndex,
		fixLeft, fixRight;

	var functionBody = '// MASK = ' + mask + '\n';

	if(!!mask && mask !== '*') {
		maskLength = mask.length;
		submasks = mask.split('*').filter(submask => submask.length);
		fixLeft = (mask.charAt(0) !== '*');
		fixRight = (mask.charAt(mask.length-1) !== '*');

		//functionBody += 'if (filter && ' + prefix +'ViewLength < ' + submasks[submasks.length-1].length + ') {\nfilter = false;\n}\n'
		//console.log(mask, submasks)

		if(!submasks.length){

		}
		else if(submasks.length === 1 && (fixLeft || fixRight)) { // один значащий подфильтр, фиксированный с одной из сторон строки
			submask = submasks[0];
			submaskLength = submasks[0].length;
			if(fixLeft){
				functionBody += 'if( filter && ' + prefix +'ViewLength '+(fixRight ? '=== ' : '>= ') + submaskLength;
				for(i=0; i<submaskLength; i++){
					if(submask.charAt(i) !== '?') {
						functionBody += '\n\t&& ' + prefix +'Str.charCodeAt(' + i + ') ==' + submask.charCodeAt(i)
					}
				}
				functionBody += ' ) {\n\tfilter = true;\n}\nelse{\nfilter = false;\n}\n';
			}
			else{ //fixRight
				functionBody += 'if( filter && ' + prefix +'ViewLength >=' + submaskLength;
				for(i=0; i<submaskLength; i++){
					if(submask.charAt(submaskLength - (i + 1)) !== '?') {
						functionBody += '\n\t&& ' + prefix +'Str.charCodeAt(' + prefix +'ViewLength - ' + (i + 1) + ') ==' + submask.charCodeAt(submaskLength - (i + 1))
					}
				}
				functionBody += ' ) {\n\tfilter = true;\n}\nelse{\nfilter = false;\n}\n';
			}
		} // конец: один значащий подфильтр, фиксированный с одной из сторон строки
		else{// Несколько фильтров. Убираем фиксированные левую и правую часть
			if(fixLeft) { 
				submask = submasks[0];
				submaskLength = submask.length;
			
				functionBody += 'if( filter && ' + prefix +'ViewLength >= ' + submaskLength;
				for(i=0; i<submaskLength; i++){
					if(submask.charAt(i) !== '?') {
						functionBody += '\n\t&& ' + prefix +'Str.charCodeAt(' + i + ') ==' + submask.charCodeAt(i)
					}
				}
				functionBody += ' ) {\n\tbegin = ' + submaskLength + ';\n}\nelse{\nfilter = false;\n}\n';
				submaskBeginIndex = 1;
			}
			else{ //!fixLeft
				functionBody += 'begin = 0;\n';
				submaskBeginIndex = 0;
			}

			if(fixRight) { 
				submask = submasks[submasks.length - 1];
				submaskLength = submask.length;
			
				functionBody += 'if( filter && ' + prefix +'ViewLength >=' + submaskLength;
				for(i=0; i<submaskLength; i++){
					if(submask.charAt(submaskLength - (i + 1)) !== '?') {
						functionBody += '\n\t&& ' + prefix +'Str.charCodeAt(' + prefix +'ViewLength - ' + (i + 1) + ') ==' + submask.charCodeAt(submaskLength - (i + 1))
					}
				}
				functionBody += ' ) {\n\tend = ' + prefix +'ViewLength - '+(submaskLength + 1) + ';\n}\nelse{\nfilter = false;\n}\n';
				submaskEndIndex = submasks.length - 1;
			}
			else{ //!fixRight
				functionBody += 'end = ' + prefix +'ViewLength - 1;\n';
				submaskEndIndex = submasks.length;
			}

			if(fixLeft || fixRight ) {
				functionBody += 'if(filter && begin > end + 1) {filter = false;}\n';
			}
			//submaskBeginIndex, submaskEndIndex, submaskIndex
			for (submaskIndex = submaskBeginIndex; submaskIndex < submaskEndIndex; submaskIndex++) {
				submask = submasks[submaskIndex];
				submaskLength = submask.length;
				functionBody += 
					'if(filter) {\n' + 
						'for(i=begin; i <= end - ' + (submaskLength - 1 ) +'; i++){ \n' +
							'if(filter';	
							for(i=0; i<submaskLength; i++){
								if(submask.charAt(i) !== '?') {
									functionBody += '\n\t&& ' + prefix +'Str.charCodeAt(i + ' + i + ') ==' + submask.charCodeAt(i)
								}
							}			
							functionBody += '){\n\tbreak;\n}\n'; //end if
						functionBody += '}\n'; //end for
						functionBody += 'if(i > end -' + (submaskLength -1 ) + '){\n\tfilter = false;\n}\n'
						functionBody += 'else{\n\tbegin = i+1;\n}\n'
					functionBody += '}\n'
			};
		}
	}
	return functionBody;	
}
