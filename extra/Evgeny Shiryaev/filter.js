/*
	Автор 	Ширяев Евгений
	Mail	eshiryaev@gmail.com
	
	Основная идея решения - преобразовать набор фильтров/правил в дерево условий.
	
	Допустим, имеется набор правил:
	------------------------------------------------------------------------------
	rules = [
		{from : "abc",  to : "*",    action : "action1"},
		{from : "abe",  to : "*z",   action : "action2"},
		{from : "ab?",  to : "r*t?", action : "action3"},
		{from : "abc*", to : "???",  action : "action4"}
	]
	------------------------------------------------------------------------------
	Генерируемый для этих правил набор условий from:
	------------------------------------------------------------------------------
	if(f1==="a"){
            if(f2==="b"){
                if(f3==="c"){                    
		    w[0]|=8;      //action4
                    if(z===3){                        
			w[0]|=1;  //action1
                    }
                }
                else if(f3==="e"){
                    if(z===3){                        
			w[0]|=2;  //action2
                    }
                }
                if(z===3){                    
		    w[0]|=4;      //action3
                }
            }
        }
	------------------------------------------------------------------------------
	набор условий to:
	------------------------------------------------------------------------------
	w[0]|=1; 		//action1
	if(fl1==="z"){
	    w[0]|=2;		//action2
	}
  	if(f1==="r"){
      	    if(fl2==="t"){
                if(z>=3){
                    w[0]|=4;	//action3
                }
            }
        }
        if(z===3){
            w[0]|=8; 		//action4
        }
	------------------------------------------------------------------------------	

	где,
	f1, f2, f3... 	- 1, 2, 3 символы c начала строки в тестируемом сообщении
	fl1, fl2, fl3...- 1, 2, 3 символы c конца строки в тестируемом сообщении
	z 		- длина тестируемого сообщения
	w 		- массив с результатом работы. В единицу устанавливаются биты, 
			  соответствующие номеру правила.

	Получив результат для from и to, мы можем определить какие правила сработали 
	в обоих случаях и получить соответствующий набор actions.	

*/

module.exports = function (m, f){

	// выводить ли отладочные сообщения
	var logOn = false;
	function log(s) {
		if (logOn) console.log("  " + s);
	}
	
	// преобразование правила в набор простых условий
	var getifblock = (function () {
		var cache = {};
		function get(str) {			
			if(!(str in cache)) 
				cache[str] = getbody(str);		
			return cache[str];
		}
		function getbody(str) {
			function esc(sym) {
				if(sym === "\"") sym = "\\\"";
				if(sym === "\\") sym = "\\\\";
				return "\"" + sym + "\"";
			}
			if ((str === undefined) || (str === "") || (str === "*")) return [0, []];	
			var l = str.length, i = l, cnt = 0;			
			var flag = false, q = false;
			var forward = [], backward = [];
			var t = "f";
		
			for(i = 0; i < l; i++) {
				var c = str[i];
				if (c === "*") { flag = true; break; }								
				if (c != "?") (i < 10)?forward.push([t + (i+1), "===", esc(c)]):forward.push([t + "["+i+"]", "===", esc(c)]); else q = true;
				cnt++;
			}
			if (flag) {
				i++;
				while(i<l) {
					var c = str[i];
					if (c === "*") return [1, forward];
					if (c != "?") ((l-i)>=15)?backward.unshift([t + "[z-"+(l-i)+"]", "===", esc(c)]):backward.unshift([t+"l"+(l-i), "===", esc(c)]); else q = true;
					i++;
					cnt++;
				}
			} else {
				backward.push(["z", "===", str.length]);
				//forward.unshift(["z", "===", str.length]);
			}			
			if (flag && q) {	
				backward.push(["z", ">=", cnt]);
			}

			return [0, forward.concat(backward)];
		}
		return get;
	})();


	function memoizerule(fn) {

		// Переменная для контроля кеширования, для анализа используем 1% процент сообщений
		var balance = ML/100;
		var cache = {};

		return function(p1, p2) {
			
			if (balance < 0) return fn(p1, p2);

			if(p1 in cache) {
				cachehit++;
				balance++;
				return cache[p1];
			}
			balance--;
			// если попаданий в кеш мало, то отключаем кеширование
			if (balance < 0) log("DISABLE CACHE!");

			cache[p1] = fn.apply(this, arguments);	
			return cache[p1];
		};

	}


	log("\n  --- START ----------------------------------------\n");
	var t0 = new Date();
	// кол-во фильров
	var FL = f.length;
	var msgs = Object.keys(m);			
	// кол-во сообщений
	var ML = msgs.length;
	// использовать ли кеширование	
	var usememoize = true;
	var cachehit = 0;

	log("COUNT RULES    " + FL);
	log("COUNT MSG      " + ML);	

	var t1 = new Date();

	var ob = {
		body: "",
		// тут будет собираться дерево условий для правил from
		treeFrom: {},
		// для правил to
		treeTo: {},
		reset: function() {
			this.body = "";
			this.treeFrom = {};
			this.treeTo = {};
		},
		// добавление правила в дерево
		add: function(ruletype, str, action) {			
			var o = (ruletype === "from")?this.treeFrom:this.treeTo;
				
			for(var i = 0; i < str.length; i++) {			
				var a = str[i];
				var e = a.join("");
				if (o[a[0]] === undefined) {
					o[a[0]] = {};
					o = o[a[0]];
					o["if("+e+")"] = {};
					o = o["if("+e+")"];
				} else {
					o = o[a[0]];
					if ((o["if("+e+")"] != undefined)) {
						o = o["if("+e+")"];
					} else {
						if (e.substr(0,1) != "z") {
							if ((o["else if("+e+")"] === undefined)) {
								o["else if("+e+")"] = {};
								o = o["else if("+e+")"];
							}
							else {
								o = o["else if("+e+")"];
							}
						} else {
							o["if("+e+")"] = {};
							o = o["if("+e+")"];
						}
					}			
				}	
			}
			
			if(o["action"] === undefined) o["action"] = [];
			o["action"].push(action);
			
		},		
		// трансформация дерева в код
		get: function(ruletype, o, level) {
			function addaction(o, l) {
				if(!(o['action'] === undefined)) {
					return l + o['action'].join("\n"+l)+"\n";
					//return o['action'].join("");
				}
				return "";		
			}
			if (level === undefined) level = "";
			if (o === undefined) {
				o = (ruletype==="from")?this.treeFrom:this.treeTo; 				
				this.body = "";
			}
			this.body += addaction(o, level);
			var keys = Object.keys(o);
			for(var i = 0; i < keys.length; i++) {

					if (keys[i].indexOf("=") > 0 ) this.body += level + keys[i] + "{\n";
						
					if (typeof(o[keys[i]]) === "object") {
						///*debug*/ level += "  "; ob.get(ruletype, o[keys[i]], level); level = level.substr(0, level.length-2);
						ob.get(ruletype, o[keys[i]], level);
					}

					if (keys[i].indexOf("=") > 0 ) this.body += level + "}\n";

			}
			return this.body;
		},	
		getfunction: function(ruletype){			
			var bodyprefix = "var w = []; var f = fstr.split(''), z = f.length;\n";
			bodyprefix += "var fl1=f[z-1],fl2=f[z-2],fl3=f[z-3],fl4=f[z-4],fl5=f[z-5],fl6=f[z-6],fl7=f[z-7],fl8=f[z-8],fl9=f[z-9],fl10=f[z-10],fl11=f[z-11],fl12=f[z-12],fl13=f[z-13],fl14=f[z-14],fl15=f[z-15];\n";
			bodyprefix += "var f1=f[0],f2=f[1],f3=f[2],f4=f[3],f5=f[4],f6=f[5],f7=f[6],f8=f[7],f9=f[8],f10=f[9];\n\n";	
			var bodypostfix = "return w;";
			var bodytxt = this.get(ruletype);
			return new Function('fstr', 're', bodyprefix + bodytxt + bodypostfix);
		}	
	}

	// не все фильтры можно представить простым набором условий,
	// в этих случаях используем RegExp
	var re = {
		// массив с RegExp'ами
		regarray: [],
		add :	(function () {
				var cache = {};
				function get(str) {			
					if(!(str in cache)) 
						cache[str] = addrule(str);		
					return cache[str];
				}
				function addrule(rule) {
					if(rule===undefined || rule==="" || rule==="*") return -1;

					var specials = ["-", "[", "]", "/", "{", "}", "(", ")", "*", "+", "?", ".", "\\", "^", "$", "|"];
					var nrule = "";
					for(var i = 0; i < rule.length; i++) {
						if(specials.indexOf(rule[i])>=0) {
							if(rule[i] === "*") 
								nrule += ".{0,}"
							else if (rule[i] === "?")
								nrule += ".{1}"
							else if (rule[i] === "\\") 
								nrule += "\\\\"							
							else 
								nrule += "\\" + rule[i];
						} else {
							nrule += rule[i];
						}
					}
					
					var ind = re.regarray.push(new RegExp("^" + nrule + "$", ""))-1;
					return ind; 
				}
				return get;
			})(),
		get : 	(function() {
				
				var balance = ML/100;
				var cache = {};

				function get(ind, str) {
					if (balance < 0) return re.regarray[ind].test(str);
					var key = JSON.stringify([ind, str]);
					if(key in cache) {
						balance++;
						return cache[key];
					}
					balance--;
					if(balance < 0) log("DISABLE CACHE");
					cache[key] = re.regarray[ind].test(str);
					return cache[key];
				}				
				return get;
			})()		
	}

	// цикл по фильтрам
	var ruletypes = ["from", "to"];
	for (var i = 0; i < FL; i++) {
		for(var rt = 0; rt < 2; rt++) {

			var ruletxt = f[i][ruletypes[rt]];
			var regstr = "";
			var gb = getifblock(ruletxt);
			if (gb[0] === 1) {
				var regnum = re.add(ruletxt);
				regstr = (regnum>=0)?"if(re.get(" + regnum + ",fstr)) ":" ";
			}
			ob.add(	ruletypes[rt],
				gb[1],
				regstr + "w[" + ((i/31)|0) + "]|=" + (1<<(i%31)) //+ "    //" + f[i].action
			);

		}
	}

	var funcfrom = usememoize?memoizerule(ob.getfunction("from")):ob.getfunction("from");	
	var functo = usememoize?memoizerule(ob.getfunction("to")):ob.getfunction("to");

	/*
	console.log(ob.get("from"));
	console.log("--------------------");
	console.log(ob.get("to"));
	*/

	// тут хранится возвращаемый результат
	var res = {};
	// Заполним его начальными значениями
	// Конструкция [[], 0] используется для того, чтобы использовать res[key][0][res[key][1]++] = value (быстрее) вместо res.push(value) (медленнее)
	for (var i = 0; i < ML; i++) res[msgs[i]] = [[], 0];

	log("REGARRAY size  " + re.regarray.length);
	log("PREPARE TIME:  " + (new Date() - t1)/1000.0 + "\n");

	var t2 = new Date();

	// Размер массива для хранения флагов, сработавших фильтров
	var maskArraySize = (FL/31|0)+1;
	log("maskArraySize = " + maskArraySize);

	// добавление тегов в результат
	// a   - массив сработавших флагов from
	// b   - массив сработавших флагов to
	// key - идентификатор сообщения
	var addTags = function(a, b, key) {
		for(var p = 0; p < maskArraySize; p++) {
			// находим теги, сработавшие и для from и для to
			var c = a[p]&b[p];
			var bit = 0;
			// пробегаемся по битам
			while(c>0) {
				// если бит взведен
				if(c&1) res[key][0][res[key][1]++] = f[p*31+bit].action;				
				c>>=1;
				bit++;
			}
		}
	}
	
	// основной цикл применения фильтров
	for(var u = 0; u < ML; u++) {

		var key = msgs[u];
		var msg = m[key];		

		addTags(
			funcfrom(msg.from, re), 
			functo(msg.to, re), 
			key
		);
					
	}


	log("\n  FILTER TIME:   " + (new Date() - t2)/1000.0);
	log("CACHE HIT      " + Math.round(cachehit/(ML*2)*100*100)/100 + "%");

	// Приводим результат к требуемому виду
	var j = ML-1; 
	var prev = new Date();
	while(j >= 0) {
		res[msgs[j]] = res[msgs[j]][0]; 
		j--;
	}

	log("CONVERT TIME:  " + (new Date() - prev)/1000.0);
	log("FULL TIME:     " + (new Date() - t0)/1000.0);		
	log("\n  --- END ------------------------------------------\n");
	

	return res;
		
}
