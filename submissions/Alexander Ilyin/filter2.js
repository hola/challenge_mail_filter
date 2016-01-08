var insert = function (arr, num, from) {
	var to = arr.length - 1;

	var x = arr[from];
	var y = arr[to];
	if (num > y || !y) {
		arr.push(num);
		return to;
	}
	if (num < x) {
		arr.splice(from, 0, num);
		return 1;
	}
	while (true) {
		if (from + 1 == to) {
			arr.splice(from + 1, 0, num);
			return from;
		}
		var m = (from + to + (from + to) % 2) / 2;
		var middle = arr[m];
		if (num > middle) {
			from = m;
		}
		else {
			to = m;
		}
	}
};
module.exports.insert = insert;

function escapeRegExp(str, regex) {
	return str.replace(regex, "\\$&");
}

var getRegexSmart = function (filter, o, exp) {
	if (!filter)
		return null;
	var parts = filter.split(exp);
	var pos = 0;
	var regex = "^";
	var firstPart = parts[0];
	var pLen = parts.length;
	var lastPart = parts[pLen - 1];

	if (o) {
		if (pLen == 1) {
			return {
				parts: parts,
				firstPart: firstPart,
				lastPart: lastPart,
				startsWith: parts[0],
				length: filter.length
			};
		}
		if (pLen == 2) {
			var p0 = parts[0];
			var p1 = parts[1];
			if (!p0) {
				if (filter[0] == '?')
					return {
						parts: parts,
						firstPart: firstPart,
						lastPart: lastPart,
						endsWith: p1,
						length: filter.length
					};
				else return {
					parts: parts,
					firstPart: firstPart,
					lastPart: lastPart,
					endsWith: p1
				};
			}
			else if (!p1) {
				if (filter[filter.length - 1] == '?')
					return {
						parts: parts,
						firstPart: firstPart,
						lastPart: lastPart,
						startsWith: p0,
						length: filter.length
					};
				else return {
					parts: parts,
					firstPart: firstPart,
					lastPart: lastPart,
					startsWith: p0
				};
			}
			else {
				if (filter[p0.length] == '?')
					return {
						parts: parts,
						firstPart: firstPart,
						lastPart: lastPart,
						startsWith: p0,
						endsWith: p1,
						length: filter.length
					};
				else
					return {
						parts: parts,
						firstPart: firstPart,
						lastPart: lastPart,
						startsWith: p0,
						endsWith: p1
					}
			}
		}
	}
	var re = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
	for (var i = 0; i < pLen; i++) {
		var part = parts[i];
		if (i == 0) {
			if (part == "") {
				continue;
			}
			else {
				regex += escapeRegExp(part, re);
				pos += part.length;
				continue;
			}
		}
		prevChar = filter[pos];
		regex += prevChar == "?" ? "." : ".*";
		pos += 1;
		regex += escapeRegExp(part, re);
		pos += part.length;
	}
	return {
		parts: parts,
		regex: regex + "$",
		firstPart: firstPart,
		lastPart: lastPart
	};
};


module.exports.getRegexSmart = function (x) {
	return getRegexSmart(x, true, /[\?\*]/g);
};
module.exports.getRegex = function (x) {
	return getRegexSmart(x, false, /[\?\*]/g).regex;
};
var importVal = function (str, targetIndex) {
	if (!str)
		return;
	var currentIndex = targetIndex;
	for (var i = 0; i < str.length; i++) {
		var char = str[i];
		var arr = currentIndex[char];
		if (!arr) {
			arr = {};
			arr['?'] = 1;
			currentIndex[char] = arr
		}
		else
			arr['?']++;
		currentIndex = arr;
	}
};

var importVal2 = function (str, targetIndex) {
	if (!str)
		return;
	var currentIndex = targetIndex;
	for (var i = str.length - 1; i >= 0; i--) {
		var char = str[i];
		var arr = currentIndex[char];
		if (!arr) {
			arr = {};
			arr['?'] = 1;
			currentIndex[char] = arr
		}
		else
			arr['?']++;
		currentIndex = arr;
	}
};

var getVal2 = function (value, index, limit) {
	if (!value)
		return "";
	var current = index;
	var length = value.length;
	for (var i = length - 1; i >= 0; i--) {
		var v = value[i];
		var charArr = current[v];
		if (!charArr)
			return "";
		var count = charArr['?'];
		if (count == 0)
			return "";

		if (charArr['?'] <= limit) {
			return value.substring(i);
		}
		current = charArr;
	}
	return "";
}


var getVal = function (value, index, limit) {
	if (!value)
		return "";
	var current = index;
	for (var i = 0, len = value.length; i < len; i++) {
		var v = value[i];
		var charArr = current[v];
		if (!charArr)
			return "";
		var count = charArr['?'];
		if (count == 0)
			return "";

		if (charArr['?'] <= limit) {
			return value.substr(0, i + 1);
		}
		current = charArr;
	}
	return "";
}

module.exports.importIndex = importVal;
module.exports.importIndex2 = importVal2;
module.exports.getVal = getVal;
module.exports.getVal2 = getVal2;


var superRegex = "";
var filter = function (messages, filters) {
	var rules = [];
	var regexCount = 0;
	var otherCount = 0;
	var re = /[\?\*]/g;
	var empty = {};
	var messages_keys = Object.keys(messages);
	var asterix = /[\*]*\*[\*]*/g;
	for (var i = 0, l3 = filters.length; i < l3; i++) {
		var filter = filters[i];
		if (filter.from)
			filter.from = filter.from.replace(asterix,"*");
		if (filter.to)
			filter.to = filter.to.replace(asterix,"*");

		var fromRegex = getRegexSmart(filter.from, true, re) || empty;
		var toRegex = getRegexSmart(filter.to, true, re) || empty;
		if (fromRegex.regex)
			superRegex += (superRegex == "" ? "" : "|") + "(.?)" + fromRegex.regex;
		rules.push([
			fromRegex.parts,
			toRegex.parts,

			fromRegex.firstPart,
			fromRegex.lastPart,
			fromRegex && fromRegex.regex ? new RegExp(fromRegex.regex) : null,
			fromRegex.startsWith,
			fromRegex.endsWith,
			fromRegex.length,
			toRegex.firstPart,
			toRegex.lastPart,
			toRegex && toRegex.regex ? new RegExp(toRegex.regex) : null,
			toRegex.startsWith,
			toRegex.endsWith,
			toRegex.length,
			filter.action,
			i,
			filter.from,
			filter.to
		]);
		if (fromRegex && fromRegex.regex)
			regexCount++;
		else if (fromRegex)
			otherCount++;
	}

	var limit = 10;

	var from_prefix = {};
	var to_prefix = {};
	var from_suffix = {};
	var to_suffix = {};

	for (var i = 0; i < rules.length; i++) {
		var rule = rules[i];
		importVal(rule[2], from_prefix, limit);
		importVal(rule[8], to_prefix, limit);
		importVal2(rule[3], from_suffix, limit);
		importVal2(rule[9], to_suffix, limit);
	}


	var megaIndex = {};
	var actions = [];
	var anyList = [];

	for (var i = 0; i < rules.length; i++) {
		var rule = rules[i];
		actions["" + i] = rule[14];
		if (rule[16] == '*' && rule[17] == '*') {
			anyList.push(rule[15]);
			continue;
		}

		var ind = megaIndex;

		var k = getVal(rule[2], from_prefix, limit) || '*';
		var childInd = ind[k];
		if (!childInd)
			ind[k] = childInd = {};
		ind = childInd;

		var k = getVal(rule[8], to_prefix, limit) || '*';
		var childInd = ind[k];
		if (!childInd)
			ind[k] = childInd = {};
		ind = childInd;

		var k = getVal2(rule[3], from_suffix, limit) || '*';
		var childInd = ind[k];
		if (!childInd)
			ind[k] = childInd = {};
		ind = childInd;

		var k = getVal2(rule[9], to_suffix, limit) || '*';
		var childInd = ind[k];
		if (!childInd)
			ind[k] = childInd = {};
		ind = childInd;


		var ruleList = ind.rules;
		if (!ruleList)
			ind.rules = ruleList = [];
		ruleList.push(rule);
	}

	if (!megaIndex['*'])
		megaIndex['*'] = {};
	if (!megaIndex['*']['*'])
		megaIndex['*']['*'] = {};
	if (!megaIndex['*']['*']['*'])
		megaIndex['*']['*']['*'] = {};
	if (!megaIndex['*']['*']['*']['*'])
		megaIndex['*']['*']['*']['*'] = {};

	var hardRules = megaIndex['*']['*']['*']['*'].rules || [];
	megaIndex['*']['*']['*']['*'].rules = [];

	var smartAlgorithm = (function (rules) {

		var getExported = function (value, index, limit) {
			if (!value)
				return false;
			var current = index;
			var len = value.length;
			for (var i = 0; i < len; i++) {
				var v = value[i];
				var charArr = current[v];
				if (!charArr)
					break;
				if (charArr['?'] <= limit) {
					return value.substr(0, i + 1);
				}
				current = charArr;
			}
		}


		var limit = 20;

		var countIndex_from = {};
		var countIndex_to = {};
		var anyRules = [];
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			if (rule.isAll) {
				anyRules.push(i);
				continue;
			}
			if (rule[0]) {
				for (var j = 0; j < rule[0].length; j++) {
					var str = rule[0][j];
					importVal(str, countIndex_from);
				}
			}
			if (rule[1]) {
				for (var j = 0; j < rule[1].length; j++) {
					var str = rule[1][j];
					importVal(str, countIndex_to);
				}
			}
		}
		var realIndex_from = {};
		var realIndex_to = {};


		var actions = [];
		var hardRules = [];
		var mega_index = {};
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			actions[i] = rule[14];
			if (rule.isAll)
				continue;
			var from_exported = [];
			var to_exported = [];
			var exportCount = 4;
			if (rule[0]) {
				for (var j = 0; j < rule[0].length; j++) {
					var str = rule[0][j];
					var exported = getExported(str, countIndex_from, limit);
					if (exported) {
						from_exported.push(exported);
						exportCount--;
						if (exportCount==0)
							break;
					}
				}
			}
			if (rule[1] && exportCount>0) {
				for (var j = 0; j < rule[1].length; j++) {
					var str = rule[1][j];
					var exported = getExported(str, countIndex_to, limit);
					if (exported) {
						to_exported.push(exported);
						exportCount--;
						if (exportCount==0)
							break;
					}
				}
			}

			if (from_exported.length==0 && to_exported.length==0) {
				hardRules.push(rule);
				continue;
			}

			var currentIndex = mega_index;
			var isNew = false;
			for (var j = 0, from_exported_length = Math.min(from_exported.length,2); j < from_exported_length; j++) {
				var segment = from_exported[j];
				var next = currentIndex[segment];
				if (!next) {
					next = currentIndex[segment] = {};
					isNew = true;
				}
				currentIndex = next;
				if (isNew)
					break;
			}
			var to_index = currentIndex['?to'];
			if (!to_index)
				to_index = currentIndex['?to'] = {};


			var current_to = to_index;
			if (!isNew) {
				for (var j = 0, to_exported_length = Math.min(to_exported.length, 2); j < to_exported_length; j++) {
					var segment = to_exported[j];
					var next = current_to[segment];
					if (!next) {
						next = current_to[segment] = {};
						isNew = true;
					}
					current_to = next;
					if (isNew)
						break;
				}
			}

			var rule_list = current_to['?'];
			if (!rule_list)
				rule_list = current_to['?'] = [];
			rule_list.push(rule);
		}

		function fillKeys(obj){
			var keys = Object.keys(obj).filter(function(k){return k!='?' && k!='?to'});
			obj['*'] = keys;
			if (obj['?to'])
				fillKeys(obj['?to']);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				fillKeys(obj[key]);
			}
		}
		fillKeys(mega_index);

		var from_re_2 = "";
		var re = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

		function fillFromRegex(obj){
			var keys = obj['*'];
			for (var i = 0; keys && i < keys.length; i++) {
				var key = keys[i];
				//console.log(key);
				from_re_2 += (from_re_2 ? "|" + escapeRegExp(key, re) : escapeRegExp(key, re));
				var nested = obj[key];
				fillFromRegex(nested);
			}
		}
		fillFromRegex(mega_index);

		var to_re_2 = "";

		function fillToRegex(obj, skip){
			var keys = obj['*'];
			for (var i = 0; keys && i < keys.length; i++) {
				var key = keys[i];
				var nested = obj[key];
				if (skip)
					fillToRegex(nested, true);
				else
				{
					to_re_2 += (to_re_2 ? ("|" + escapeRegExp(key, re)) : escapeRegExp(key, re));
					fillToRegex(nested, false);
				}
			}
			if (skip){
				var _to_ = obj['?to'];

				if (_to_) {
					fillToRegex(_to_, false);
				}
			}
		}
		fillToRegex(mega_index, true);

		//console.log(JSON.stringify(mega_index,null, 4));

		var from_regex2 = new RegExp(from_re_2 || 'NONE\*', 'g');
		var to_regex2 = new RegExp(to_re_2 || 'NONE\*', 'g');
		return {
			from_regex : from_regex2,
			to_regex : to_regex2,
			hardRules : hardRules,
			mega_index : mega_index
		}

	})(hardRules);


	var xxx = 0;

	var from_regex = smartAlgorithm.from_regex;
	var to_regex = smartAlgorithm.to_regex;
	var hardRules = smartAlgorithm.hardRules;
	var mega_index = smartAlgorithm.mega_index;

//	console.log(hardRules.length);

	for (var z = 0, l = messages_keys.length; z < l; z++) {
		var key = messages_keys[z];
		var message = messages[key];
		var from = message.from;
		var to = message.to;


		var k1 = getVal(from, from_prefix, limit);
		var k1arr = k1 ? ['*', k1] : ['*'];

		var k2 = getVal(to, to_prefix, limit);
		var k2arr = k2 ? ['*', k2] : ['*'];

		var k3 = getVal2(from, from_suffix, limit);
		var k3arr = k3 ? ['*', k3] : ['*'];

		var k4 = getVal2(to, to_suffix, limit);
		var k4arr = k4 ? ['*', k4] : ['*'];


		var result = anyList.slice();
		for (var i = 0, len = k1arr.length; i < len; i++) {
			var k1_key = k1arr[i];
			var ind1 = megaIndex[k1_key];
			if (!ind1)
				continue;

			for (var j = 0, len2 = k2arr.length; j < len2; j++) {
				var k2_key = k2arr[j];
				var ind2 = ind1[k2_key];


				if (!ind2)
					continue;

				for (var o = 0, len3 = k3arr.length; o < len3; o++) {
					var k3_key = k3arr[o];
					var ind3 = ind2[k3_key];
					if (!ind3)
						continue;

					for (var t = 0, len4 = k4arr.length; t < len4; t++) {
						var k4_key = k4arr[t];
						var ind4 = ind3[k4_key];
						if (!ind4)
							continue;

						var insertAfter = 0;
						var rulesArray = ind4.rules;


						for (var k = 0, len5 = rulesArray.length; k < len5; k++) {
							var rule = rulesArray[k];
							var fromRegex = rule[4];
							if (fromRegex && !fromRegex.test(from)) {
								continue;
							}
							else {
								var from_startsWith = rule[5];
								if (from_startsWith && from.substring(0, from_startsWith.length) != from_startsWith)
									continue;

								var from_len = rule[7];
								if (from_len && from.length != from_len)
									continue;

								var from_endsWith = rule[6];
								if (from_endsWith && (from.substring(from.length - from_endsWith.length) != from_endsWith))
									continue;
							}

							var toRegex = rule[10];
							if (toRegex && !toRegex.test(to)) {
								continue;
							}
							else {
								var to_startsWith = rule[11];
								if (to_startsWith && to.substring(0, to_startsWith.length) != to_startsWith)
									continue;

								var to_len = rule[13];
								if (to_len && to.length != to_len)
									continue;

								var to_endsWith = rule[12];
								if (to_endsWith && (to.substring(to.length - to_endsWith.length) != to_endsWith))
									continue;
							}

							var num = rule[15];
							var toIndex = result.length - 1;
							var fromIndex = insertAfter;
							var x = result[fromIndex];
							var y = result[toIndex];
							if (num > y || !y) {
								result.push(num);
								insertAfter = toIndex;
								continue;
							}
							if (num < x) {
								result.splice(fromIndex, 0, num);
								insertAfter = 1;
								continue;
							}
							while (true) {
								if (fromIndex + 1 == toIndex) {
									result.splice(fromIndex + 1, 0, num);
									insertAfter = fromIndex;
									break;
								}
								var m = (fromIndex + toIndex + (fromIndex + toIndex) % 2) / 2;
								var middle = result[m];
								if (num > middle) {
									fromIndex = m;
								}
								else {
									toIndex = m;
								}
							}
						}
					}
				}
			}
		}


		{
			var rulesArray = hardRules;
			if (rulesArray) {
				if (rulesArray.lastVisit != z) {
					rulesArray.lastVisit = z;
					var insertAfter = 0;
					for (var k = 0; k < rulesArray.length; k++) {
						var rule = rulesArray[k];
						var ri = rule[15];
						var fromRegex = rule[4];
						if (fromRegex) {
							if (!fromRegex.test(from))
								continue;
						}
						else {
							var from_startsWith = rule[5];
							if (from_startsWith && from.substring(0, from_startsWith.length) != from_startsWith)
								continue;

							var from_len = rule[7];
							if (from_len && from.length != from_len)
								continue;

							var from_endsWith = rule[6];
							if (from_endsWith && (from.substring(from.length - from_endsWith.length) != from_endsWith))
								continue;
						}

						var toRegex = rule[10];
						if (toRegex) {
							if (!toRegex.test(to))
								continue;
						}
						else {
							var to_startsWith = rule[11];
							if (to_startsWith && to.substring(0, to_startsWith.length) != to_startsWith)
								continue;

							var to_len = rule[13];
							if (to_len && to.length != to_len)
								continue;

							var to_endsWith = rule[12];
							if (to_endsWith && (to.substring(to.length - to_endsWith.length) != to_endsWith))
								continue;
						}

						var num = ri;

						var toIndex = result.length - 1;
						var fromIndex = insertAfter;
						var x = result[fromIndex];
						var y = result[toIndex];
						if (num > y || !y) {
							result.push(num);
							insertAfter = toIndex;
							continue;
						}
						if (num < x) {
							result.splice(fromIndex, 0, num);
							insertAfter = 1;
							continue;
						}
						while (true) {
							if (fromIndex + 1 == toIndex) {
								result.splice(fromIndex + 1, 0, num);
								insertAfter = fromIndex;
								break;
							}
							var m = (fromIndex + toIndex + (fromIndex + toIndex) % 2) / 2;
							var middle = result[m];
							if (num > middle) {
								fromIndex = m;
							}
							else {
								toIndex = m;
							}
						}
					}
				}
			}
		}
		{
		}
		{
			var rulesArray = hardRules;
			if (rulesArray) {
				if (rulesArray.lastVisit != z) {
					rulesArray.lastVisit = z;
					var insertAfter = 0;
					for (var k = 0; k < rulesArray.length; k++) {
						var rule = rulesArray[k];
						var ri = rule[15];
						var fromRegex = rule[4];
						if (fromRegex) {
							if (!fromRegex.test(from))
								continue;
						}
						else {
							var from_startsWith = rule[5];
							if (from_startsWith && from.substring(0, from_startsWith.length) != from_startsWith)
								continue;

							var from_len = rule[7];
							if (from_len && from.length != from_len)
								continue;

							var from_endsWith = rule[6];
							if (from_endsWith && (from.substring(from.length - from_endsWith.length) != from_endsWith))
								continue;
						}

						var toRegex = rule[10];
						if (toRegex) {

							if (!toRegex.test(from))
								continue;
						}
						else {
							var to_startsWith = rule[11];
							if (to_startsWith && to.substring(0, to_startsWith.length) != to_startsWith)
								continue;

							var to_len = rule[13];
							if (to_len && to.length != to_len)
								continue;

							var to_endsWith = rule[12];
							if (to_endsWith && (to.substring(to.length - to_endsWith.length) != to_endsWith))
								continue;
						}

						var num = ri;
						result.push(num);
					}
				}
			}
		}

		// SMARTY!!!
		{
			var plainKeys = [];
			from_regex.lastIndex = 0;
			while (true) {
				var match = from_regex.exec(from);
				if (!match)
					break;
				var s = match[0];
				plainKeys.push(s);
				from_regex.lastIndex = from_regex.lastIndex - s.length + 1;
			}
			var from_keys = plainKeys;


			var plainKeys = [];
			to_regex.lastIndex = 0;
			while (true) {
				var match = to_regex.exec(to);
				if (!match)
					break;
				var s = match[0];
				plainKeys.push(s);
				to_regex.lastIndex = to_regex.lastIndex - s.length + 1;
			}
			var to_keys = plainKeys;


			//console.log(from_keys);
			//console.log(to_keys);

			var foundLists = [];
			for (var fi0 = 0, fi0len=from_keys.length; fi0 < fi0len; fi0++) {
				var from_key = from_keys[fi0];
				var subTreeFrom1 = mega_index[from_key];
				if (!subTreeFrom1)
					continue;
				var subTreeTo = subTreeFrom1['?to'];
				if (subTreeTo) {
					var ruleArr = subTreeTo['?'];
					if (ruleArr)
						foundLists.push(ruleArr);
					var subTreeToKeys = subTreeTo['*'];
					for (var t1 = 0, subTreeToKeysLength = subTreeToKeys.length; t1 < subTreeToKeysLength; t1++) {
						var subTreeToKey = subTreeToKeys[t1];
						var _index_1 = to_keys.indexOf(subTreeToKey, 0);
						if (_index_1 == -1)
							continue;

						var subTreeTo2 = subTreeTo[to_keys[_index_1]];
						var ruleArr = subTreeTo2['?'];
						if (ruleArr)
							foundLists.push(ruleArr);



						var subTreeToKeys2 = (subTreeTo2)['*'];
						for (var t2 = 0, subTreeToKeys2_length=subTreeToKeys2.length; t2 < subTreeToKeys2_length; t2++) {
							var subTreeToKey2 = subTreeToKeys2[t2];
							var _index_2 = to_keys.indexOf(subTreeToKey2, _index_1 + 1);
							if (_index_2 == -1)
								continue;

							var subTreeTo3 = subTreeTo2[to_keys[_index_2]];
							var ruleArr = subTreeTo3['?'];
							if (ruleArr)
								foundLists.push(ruleArr);

							var subTreeToKeys3 = (subTreeTo3)['*'];
							for (var t3 = 0; t3 < subTreeToKeys3.length; t3++) {
								var subTreeToKey3 = subTreeToKeys3[t3];
								var _index_3 = to_keys.indexOf(subTreeToKey3, _index_2 + 1);
								if (_index_3 == -1)
									continue;

								var subTreeTo4 = subTreeTo3[to_keys[_index_3]];
								var ruleArr = subTreeTo4['?'];
								if (ruleArr)
									foundLists.push(ruleArr);

								var subTreeToKeys4 = (subTreeTo4)['*'];
								for (var t4 = 0; t4 < subTreeToKeys4.length; t4++) {
									var subTreeToKey4 = subTreeToKeys4[t4];
									var _index_4 = to_keys.indexOf(subTreeToKey4, _index_3 + 1);
									if (_index_4 == -1)
										continue;
									var subTreeTo5 = subTreeTo4[to_keys[_index_4]];
									var ruleArr = subTreeTo5['?'];
									if (ruleArr)
										foundLists.push(ruleArr);
								}
							}
						}
					}
				}

				var subTreeKeys1 = (subTreeFrom1)['*'];
				for (var fi1 = 0; fi1 < subTreeKeys1.length; fi1++) {
					var subTreeKey1 = subTreeKeys1[fi1];
					var ind_1 = from_keys.indexOf(subTreeKey1, fi0);
					if (ind_1 == -1)
						continue;

					var subTreeFrom2 = subTreeFrom1[from_keys[ind_1]];
					var subTreeTo = subTreeFrom2['?to'];
					if (subTreeTo) {
						var ruleArr = subTreeTo['?'];
						if (ruleArr)
							foundLists.push(ruleArr);
						var subTreeToKeys = (subTreeTo)['*'];
						for (var t1 = 0, subTreeToKeysLength = subTreeToKeys.length; t1 < subTreeToKeysLength; t1++) {
							var subTreeToKey = subTreeToKeys[t1];
							var _index_1 = to_keys.indexOf(subTreeToKey, 0);
							if (_index_1 == -1)
								continue;

							var subTreeTo2 = subTreeTo[to_keys[_index_1]];
							var ruleArr = subTreeTo2['?'];
							if (ruleArr)
								foundLists.push(ruleArr);

							var subTreeToKeys2 = (subTreeTo2)['*'];
							for (var t2 = 0; t2 < subTreeToKeys2.length; t2++) {
								var subTreeToKey2 = subTreeToKeys2[t2];
								var _index_2 = to_keys.indexOf(subTreeToKey2, _index_1 + 1);
								if (_index_2 == -1)
									continue;

								var subTreeTo3 = subTreeTo2[to_keys[_index_2]];
								var ruleArr = subTreeTo3['?'];
								if (ruleArr)
									foundLists.push(ruleArr);

								var subTreeToKeys3 = (subTreeTo3)['*'];
								for (var t3 = 0; t3 < subTreeToKeys3.length; t3++) {
									var subTreeToKey3 = subTreeToKeys3[t3];
									var _index_3 = to_keys.indexOf(subTreeToKey3, _index_2 + 1);
									if (_index_3 == -1)
										continue;

									var subTreeTo4 = subTreeTo3[to_keys[_index_3]];
									var ruleArr = subTreeTo4['?'];
									if (ruleArr)
										foundLists.push(ruleArr);

									var subTreeToKeys4 = (subTreeTo4)['*'];
									for (var t4 = 0; t4 < subTreeToKeys4.length; t4++) {
										var subTreeToKey4 = subTreeToKeys3[t4];
										var _index_4 = to_keys.indexOf(subTreeToKey4, _index_3 + 1);
										if (_index_4 == -1)
											continue;
										var subTreeTo5 = subTreeTo4[to_keys[_index_3]];
										var ruleArr = subTreeTo5['?'];
										if (ruleArr)
											foundLists.push(ruleArr);
									}
								}
							}
						}
					}
					var subTreeKeys2 = (subTreeFrom2)['*'];
					for (var fi2 = 0; fi2 < subTreeKeys2.length; fi2++) {
						var ind_2 = from_keys.indexOf(subTreeKeys2[fi2], ind_1);
						if (ind_2 == -1)
							continue;

						var subTreeFrom3 = subTreeFrom2[from_keys[ind_2]];
						var subTreeTo = subTreeFrom3['?to'];
						if (subTreeTo) {
							var ruleArr = subTreeTo['?'];
							if (ruleArr)
								foundLists.push(ruleArr);
							var subTreeToKeys = (subTreeTo)['*'];
							for (var t1 = 0, subTreeToKeysLength = subTreeToKeys.length; t1 < subTreeToKeysLength; t1++) {
								var subTreeToKey = subTreeToKeys[t1];
								var _index_1 = to_keys.indexOf(subTreeToKey, 0);
								if (_index_1 == -1)
									continue;

								var subTreeTo2 = subTreeTo[to_keys[_index_1]];
								var ruleArr = subTreeTo2['?'];
								if (ruleArr)
									foundLists.push(ruleArr);

								var subTreeToKeys2 = (subTreeTo2)['*'];
								for (var t2 = 0; t2 < subTreeToKeys2.length; t2++) {
									var subTreeToKey2 = subTreeToKeys2[t2];
									var _index_2 = to_keys.indexOf(subTreeToKey2, _index_1 + 1);
									if (_index_2 == -1)
										continue;

									var subTreeTo3 = subTreeTo2[to_keys[_index_2]];
									var ruleArr = subTreeTo3['?'];
									if (ruleArr)
										foundLists.push(ruleArr);

									var subTreeToKeys3 = (subTreeTo3)['*'];
									for (var t3 = 0; t3 < subTreeToKeys3.length; t3++) {
										var subTreeToKey3 = subTreeToKeys3[t3];
										var _index_3 = to_keys.indexOf(subTreeToKey3, _index_2 + 1);
										if (_index_3 == -1)
											continue;

										var subTreeTo4 = subTreeTo3[to_keys[_index_3]];
										var ruleArr = subTreeTo4['?'];
										if (ruleArr)
											foundLists.push(ruleArr);

										var subTreeToKeys4 = (subTreeTo4)['*'];
										for (var t4 = 0; t4 < subTreeToKeys4.length; t4++) {
											var subTreeToKey4 = subTreeToKeys3[t4];
											var _index_4 = to_keys.indexOf(subTreeToKey4, _index_3 + 1);
											if (_index_4 == -1)
												continue;
											var subTreeTo5 = subTreeTo4[to_keys[_index_3]];
											var ruleArr = subTreeTo5['?'];
											if (ruleArr)
												foundLists.push(ruleArr);
										}
									}
								}
							}
						}

						var subTreeKeys3 = (subTreeFrom3)['*'];
						for (var fi3 = 0; fi3 < subTreeKeys3.length; fi3++) {
							var ind_3 = from_keys.indexOf(subTreeKeys3[fi3], ind_2);
							if (ind_3 == -1)
								continue;

							var subTreeFrom4 = subTreeFrom3[from_keys[ind_3]];
							var subTreeTo = subTreeFrom4['?to'];
							if (subTreeTo) {
								var ruleArr = subTreeTo['?'];
								if (ruleArr)
									foundLists.push(ruleArr);
								var subTreeToKeys = (subTreeTo)['*'];
								for (var t1 = 0, subTreeToKeysLength = subTreeToKeys.length; t1 < subTreeToKeysLength; t1++) {
									var subTreeToKey = subTreeToKeys[t1];
									var _index_1 = to_keys.indexOf(subTreeToKey, 0);
									if (_index_1 == -1)
										continue;

									var subTreeTo2 = subTreeTo[to_keys[_index_1]];
									var ruleArr = subTreeTo2['?'];
									if (ruleArr)
										foundLists.push(ruleArr);

									var subTreeToKeys2 = (subTreeTo2)['*'];
									for (var t2 = 0; t2 < subTreeToKeys2.length; t2++) {
										var subTreeToKey2 = subTreeToKeys2[t2];
										var _index_2 = to_keys.indexOf(subTreeToKey2, _index_1 + 1);
										if (_index_2 == -1)
											continue;

										var subTreeTo3 = subTreeTo2[to_keys[_index_2]];
										var ruleArr = subTreeTo3['?'];
										if (ruleArr)
											foundLists.push(ruleArr);

										var subTreeToKeys3 = (subTreeTo3)['*'];
										for (var t3 = 0; t3 < subTreeToKeys3.length; t3++) {
											var subTreeToKey3 = subTreeToKeys3[t3];
											var _index_3 = to_keys.indexOf(subTreeToKey3, _index_2 + 1);
											if (_index_3 == -1)
												continue;

											var subTreeTo4 = subTreeTo3[to_keys[_index_3]];
											var ruleArr = subTreeTo4['?'];
											if (ruleArr)
												foundLists.push(ruleArr);

											var subTreeToKeys4 = (subTreeTo4)['*'];
											for (var t4 = 0; t4 < subTreeToKeys4.length; t4++) {
												var subTreeToKey4 = subTreeToKeys3[t4];
												var _index_4 = to_keys.indexOf(subTreeToKey4, _index_3 + 1);
												if (_index_4 == -1)
													continue;
												var subTreeTo5 = subTreeTo4[to_keys[_index_3]];
												var ruleArr = subTreeTo5['?'];
												if (ruleArr)
													foundLists.push(ruleArr);
											}
										}
									}
								}
							}

							var subTreeKeys4 = (subTreeFrom4)['*'];
							for (var fi4 = 0; fi4 < subTreeKeys4.length; fi4++) {
								var ind_4 = from_keys.indexOf(subTreeKeys4[fi4], ind_3);
								if (ind_4 == -1)
									continue;

								var subTreeFrom5 = subTreeFrom3[from_keys[ind_3]];
								var subTreeTo = subTreeFrom5['?to'];
								if (subTreeTo) {
									var ruleArr = subTreeTo['?'];
									if (ruleArr)
										foundLists.push(ruleArr);
									var subTreeToKeys = (subTreeTo)['*'];
									for (var t1 = 0, subTreeToKeysLength = subTreeToKeys.length; t1 < subTreeToKeysLength; t1++) {
										var subTreeToKey = subTreeToKeys[t1];
										var _index_1 = to_keys.indexOf(subTreeToKey, 0);
										if (_index_1 == -1)
											continue;

										var subTreeTo2 = subTreeTo[to_keys[_index_1]];
										var ruleArr = subTreeTo2['?'];
										if (ruleArr)
											foundLists.push(ruleArr);

										var subTreeToKeys2 = (subTreeTo2)['*'];
										for (var t2 = 0; t2 < subTreeToKeys2.length; t2++) {
											var subTreeToKey2 = subTreeToKeys2[t2];
											var _index_2 = to_keys.indexOf(subTreeToKey2, _index_1 + 1);
											if (_index_2 == -1)
												continue;

											var subTreeTo3 = subTreeTo2[to_keys[_index_2]];
											var ruleArr = subTreeTo3['?'];
											if (ruleArr)
												foundLists.push(ruleArr);

											var subTreeToKeys3 = (subTreeTo3)['*'];
											for (var t3 = 0; t3 < subTreeToKeys3.length; t3++) {
												var subTreeToKey3 = subTreeToKeys3[t3];
												var _index_3 = to_keys.indexOf(subTreeToKey3, _index_2 + 1);
												if (_index_3 == -1)
													continue;

												var subTreeTo4 = subTreeTo3[to_keys[_index_3]];
												var ruleArr = subTreeTo4['?'];
												if (ruleArr)
													foundLists.push(ruleArr);

												var subTreeToKeys4 = (subTreeTo4)['*'];
												for (var t4 = 0; t4 < subTreeToKeys4.length; t4++) {
													var subTreeToKey4 = subTreeToKeys3[t4];
													var _index_4 = to_keys.indexOf(subTreeToKey4, _index_3 + 1);
													if (_index_4 == -1)
														continue;
													var subTreeTo5 = subTreeTo4[to_keys[_index_3]];
													var ruleArr = subTreeTo5['?'];
													if (ruleArr)
														foundLists.push(ruleArr);
												}
											}
										}
									}
								}

							}

						}

					}
				}
			}

			var to_tree = mega_index['?to'];
			if (to_tree) {

				for (var i = 0, tlen0=to_keys.length; i < tlen0; i++) {
					var to_key = to_keys[i];
					var subTreeTo = to_tree[to_key];

					if (subTreeTo) {
						var ruleArr = subTreeTo['?'];
						if (ruleArr)
							foundLists.push(ruleArr);
						var subTreeToKeys = (subTreeTo)['*'];
						for (var t1 = 0, subTreeToKeysLength = subTreeToKeys.length; t1 < subTreeToKeysLength; t1++) {
							var subTreeToKey = subTreeToKeys[t1];
							var _index_1 = to_keys.indexOf(subTreeToKey, 0);
							if (_index_1 == -1)
								continue;

							var subTreeTo2 = subTreeTo[to_keys[_index_1]];
							var ruleArr = subTreeTo2['?'];
							if (ruleArr)
								foundLists.push(ruleArr);

							var subTreeToKeys2 = (subTreeTo2)['*'];
							for (var t2 = 0; t2 < subTreeToKeys2.length; t2++) {
								var subTreeToKey2 = subTreeToKeys2[t2];
								var _index_2 = to_keys.indexOf(subTreeToKey2, _index_1 + 1);
								if (_index_2 == -1)
									continue;

								var subTreeTo3 = subTreeTo2[to_keys[_index_2]];
								var ruleArr = subTreeTo3['?'];
								if (ruleArr)
									foundLists.push(ruleArr);

								var subTreeToKeys3 = (subTreeTo3)['*'];
								for (var t3 = 0; t3 < subTreeToKeys3.length; t3++) {
									var subTreeToKey3 = subTreeToKeys3[t3];
									var _index_3 = to_keys.indexOf(subTreeToKey3, _index_2 + 1);
									if (_index_3 == -1)
										continue;

									var subTreeTo4 = subTreeTo3[to_keys[_index_3]];
									var ruleArr = subTreeTo4['?'];
									if (ruleArr)
										foundLists.push(ruleArr);

									var subTreeToKeys4 = (subTreeTo4)['*'];
									for (var t4 = 0; t4 < subTreeToKeys4.length; t4++) {
										var subTreeToKey4 = subTreeToKeys3[t4];
										var _index_4 = to_keys.indexOf(subTreeToKey4, _index_3 + 1);
										if (_index_4 == -1)
											continue;
										var subTreeTo5 = subTreeTo4[to_keys[_index_3]];
										var ruleArr = subTreeTo5['?'];
										if (ruleArr)
											foundLists.push(ruleArr);
									}
								}
							}
						}
					}
				}
			}
			//	console.log(foundLists.length);

			for (var i = 0; i < foundLists.length; i++) {
				var rulesArray = foundLists[i];

				if (rulesArray) {
					if (rulesArray.lastVisit != z) {
						rulesArray.lastVisit = z;
						var insertAfter = 0;
						for (var k = 0; k < rulesArray.length; k++) {
							var rule = rulesArray[k];
							var ri = rule[15];
							var fromRegex = rule[4];
							if (fromRegex) {
								if (!fromRegex.test(from))
									continue;
							}
							else {
								var from_startsWith = rule[5];
								if (from_startsWith && from.substring(0, from_startsWith.length) != from_startsWith)
									continue;

								var from_len = rule[7];
								if (from_len && from.length != from_len)
									continue;

								var from_endsWith = rule[6];
								if (from_endsWith && (from.substring(from.length - from_endsWith.length) != from_endsWith))
									continue;
							}

							var toRegex = rule[10];
							if (toRegex) {
								if (!toRegex.test(to))
									continue;
							}
							else {
								var to_startsWith = rule[11];
								if (to_startsWith && to.substring(0, to_startsWith.length) != to_startsWith)
									continue;

								var to_len = rule[13];
								if (to_len && to.length != to_len)
									continue;

								var to_endsWith = rule[12];
								if (to_endsWith && (to.substring(to.length - to_endsWith.length) != to_endsWith))
									continue;
							}

							var num = ri;

							var toIndex = result.length - 1;
							var fromIndex = insertAfter;
							var x = result[fromIndex];
							var y = result[toIndex];
							if (num > y || !y) {
								result.push(num);
								insertAfter = toIndex;
								continue;
							}
							if (num < x) {
								result.splice(fromIndex, 0, num);
								insertAfter = 1;
								continue;
							}
							while (true) {
								if (fromIndex + 1 == toIndex) {
									result.splice(fromIndex + 1, 0, num);
									insertAfter = fromIndex;
									break;
								}
								var m = (fromIndex + toIndex + (fromIndex + toIndex) % 2) / 2;
								var middle = result[m];
								if (num > middle) {
									fromIndex = m;
								}
								else {
									toIndex = m;
								}
							}
						}
					}
				}
			}
		}
		var out = [];
		for (var i = 0, len9 = result.length; i < len9; i++) {
			out.push(actions[result[i]]);
		}
		messages[key] = out;
//		console.log(xxx);
	}
	return messages;

};

module.exports.filter = filter;