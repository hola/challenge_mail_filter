exports.filter=function(messages, rules){
	var tr=['\\\u0000','\\\u0001','\\\u0002','\\\u0003','\\\u0004','\\\u0005','\\\u0006','\\\u0007','\\\u0008','\\\u0009','\\\u000a','\\\u000b','\\\u000c','\\\u000d','\\\u000e','\\\u000f','\\\u0010','\\\u0011','\\\u0012','\\\u0013','\\\u0014','\\\u0015','\\\u0016','\\\u0017','\\\u0018','\\\u0019','\\\u001a','\\\u001b','\\\u001c','\\\u001d','\\\u001e','\\\u001f','\\\u0020','\\\u0021','\\\u0022','\\\u0023','\\\u0024','\\\u0025','\\\u0026','\\\u0027','\\\u0028','\\\u0029','.*','\\\u002b','\\\u002c','\\\u002d','\\\u002e','\\\u002f','0','1','2','3','4','5','6','7','8','9','\\\u003a','\\\u003b','\\\u003c','\\\u003d','\\\u003e','.','\\\u0040','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','\\\u005b','\\\u005c','\\\u005d','\\\u005e','\\\u005f','\\\u0060','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','\\\u007b','\\\u007c','\\\u007d','\\\u007e','\\\u007f'];
	var pf=new Array();
	var sf=new Array();
	var rf=new Array();
	var nf=new Array();
	var pt=new Array();
	var st=new Array();
	var rt=new Array();
	var nt=new Array();
	var rs=new Array();
	var mf=new Array();
	var mt=new Array();
	var mr=new Array();
	var idx=0;
	var mmax=12;
	var enable_memory=256;
	var result={};
	var iterations = rules.length;
	for(var j=0; j<iterations; j++){
		var rule=rules[j];
		var str=rule['from'];
		
		if(str && str!='*'){
			if(str.indexOf('**')>=0)
				str=str.replace(/\*\*+/g,'*');
			var len=str.length;
			var pos=null;
			var sy=null;
			for(var i=0; i<len; i++){
				if(str[i] == '*')
					break;
				if(str[i] == '?')
					continue;
				pos=i;
				sy=str[i];
				break;
			}
			if(pos==null)
				for(i=len-1; i>=0; i--){
					if(str[i] == '*')
						break;
					if(str[i] == '?')
						continue;
					if(str[i] == '+' && i<len-1 && str[i+1]!='?'){
						pos=i+1-len;
						sy=str[i+1];
						break;
					}
					pos=i-len;
					sy=str[i];
				}

			pf.push(pos);
			sf.push(sy);
			if(str.indexOf('*')<0 && str.indexOf('?')<0){
				rf.push(null);
				nf.push(str);
			}
			else{
				var arr = new Array();
				arr.push('^');
				for(var i=0; i<len; i++)
					arr.push(tr[str.charCodeAt(i)]);
				arr.push('$');
				rf.push(new RegExp(arr.join('')));
				nf.push(null);
			}
		}
		else{
			pf.push(null);
			sf.push(null);
			rf.push(null);
			nf.push(null);
		}
		
		var str=rule['to'];
		if(str && str!='*'){
			if(str.indexOf('**')>=0)
				str=str.replace(/\*\*+/g,'*');
			var len=str.length;
			var pos=null;
			var sy=null;
			for(var i=0; i<len; i++){
				if(str[i] == '*')
					break;
				if(str[i] == '?')
					continue;
				pos=i;
				sy=str[i];
				break;
			}
			if(pos == null)
				for(i=len-1; i>=0; i--){
					if(str[i] == '*')
						break;
					if(str[i] == '?')
						continue;
					if(str[i] == '+' && i<len-1 && str[i+1]!='?'){
						pos=i+1-len;
						sy=str[i+1];
						break;
					}
					pos=i-len;
					sy=str[i];
				}

			pt.push(pos);
			st.push(sy);
			if(str.indexOf('*')<0 && str.indexOf('?')<0){
				rt.push(null);
				nt.push(str);
			}
			else{
				var arr = new Array();
				arr.push('^');
				for(var i=0;i<len;i++)
					arr.push(tr[str.charCodeAt(i)]);
				arr.push('$');

				rt.push(new RegExp(arr.join('')));
				nt.push(null);
			}
		}
		else{
			pt.push(null);
			st.push(null);
			rt.push(null);
			nt.push(null);
		}
		rs.push(rule['action']);
	}
	
	for(var i in messages){
		var from=messages[i]['from'];
		var to=  messages[i]['to'];
		
		if(enable_memory){
			var n=mf.indexOf(from);
			if(n>=0 && mt[n]==to){
				result[i]=mr[n];
				enable_memory=512;
				continue;
			}
			enable_memory--;
		}

		var arr=new Array(); 
		for(var j=0; j<iterations; j++){
			if(nf[j]!=null){
				if(nf[j]!=from)
					continue;
				else{
					if(nt[j]!=null){
						if(nt[j]!=to)
							continue;
					}
					else{
						var pos2=pt[j];
						if(pos2!=null){
							var len2=to.length;
							if(pos2<0)
								pos2+=len2;
							if(pos2<0||pos2>=len2||to[pos2]!=st[j])
								continue;
						}
						if(rt[j] != null && rt[j].test(to)==false)
							continue;
					}
				}
			}
			else{
				var pos1=pf[j];
				if(pos1==null){
					if(nt[j]!=null){
						if(nt[j]!=to)
							continue;
						if(rf[j]!=null && rf[j].test(from)==false)
							continue;
					}
					else{
						var pos2=pt[j];
						if(pos2!=null){
							var len2=to.length;
							if(pos2<0)
								pos2+=len2;
							if(pos2<0||pos2>=len2||to[pos2]!=st[j])
								continue;
						}
						if(rf[j]!=null && rf[j].test(from)==false)
							continue;
						if(rt[j]!=null && rt[j].test(to)==false)
							continue;
					}
				}
				else{
					var len1=from.length;
					if(pos1<0)
						pos1+=len1;
					if(pos1<0 || pos1>=len1 || from[pos1]!=sf[j])
						continue;
					else{
						if(nt[j]!=null){
							if(nt[j]!=to)
								continue;
							if(rf[j]!=null && rf[j].test(from)==false)
								continue;
						}
						else{
							var pos2=pt[j];
							if(pos2!=null){
								var len2=to.length;
								if(pos2<0)
									pos2+=len2;
								if(pos2<0||pos2>=len2||to[pos2]!=st[j])
									continue;
							}
							if(rf[j]!=null && rf[j].test(from)==false)
								continue;
							if(rt[j]!=null && rt[j].test(to)==false)
								continue;
						}
					}
				}
			}
			arr.push(rs[j]);
		}
		result[i]=arr;
		if(enable_memory){
			mr[idx]=arr;
			mf[idx]=from;
			mt[idx]=to;
			idx++;
			if(idx>mmax)
				idx=0;
		}
	}
	return result;
}


