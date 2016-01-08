
function filter(messages, rules){
	var rez={};
	for(var i=0;i<rules.length;i++){
		var t=0;
		if(("from" in rules[i])&&!("pfrom" in rules[i])){rules[i].pfrom=parsemask(rules[i].from);t+=1;}
		if(("to" in rules[i])&&!("pto" in rules[i])){rules[i].pto=parsemask(rules[i].to);t+=2;}
		if(!("type" in rules[i]))rules[i].type=t;
	}
	for(var key in messages){
		rez[key]=[];
		for(var i=0;i<rules.length;i++)switch(rules[i].type){
			case 0:rez[key].push(rules[i].action);break;
			case 1:if(ismask(messages[key].from,rules[i].pfrom))rez[key].push(rules[i].action);break;
			case 2:if(ismask(messages[key].to,rules[i].pto))rez[key].push(rules[i].action);break;
			case 3:
			if((ismask(messages[key].from,rules[i].pfrom))&&(ismask(messages[key].to,rules[i].pto)))rez[key].push(rules[i].action);
			break;
			default:
//			alert("filter,mesage:"+key+" "+messages[key]+"rule["+i+"]="+rules[i]+" type="+rules[i].type);
if(("from" in rules[i])&&("to" in rules[i])){
	if((ismask(messages[key].from,rules[i].pfrom))&&(ismask(messages[key].to,rules[i].pto)))rez[key].push(rules[i].action);
	}
else if("pfrom" in rules[i]){if(ismask(messages[key].from,rules[i].pfrom))rez[key].push(rules[i].action);}
else if("pto" in rules[i]){if(ismask(messages[key].to,rules[i].pto))rez[key].push(rules[i].action);}
else rez[key].push(rules[i].action);
			}
		}
	return rez;	
}
function parsemask(mask){
	if((mask==undefined)||(mask.length==0))return null;
	var rez=[];
	var curp=0;
	var nextp=mask.length;
	var sp=mask.indexOf('*');
	var qp=mask.indexOf('?');
	
	var minlen=0;
	var fixlen=(-1==sp);

	while((~sp)||(~qp)){
		if((~sp)&&(~qp))nextp=(qp>sp)?sp:qp;
		else if(~qp)nextp=qp;else nextp=sp;
		var vl=false;
		var sh=0;
		var nxt;
		for(nxt=nextp;(mask[nxt]=='*')||(mask[nxt]=='?');nxt++)if(mask[nxt]=='?')sh++;else vl=true;
		rez.push({str:mask.slice(curp,nextp),shift:sh,varl:vl});
		minlen+=(nextp-curp+sh);
		curp=nxt;
		nextp=mask.length;
		if(~sp)sp=mask.indexOf('*',curp);
		if(~qp)qp=mask.indexOf('?',curp);
		}
	if(curp<mask.length){rez.push({str:mask.slice(curp),shift:0,varl:false});
		minlen+=(mask.length-curp);}
	rez.min=minlen;
	rez.fix=fixlen;

	return rez;
}

function ismask(str,mask){
	var cp;
	if((str==null)||(str==undefined)||(mask==null)||(mask==undefined))return false;
	if(mask.fix?(str.length!=mask.min):(str.length<mask.min))return false;
	var curp=0;
	for(var i=0;i<mask.length;i++){
		var l=mask[i].str.length;
		if(((i==0)||!mask[i-1].varl)){
			if((l>0)&&(str.slice(curp,curp+l)!=mask[i].str))return false;
			curp+=(l+mask[i].shift);
		} 
		else if(-1==(cp=str.indexOf(mask[i].str,curp)))return false;
		else curp=l+cp+mask[i].shift;

	}
	if((curp<str.length)&&mask[mask.length-1].valr)return false;else return true;
}
