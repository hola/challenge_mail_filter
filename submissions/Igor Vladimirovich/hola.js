var filter = function(messages, rules)
{
	var result = {};
	
	//Правила, которые применяются ко всем письмам
	var rDef = [];
	//Дерево обхода
	var rTree = [{}];

	var rulesL = rules.length;
	
	var codeAll = '*'.charCodeAt(0);
	var codeOne = '?'.charCodeAt(0);
	
	//Добавление правила в дерево
	var addRule = function(testN, from, to)
	{
		//Добавление правила
		var p = 0;
		var pZ = rTree[p];
		var chr = false;
		
		var len = from.length + to.length + 2;
		var toPoz = 0;
		for(var i=0; i<len; i++)
		{
			if(i<from.length){
				chr = from.charCodeAt(i);
			} else if (i === from.length){
				chr = 0;
			}else if(toPoz < to.length){
				chr = to.charCodeAt(toPoz);
				toPoz++;
			}else{
				chr = 1;
			}
			
			
			if(pZ[chr] !== undefined)
			{
				p = pZ[chr];
			}else{
				rTree[p][chr] = rTree.length;
				p = rTree.length;
				rTree[p] = {};
				if(chr === codeAll)
					rTree[p].all = true;
			}
			pZ = rTree[p];
		}
		if(pZ.ok === undefined)
			pZ.ok = [];
		pZ.ok[pZ.ok.length] = testN;
	};
	
	//Проверка сообщения по фильтрам
	var testMessage = function(from, to)
	{
		var testOk = [];
		for(var i=0; i<rDef.length;i++)
			testOk[i] = rDef[i];

		var testOkbool = {};

		var nowPoz = [];
		var nowPoz2 = [];
		var nowPoz2bool = {};
		
		
		var addResult = function(result, from, to)
		{
			//testOk[testOk.length] = result;
			//return;
			if(from === undefined)
			{
				from = 0;
				to = testOk.length;
			}
			if(from == to)
			{
				testOk[testOk.length] = 0;
				for(var i = testOk.length-1; i>from; i--)
				{
					testOk[i] = testOk[i-1];
				}
				testOk[from] = result;
			}else{
				var r = Math.floor((from+to)/2);
				if(result > testOk[r])
				{
					addResult(result, r+1, to);
				}else{
					addResult(result, from, r);
				}
			}
		};
		var addResults = function(arr)
		{
			for(var i=0; i<arr.length; i++)
			{
				if(testOkbool[arr[i]] === undefined)
				{
					testOkbool[arr[i]] = true;
					addResult(arr[i]);
				}
			}
		};
		var addPoz = function(poz)
		{
			if(nowPoz2bool[poz] !== undefined)
				return;
			
			nowPoz2bool[poz] = true;

			nowPoz2[nowPoz2.length] = poz;
			
			//По кругу
			if(rTree[poz][codeAll] !== undefined)
			{
				addPoz(rTree[poz][codeAll]);
			}
		};
		
		
		addPoz(0);
		nowPoz = nowPoz2;
		

		var chr = false;
		var len = from.length + to.length + 2;
		var toPoz = 0;
		for(var i=0; i<len; i++)
		{
			if(i<from.length){
				chr = from.charCodeAt(i);
			} else if (i === from.length){
				chr = 0;
			}else if(toPoz < to.length){
				chr = to.charCodeAt(toPoz);
				toPoz++;
			}else{
				chr = 1;
			}
			
			
			nowPoz2 = [];
			nowPoz2bool = {};
			for(var p=0; p<nowPoz.length; p++)
			{
				var poz = nowPoz[p];
				nowTree = rTree[poz];
				if(chr === 0 || chr === 1)
				{
					if(nowTree[chr] !== undefined)
					{
						addPoz(nowTree[chr]);
					}
				}else{
					//По кругу
					if(nowTree.all === true)
					{
						addPoz(poz);
					}
					//Символ
					if(nowTree[chr] !== undefined)
					{
						addPoz(nowTree[chr]);
					}
					//Символ ?
					if(nowTree[codeOne] !== undefined)
					{
						addPoz(nowTree[codeOne]);
					}
				}
			}
			
			nowPoz = nowPoz2;
		}
		for(var i=0; i<nowPoz.length; i++)
		{
			var poz = nowPoz[i];
			if(rTree[poz].ok !== undefined)
			{
				addResults(rTree[poz].ok);
			}			
		}
		
		//testOk = testOk.sort();
		for(var i=0; i<testOk.length; i++)
		{
			testOk[i] = rules[testOk[i]].action;
		}
		return testOk;
	};
	
	for(var i=0; i<rulesL; i++)
	{
		var r = rules[i];
		if(r.from === undefined)
			r.from = '*';
		if(r.to === undefined)
			r.to = '*';
		if(r.from === '*' && r.to === '*')
		{
			rDef[rDef.length] = i;
		}else{
			addRule(i, r.from, r.to);
		}
	}
	
	//Обходим сообщения
	for(var i in messages)
	{
		var m = messages[i];
		result[i] = testMessage(m.from, m.to);
	}
	
	return result;
};
module.exports = filter;