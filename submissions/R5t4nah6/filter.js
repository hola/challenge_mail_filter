exports.filter=function(messages, rules){
	var cmp=function(str, arr, s1, s2, a1, a2){
		if(a1>=a2 && s1>=s2)
			return true;
		if(a1>=a2)
			return false;
		if(arr[a1]=='*'){
			if(a1+1>=a2)
				return true;
			for(var i=s1; i<s2; i++)
				if(str[i] == arr[a1+1] || arr[a1+1] == '?')
					if(cmp(str, arr, i+1, s2, a1+2, a2))
						return true;
		}
		else{
			if(s1>=s2)
				return false;
			if(arr[a1] == str[s1] || arr[a1]=='?')
				if(cmp(str, arr, s1+1, s2, a1+1, a2))
					return true;
		}
		return false;
	}

	var f0=new Array();var f1=new Array();var f2=new Array();var f3=new Array();
	var t0=new Array();var t1=new Array();var t2=new Array();var t3=new Array();
	var act=new Array();
	var rulesLength = rules.length;
	for(var n=0; n<rulesLength; n++){
		var rule=rules[n];

		var template=rule['from'];
		if(!template || template=='*'){
			f0.push(null);f1.push(null);f2.push(null);f3.push(null);
		}
		else{
			var aster=0;
			var quest=0;
			var firstAster=-1;
			var lastAster=-1;
			template=template.replace(/\*{2,}/g,'*');
			var arr=template.split('');
			var lfrom=arr.length;
			for(var i=0;i<lfrom;i++){
				if(arr[i]=='*'){
					aster++;
					lastAster=i;
					if(firstAster<0)
						firstAster=i;
				}
				else if(arr[i]=='?')
					quest++;
			}
			f0.push(template.length-aster);
			f1.push((aster|quest)==0 ? template:((lastAster<<16)|firstAster));
			f2.push((aster>1 && quest==0) ? (template.split(/\*+/)):((aster==1 && quest==0) ? 1:null));
			f3.push((aster|quest)==0 ? null:arr);
		}

		var template=rule['to'];
		if(!template || template=='*'){
			t0.push(null);t1.push(null);t2.push(null);t3.push(null);
		}
		else{
			var aster=0;
			var quest=0;
			var firstAster=-1;
			var lastAster=-1;
			template=template.replace(/\*{2,}/g,'*');
			var arr=template.split('');
			var lfrom=arr.length;
			for(var i=0;i<lfrom;i++){
				if(arr[i]=='*'){
					aster++;
					lastAster=i;
					if(firstAster<0)
						firstAster=i;
				}
				else if(arr[i]=='?')
					quest++;
			}
			t0.push(template.length-aster);
			t1.push((aster|quest)==0 ? template:((lastAster<<16)|firstAster));
			t2.push((aster>1 && quest==0) ? (template.split(/\*+/)):((aster==1 && quest==0) ? 1:null));
			t3.push((aster|quest)==0 ? null:arr);
		}
		act.push(rule['action']);
	}

	var memoIt=0;
	var memoFrom=new Array();
	var memoTo=new Array();
	var memoAction=new Array();
	var res={};
	var arrStr;
	for(var msgId in messages){
		var message=messages[msgId];
		var from=message['from'];
		var to=message['to'];
		var i=memoFrom.indexOf(from);
		if(i>=0 && memoTo[i]==to){
			res[msgId]=memoAction[i];
			if(i!=memoIt){
				var a=memoAction[memoIt]; var f=memoFrom[memoIt]; var t=memoTo[memoIt];
				memoAction[memoIt]=memoAction[i]; memoFrom[memoIt]=from; memoTo[memoIt]=to;
				memoAction[i]=a; memoFrom[i]=f; memoTo[i]=t;
			}
			if(++memoIt>=10)
				memoIt=0;
			continue;
		}	

		var resForMessage=new Array();
		nextRule:
		for(var n=0; n<rulesLength; n++){
			var hardSymbols=f0[n];
			if(hardSymbols!=null){				
				arr=f3[n];
				if(arr==null){
					if(from!=f1[n])
						continue nextRule;
				}
				else if(from.length<hardSymbols){
					continue nextRule;
				}
				else if((lastAster=f1[n])<0){
					var len=arr.length;
					if(from.length!=len)
						continue nextRule;
					for(var j=0;j<len;j++){
						if(from[j]!=arr[j] && arr[j]!='?') 		
							continue nextRule;
					}
				}
				else if((arrStr=f2[n])!=null){
					firstAster=lastAster&0xFFFF;
					for(var s1=0;s1<firstAster;s1++)
						if(from[s1]!=arr[s1])
							continue nextRule;
																	
					lastAster=(lastAster>>16)&0xFFFF;
					var s2=from.length;
					for(var j=arr.length-1; j>lastAster; j--)
						if(from[--s2]!=arr[j])
							continue nextRule;

					if(firstAster!=lastAster){
						var a1=1;
						var a2=arrStr.length-1;
						for(;;){
							s1=from.indexOf(arrStr[a1],s1);
							if(s1<0 || s1+arrStr[a1].length > s2)
								continue nextRule;
							s1+=arrStr[a1].length;
							if(++a1>=a2)
								break;
						}
					}
				}
				else{
					firstAster=lastAster&0xFFFF;
					for(var j=0;j<firstAster;j++)
						if(from[j]!=arr[j] && arr[j]!='?')
							continue nextRule;
		
					lastAster=(lastAster>>16)&0xFFFF;
					var s2=from.length-1;
					for(var a2=arr.length-1; a2>lastAster; a2--,s2--)
						if(from[s2]!=arr[a2] && arr[a2]!='?')
							continue nextRule;

					if(firstAster!=lastAster){
						var s1=firstAster>0?firstAster-1:0;
						if(cmp(from, arr, s1, s2+1, s1, a2+1)==false)
							continue nextRule;
					}
				}
			}

			var hardSymbols=t0[n];
			if(hardSymbols!=null){	
				arr=t3[n];		
				if(arr==null){
					if(to!=t1[n])
						continue nextRule;
				}
				else if(to.length<hardSymbols){
					continue nextRule;
				}
				else if((lastAster=t1[n])<0){
					var len=arr.length;
					if(to.length!=len)
						continue nextRule;
					for(var j=0;j<len;j++){
						if(to[j]!=arr[j] && arr[j]!='?')
							continue nextRule;
					}
				}
				else if((arrStr=t2[n])!=null){
					firstAster=lastAster&0xFFFF;
					for(var s1=0;s1<firstAster;s1++)
						if(to[s1]!=arr[s1])
							continue nextRule;
																	
					lastAster=(lastAster>>16)&0xFFFF;
					var s2=to.length;
					for(var j=arr.length-1; j>lastAster; j--)
						if(to[--s2]!=arr[j])
							continue nextRule;

					if(firstAster!=lastAster){
						var a1=1;
						var a2=arrStr.length-1;
						for(;;){
							s1=to.indexOf(arrStr[a1],s1);
							if(s1<0 || s1+arrStr[a1].length > s2)
								continue nextRule;
							s1+=arrStr[a1].length;
							if(++a1>=a2)
								break;
						}
					}
				}
				else{
					firstAster=lastAster&0xFFFF;
					for(var j=0;j<firstAster;j++)
						if(to[j]!=arr[j] && arr[j]!='?')
							continue nextRule;

					lastAster=(lastAster>>16)&0xFFFF;
					var s2=to.length-1;
					for(var a2=arr.length-1; a2>lastAster; a2--,s2--)
						if(to[s2]!=arr[a2] && arr[a2]!='?')
							continue nextRule;

					if(firstAster!=lastAster){
						var s1=firstAster>0?firstAster-1:0;
						if(cmp(to, arr, s1, s2+1, s1, a2+1)==false)
							continue nextRule;
					}
				}
			}
			resForMessage.push(act[n]);
		}
		res[msgId]=resForMessage;
		
		memoFrom[memoIt]=from;
		memoTo[memoIt]=to;
		memoAction[memoIt]=resForMessage;
		if(++memoIt>=10)
			memoIt=0;
	}
	return res;
}
