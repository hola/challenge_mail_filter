"use strict";
module.exports = function filter(msg, ftrs){
	var result = {};
	var fltrLen = ftrs.length;
	var fromChar, toChar, nskeep, currentRoole, nextFromC, nextToC;
	var cI, fromLim, toLim, nEndTo, nEndFrom, to, from, rooles, keys, len, _len, key;
	var j, i, c, t;
	for(j = 0; j < fltrLen; j++){
		t = ftrs[j];
		t['fromLen'] = (t['from'] || '').length;
		t['toLen'] = (t['to'] || '').length;
	}
	for(i = 0, keys = Object.keys(msg), len = keys.length; i < len; i++){
		key = keys[i];
		var item = msg[key];
		result[key] = [];

		rooles = [];
		for(j = 0; j < fltrLen; j++){
			t = ftrs[j];
			to = false; 
			from = false;
			if(t['from']){
				c = t['from'][0];
				if(c === '*'){
					from = true;
					t['fromC'] = c;
					t['fromI'] = 0;
				}else if(c === item['from'][0] || c === '?'){
					from = true;
					t['fromC'] = t['from'][1];
					t['fromI'] = 1;
				}
			}else{
				from = true;
			}
			if(t['to']){
				c = t['to'][0];
				if(c === '*'){
					to = true;
					t['toC'] = c;
					t['toI'] = 0
				}else if(c === item['to'][0] || c === '?'){
					to = true;
					t['toC'] = t['to'][1];
					t['toI'] = 1;
				}
			}else{
				to = true;
			}
			if(from && to){
				rooles.push(t);
			}
		}
		cI = 1;
		fromLim = item['from'].length;
		toLim = item['to'].length;
		nEndTo = true;
		nEndFrom = true;
		while(nEndTo && nEndFrom){
			if(cI < fromLim){
				fromChar = item['from'][cI];
			}else{
				fromChar = false;
				nEndFrom = false;
			}
			if(cI < toLim){
				toChar = item['to'][cI];
			}else{
				toChar = false;
				nEndTo = false;
			}
			for(var j = 0, _len = rooles.length; j < _len; j++){
				currentRoole = rooles[j];
				nskeep = true;
				if(fromChar !== false){
					if(currentRoole['fromLen'] !== 0 && currentRoole['fromLen'] !== currentRoole['fromI']){
						if(currentRoole['fromC'] === '?' || currentRoole['fromC'] === fromChar){
							currentRoole['fromI'] ++;
							currentRoole['fromC'] = currentRoole['from'][currentRoole['fromI']];
						}else if(currentRoole['fromC'] === '*'){
							nextFromC = currentRoole['from'][(currentRoole['fromI'] + 1)];
							if(nextFromC === fromChar){
								currentRoole['fromI'] += 2;
								currentRoole['fromC'] = currentRoole['from'][currentRoole['fromI']];
							}
						}else{
							rooles.splice(j, 1);
							j -= 1;
							_len -= 1;
							nskeep = false;
						}
					}
				}
				if(nskeep){
					if(currentRoole['toLen'] !== 0 && currentRoole['toLen'] !== currentRoole['toI']){
						if(currentRoole['toC'] === '?' || currentRoole['toC'] === toChar){
							currentRoole['toI'] ++;
							currentRoole['toC'] = currentRoole['to'][currentRoole['toI']];
						}else if(currentRoole['toC'] === '*'){
							nextToC = currentRoole['to'][(currentRoole['toI'] + 1)];
							if(nextToC === toChar){
								currentRoole['toI'] += 2;
								currentRoole['toC'] = currentRoole['to'][currentRoole['toI']];
							}
						}else{
							rooles.splice(j, 1);
							j -= 1;
							_len -= 1;
						}
					}
				}
			}
			cI ++;
		}
		for(j = 0, _len = rooles.length; j < _len; j++){
			t = rooles[j];
			if( (t['from'] === undefined || t['fromLen'] === t['fromI']) || (t['from'] === undefined || t['toLen'] === t['toI']) ){
				result[key].push(t['action']);
			}
		}
	}
	return result;
}