/*
	Абсалямов Амир Наильевич 
	mr.amirka@ya.ru
	2015-12-18T22:21:05+03:00
*/
function invalidBegin(src,mask){
	var m;
	while(mask.i < mask.l){
		m = mask.s[mask.i++];
		if(m === '*')return false;
		if(m !== src.s[src.i++] && m !== '?')return true;
	}
	if(src.l > mask.l)return true;
	return false;
}
function invalidEnd(src,mask){
	var m;
	while(mask.l > 0){
		m = mask.s[--mask.l];
		if(m === '*')return false;
		if(--src.l < 0)return true;
		if(m !== '?' && m !== src.s[src.l])return true;
	}
	return false;
}
function eqaul(src,mask){
	var m,si = src.i,mi = mask.i;
	while(mi < mask.l){
		m = mask.s[mi++];
		if(m === '*')break;
		if(m !== src.s[si++] && m !== '?')return false;
	}
	src.i = si;
	mask.i = mi;
	return true;
}
function invalidOf(src,mask){
	while(src.i < src.l){
		if(eqaul(src,mask))return false;
		src.i++;
	}
	return true;
}
function invalidDetect(srcS,maskS){
	if(maskS === undefined || maskS === '')maskS = '*';
	var mask = {s:maskS,i:0,l:maskS.length};
	var src = {s:srcS,i:0,l:srcS.length};
	if(invalidBegin(src,mask))return true;
	if(invalidEnd(src,mask))return true;
	while(mask.i < mask.l){
		if(invalidOf(src,mask))return true;
	}
	return false;
}
function filter(messages,rules){	
	var r = {},l = rules.length,a,m,v,j;
	for(var i in messages){
		m = messages[i];
		a = [];
		for(j = 0; j < l; j++){
			v = rules[j];
			if(invalidDetect(m.from,v.from))continue;
			if(invalidDetect(m.to,v.to))continue;
			a.push(v.action);
		}
		r[i] = a;
	}	
	return r;
}
module.exports = filter;