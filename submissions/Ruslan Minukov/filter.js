exports.filter=function(messages, rules){
		function reg(str) {									// preparation of the text for regular expression (rus - подготовка текста для регулярного выражения)
		var a=["\\","#","|","(",")","[","]","{","}","^","$","+",".","=","!",":","/"],len=a.length,res=str; 
		for(var i=0; i<len; i++) res=res.split(a[i]).join("\\"+(a[i])); 
		return "^"+res.split("*").join(".*").split("?").join(".")+"$"; 	} 
	var lst, i, len=rules.length, m, r, first=true;			// creation variables (rus - переменные создаются один раз)
	for (var name_mess in messages){ m=messages[name_mess];	// round messages (rus - цикл сообщений)
		for (i=0,lst = [] ; i<len ; i++){ r=rules[i];		// round rules (rus - цикл правил, обнуление списка)
			if(first){										// first round for save new properties from_r,to_r (rus - при первом цикле правил сохраняем в каждом новом свойстве from_r и to_r значения: 1-без проверки,2-полное совпадение,текст-RegExp)
				r.from_r=(!("from" in r) || r.from=="*") ? 1 : (r.from.indexOf("*")<0 && r.from.indexOf("?")<0) ? 2 : reg(r.from) ; 
				r.to_r=(!("to" in r) || r.to=="*") ? 1 : ( r.to.indexOf("*")<0 && r.to.indexOf("?")<0) ? 2 : reg(r.to); 
			}												// use properties from_r,to_r for verification, save in list (rus - используем свойства from_r и to_r для проверки и сохранение action в списке)
			if((r.from_r==1 ? true : r.from_r==2 ? (r.from==m.from) : RegExp(r.from_r).test(m.from)) && (r.to_r==1 ? true : r.to_r==2 ? (r.to==m.to) : RegExp(r.to_r).test(m.to))) lst.push(r.action);
		}	
		first=false; messages[name_mess]=lst;				// new value for properties of messages (rus - присвоение нового значения свойстпу сообщения)
	} 	return messages;
};															// made in Ukraine maxrusmr2011@gmail.com
