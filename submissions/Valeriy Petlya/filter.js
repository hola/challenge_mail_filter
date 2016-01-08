/**
 * Author: Valera
 * E-mail: vp_inbox@ukr.net
 * Date: 04.12.15
 * Time: 15:51
 */

function arraySortPlus(array1, array2) {
	var result = new Array(array1.length + array2.length);
	if (array1.length == 0) {
		for (var i = 0; i < array2.length; i++) {
			result[i] = array2[i];
		}
	} else if (array2.length == 0) {
		for (var i = 0; i < array1.length; i++) {
			result[i] = array1[i];
		}
	} else {
		for (var i = 0, j = 0, k = 0; i < result.length; i++) {
			if (k >= array2.length || array1[j] <= array2[k]) {
				result[i] = array1[j++];
			} else {
				result[i] = array2[k++];
			}
		}
	}
	return result;
}

/* finds the intersection of
 * two arrays in a simple fashion.
 *
 * PARAMS
 *  a - first array, must already be sorted
 *  b - second array, must already be sorted
 *
 * NOTES
 *
 *  Should have O(n) operations, where n is
 *    n = MIN(a.length(), b.length())
 */
function arrayIntersect(a, b) {
	var ai = 0, bi = 0;
	var result = new Array();

	while (ai < a.length && bi < b.length) {
		if (a[ai] < b[bi]) {
			ai++;
		}
		else if (a[ai] > b[bi]) {
			bi++;
		}
		else /* they're equal */
		{
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}

	return result;
}

var RulesTree = function () {
	var root = {children: {}, /*count: 0,*/ values: []};
	this.nodes = 0;

	this.addRule = function (rule, index) {
		var currNode = root;
		for (var part = 0; part < rule.length; part++) {
			for (var i = 0; i < rule[part].length; i++) {
				var symb = rule[part].charAt(i);
				if (part + 1 == rule.length && symb == '*') symb = "**";
				if (currNode.children[symb]) {
					currNode = currNode.children[symb];
				} else {
					//currNode.count++;
					this.nodes++;
					currNode = currNode.children[symb] = {children: {}, /* count: 0,*/ values: []};
				}
			}
		}
		currNode.values.push(+index);
	}

	var recursiveFind = function (o, pos, currNode) {
		if (pos >= o.str.length) {
			//arrayPlus(o.result, currNode.values);
			//o.result = o.result.concat(currNode.values);
			o.result = arraySortPlus(o.result, currNode.values);
			if (currNode.children["**"]) {
				//arrayPlus(o.result, currNode.children["**"].values);
				//o.result = o.result.concat(currNode.children["**"].values);
				o.result = arraySortPlus(o.result, currNode.children["**"].values);
			}
			return;
		}

		if (currNode.children[o.str[pos]]) {
			recursiveFind(o, pos + 1, currNode.children[o.str[pos]]);
		}
		if (currNode.children["?"]) {
			recursiveFind(o, pos + 1, currNode.children["?"]);
		}
		if (currNode.children["*"]) {
			for (var i = pos; i < o.str.length; i++) {
				var tmp = o.result.length;
				recursiveFind(o, i, currNode.children["*"]);
				if (o.result.length > tmp) break; //не жадный
			}
		}
		if (currNode.children["**"]) {
			//arrayPlus(o.result, currNode.children["**"].values);
			//o.result = o.result.concat(currNode.children["**"].values);
			o.result = arraySortPlus(o.result, currNode.children["**"].values);
		}
	}
	this.getRulesByEmail = function (o) {
		recursiveFind(o, 0, root);
	}
}

var ConstRulesTree = function () {
	var root = {};
	this.nodes = 0;

	this.addRule = function (rule, index) {
		if (root[rule.length]) {
			var currNode = root[rule.length];
		} else {
			currNode = root[rule.length] = {children: {}, /*count: 0,*/ values: []};
		}

		for (var i = 0; i < rule.length; i++) {
			var symb = rule.charAt(i);
			if (currNode.children[symb]) {
				currNode = currNode.children[symb];
			} else {
				//currNode.count++;
				this.nodes++;
				currNode = currNode.children[symb] = {children: {}, /* count: 0,*/ values: []};
			}
		}
		currNode.values.push(index);
	}

	var recursiveFind = function (o, pos, currNode) {
		if (pos >= o.str.length) {
			//arrayPlus(o.result, currNode.values);
			//o.result = o.result.concat(currNode.values);
			o.result = arraySortPlus(o.result, currNode.values);
			return;
		}

		if (currNode.children[o.str[pos]]) {
			recursiveFind(o, pos + 1, currNode.children[o.str[pos]]);
		}
		if (currNode.children["?"]) {
			recursiveFind(o, pos + 1, currNode.children["?"]);
		}
	}

	this.getRulesByEmail = function (o) {
		if (root[o.str.length]) {
			recursiveFind(o, 0, root[o.str.length]);
		}
	}
}

var ComboTree = function () {
	this.all = [];
	this.mask = new RulesTree();
	this.const = new ConstRulesTree();

	var cache = {};
	var cacheInfo = null;
	var cacheCount = 0;
	var cacheLimit = 0;

	this.cacheExist = function (key) {
		if (cacheInfo == null) return false;
		return cache[key/*.toLowerCase()*/] != undefined;
	}

	this.addRule = function (regexps, info, index) {
		regexps[index] = new RegExp(info.regExpMask);

		if (info.rule.length == 1 && info.rule[0] == "*") {
			this.all.push(index);
		} else if (info.unknown) {
			this.mask.addRule(info.rule, index);
		} else {
			this.const.addRule(info.rule.join(''), index);
		}
	}

	this.setCacheArray = function (data, useLimit) {
		cacheCount = cacheLimit = useLimit;
		cacheInfo = data;
		this.getRulesByEmail = getRulesByEmailWithCache;
	}

	this.updateCache = function () {
		//console.time('   updateCache');
		var i;
		var newInfo = {};
		var newCache = {};
		var count = 0;
		for (i in cacheInfo) {
			if (cacheInfo[i] > 1) {
				newInfo[i] = cacheInfo[i];
				newCache[i] = cache[i];
				count++;
			}
		}
		cacheInfo = newInfo;
		cache = newCache;
		cacheLimit = count;
		//console.timeEnd('   updateCache');
	}

	var getRulesByEmailWithCache = function (key) {
		//var key = key.toLowerCase();
		var result;
		if (cache[key]) {
			result = cache[key];
			cacheInfo[key] -= 1;
			if (cacheInfo[key] <= 1) {
				cacheCount -= 1;
				//if (cacheCount*2 < cacheLimit) this.updateCache();
				delete cacheInfo[key];
				delete cache[key];
				if (cacheCount < 2) this.getRulesByEmail = getRulesByEmailWithoutCache;
			}
			return result;
		}
		result = getRulesByEmailWithoutCache.apply(this, [key]);

		if (cacheInfo[key] > 1) {
			cache[key] = result;
		}

		return result;
	}

	var getRulesByEmailWithoutCache = function (key) {
		var o = {str: key, result: []};
		var result = this.all;
		this.mask.getRulesByEmail(o);
		this.const.getRulesByEmail(o);
		if (o.result.length > 0) {
			result = arraySortPlus(result, o.result);
			//result.sort(function (a, b) {return a - b;});
		}

		return result;
	}

	this.getRulesByEmail = getRulesByEmailWithoutCache;
}

// ========================================== MAIN CODE ==========================================
var FILTER = function (messages, rules) {
	//console.time('Filter');
	const switchLimit = 30;

	var fromTrees;// = new ComboTree();
	var toTrees;// = new ComboTree();

	var fromRegexps;// = [];
	var toRegexps;// = [];

	this.prepareRule = function (rule) {
		var result = [];
		var prevPos = 0;
		var regExpMask = "^";
		var count0 = 0, count1 = 0;
		var sum = 0, sum0 = 0 , sum1 = 0;
		for (var i = 0; i <= rule.length; i++) {
			var symb = rule.charAt(i);
			if (i < rule.length && symb == '?') count0++;
			else if (i < rule.length && symb == '*') count1++;
			else if (i == rule.length || count0 > 0 || count1 > 0) {
				var len = i - prevPos - (count0 + count1);
				if (len > 0) {
					result.push(rule.substr(prevPos, len));
					regExpMask += rule.substr(prevPos, len).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					sum += len;
				}
				if (count0 > 0 || count1 > 0) {
					if (count0 > 0) {
						var str = new Array(count0 + 1).join("?");
						if (count1 > 0) {
							result.push(str + "*");
							regExpMask += ".{" + count0 + ",}?";
						} else {
							result.push(str);
							regExpMask += ".{" + count0 + "}";
						}
					} else {
						result.push("*");
						regExpMask += ".*?";
					}
					sum0 += count0;
					sum1 += count1;
					count1 = count0 = 0;
				}
				prevPos = i;
			}
		}
		regExpMask += "$";

		return {rule: result, regExpMask: regExpMask, minLength: sum + sum0, unknown: sum1 > 0};
	}

	this.loadRules = function (rules) {
		//console.time('   make tree and regexp');
		fromTrees = new ComboTree();
		toTrees = new ComboTree();

		fromRegexps = [];
		toRegexps = [];

		var i, j;
		for (i  in rules) {
			if (rules[i].from) {
				fromTrees.addRule(fromRegexps, this.prepareRule(rules[i].from), +i);
			} else {
				fromTrees.addRule(fromRegexps, {rule: ["*"], regExpMask: ".*", minLength: 0, unknown: true}, +i);
			}
			if (rules[i]['to']) {
				toTrees.addRule(toRegexps, this.prepareRule(rules[i].to), +i);
			} else {
				toTrees.addRule(toRegexps, {rule: ["*"], regExpMask: ".*", minLength: 0, unknown: true}, +i);
			}
		}
		//console.timeEnd('   make tree and regexp');
	}

	var calcCache = function (messages) {
		//console.time('   calc cache');
		var fromCacheCount = {};
		var toCacheCount = {};

		var i, j, count = 0, hits = 0;
		for (i  in messages) {
			var key = messages[i].from;//.toLowerCase();
			if (fromCacheCount[key] != undefined) {
				fromCacheCount[key] += 1;
				if (fromCacheCount[key] > 1) hits++;
			} else fromCacheCount[key] = 1;

			key = messages[i].to;//.toLowerCase();
			if (toCacheCount[key] != undefined) {
				toCacheCount[key] += 1;
				if (toCacheCount[key] > 1) hits++;
			} else toCacheCount[key] = 1;

			count++;
			if (count > 1000 && hits / (count * 2.0) < 0.1) {
				//console.log('   bad hits: ' + (hits / (count * 2.0)));
				break;
			}
		}

		if (hits > 0) {
			var tmp = {};
			count = 0;
			for (i in fromCacheCount) {
				if (fromCacheCount[i] > 1) {
					tmp[i] = fromCacheCount[i];
					count++;
				}
			}
			fromTrees.setCacheArray(tmp, count);
			tmp = {};
			count = 0;
			for (i in toCacheCount) {
				if (toCacheCount[i] > 1) {
					tmp[i] = toCacheCount[i];
					count++;
				}
			}
			toTrees.setCacheArray(tmp, count);
		}
		//console.timeEnd('   calc cache');
	}

	var findByRegExp = function () {
		var result = {};
		var i, j;
		for (i in messages) {
			result[i] = [];
			for (j in rules) {
				if (fromRegexps[j].test(messages[i].from) && toRegexps[j].test(messages[i].to)) {
					result[i].push(rules[j].action);
				}
			}
		}
		return result;
	}

	var findByTree = function () {
		var result = {};
		var remaining, remaining2, intersection;
		var i, j;
		for (i  in messages) {
			result[i] = [];
			if (fromTrees.cacheExist(messages[i].from) || !toTrees.cacheExist(messages[i].to) && (fromTrees.mask.nodes + fromTrees.const.nodes < toTrees.mask.nodes + toTrees.const.nodes)) {
				remaining = fromTrees.getRulesByEmail(messages[i].from);
				if (remaining.length > 0) {
					if (remaining.length > switchLimit) {
						remaining2 = toTrees.getRulesByEmail(messages[i].to);
						intersection = arrayIntersect(remaining, remaining2);
						for (j in intersection) {
							result[i].push(rules[intersection[j]].action);
						}
					} else {
						for (j in remaining) {
							if (toRegexps[remaining[j]].test(messages[i].to)) {
								result[i].push(rules[remaining[j]].action);
							}
						}
					}
				}
			} else {
				remaining = toTrees.getRulesByEmail(messages[i].to);
				if (remaining.length > 0) {
					if (remaining.length > switchLimit) {
						remaining2 = fromTrees.getRulesByEmail(messages[i].from);
						intersection = arrayIntersect(remaining, remaining2);
						for (j in intersection) {
							result[i].push(rules[intersection[j]].action);
						}
					} else {
						for (j in remaining) {
							if (fromRegexps[remaining[j]].test(messages[i].from)) {
								result[i].push(rules[remaining[j]].action);
							}
						}
					}
				}
			}
		}
		return result;
	}

	this.loadRules(rules);

	var result;
	if (rules.length <= switchLimit) {
		//console.time('   find by regexp');
		var result = {};
		var i, j;
		for (i in messages) {
			result[i] = [];
			for (j in rules) {
				if (fromRegexps[j].test(messages[i].from) && toRegexps[j].test(messages[i].to)) {
					result[i].push(rules[j].action);
				}
			}
		}
		//result = findByRegExp(); //closure is bad :)
		//console.timeEnd('   find by regexp');
	} else {
		//console.time('   find by tree and regexp');
		calcCache(messages);
		result = findByTree();
		//console.timeEnd('   find by tree and regexp');
	}

	//console.timeEnd('Filter');
	return result;
}

if (typeof module != 'undefined') module.exports = FILTER;