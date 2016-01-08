module.exports = function filter(messages, rules) {
	var result = {};
	var cache = [[], []];
	var rules_index = [{ nodes: {}, numbers: [] }, { nodes: {}, numbers: [] }];
	var default_rules = [];
	var keys = Object.keys(messages);
	var rulesLength = rules.length;
	var keysLength = keys.length;
	var parts = [[], []];

	// var begin = process.hrtime();

	// indexing
	for (var i = 0; i < rulesLength; i++) {
		var rule = rules[i];
		var masks = [rule.from, rule.to];
		for (var n = 0; n < 2; n++) {
			var mask = masks[n];
			if (mask !== undefined && mask !== '*') {
				var f = reFactory(mask);
				cache[n][i] = f.re;
				parts[n][i] = f.parts;
				var node = rules_index[n];
				for (var j = 0; j < mask.length; j++) {
					var p = mask[j];
					if (p === '*' || p === '?') {
						break;
					}
					var next = node.nodes[p];
					if (next === undefined) {
						next = { numbers: [], nodes: {}, count: 0 };
						node.nodes[p] = next;
					}
					next.count++;
					node = next;
				}
				node.numbers.push(i);
			}
			else {
				cache[n][i] = null;
				rules_index[n].numbers.push(i);
			}
		}
		if (cache[0][i] === null && cache[1][i] === null) {
			rules_index[0].numbers.splice(rules_index[0].numbers.length - 1, 1);
			rules_index[1].numbers.splice(rules_index[1].numbers.length - 1, 1);
			default_rules.push(i);
		}
	}

	// var delta = process.hrtime(begin);
	// console.log("Indexed by: " + (delta[0] * 1000 + delta[1] / Math.pow(10, 6)).toFixed(3) + " ms");

	// merging with default_numbers	
	for (var n = 0; n < 2; n++) {
		var nodes = [rules_index[n]];
		while (nodes.length > 0) {
			var next_level = [];
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var children = Object.keys(node.nodes);
				if (node.count === 1 && children.length) {
					var child = node.nodes[children[0]];
					while(children.length){
						children = Object.keys(child.nodes);
						if(children.length){
							child = child.nodes[children[0]];
						}
					}
					node.numbers = merge(node.numbers, child.numbers);
					node.nodes = {};
				} else {
					for (var k = 0; k < children.length; k++) {
						var child = node.nodes[children[k]];
						child.numbers = merge(child.numbers, node.numbers);
						next_level.push(child);
					}
				}
			}
			nodes = next_level;
		}
	}

	// var delta = process.hrtime(begin);
	// console.log("Indexed by: " + (delta[0] * 1000 + delta[1] / Math.pow(10, 6)).toFixed(3) + " ms");
	// console.log(JSON.stringify(rules_index))
	
	// run checks
	for (var i = 0; i < keysLength; i++) {
		var key = keys[i];
		var msg = messages[key];
		var passed = [];
		var values = [msg.from, msg.to];
		var rule_numbers = [];
		for (var n = 0; n < 2; n++) {
			var value = values[n];
			var node = rules_index[n];
			for (var j = 0; j < value.length; j++) {
				var p = value[j];
				var next = node.nodes[p];
				if (next === undefined)
					break;
				node = next;
			}
			rule_numbers[n] = node.numbers;;
		}
		rule_numbers = intersect(rule_numbers[0], rule_numbers[1]);
		for (var n = 0; n < rule_numbers.length; n++) {
			var num = rule_numbers[n];
			var matched = true;
			for (var k = 0; k < 2; k++) {
				var re = cache[k][num];
				var value = values[k];
				if (re !== null) {
					var mask_parts = parts[k][num];
					for (var pi = 0; pi < mask_parts.length; pi++) {
						var mask_part = mask_parts[pi];
						if (value.indexOf(mask_part) === -1) {
							matched = false;
							break;
						}
					}
					if (!matched)
						break;
					if (!re.test(value)) {
						matched = false;
						break;
					}
				}
			}
			if (matched)
				passed.push(num);
		}

		passed = merge(passed, default_rules);
		var actions = [];
		for (var n = 0; n < passed.length; n++) {
			actions.push(rules[passed[n]].action);
		}
		result[key] = actions;
	}
	return result;
}

function intersect(a1, a2) {
	var i1 = 0;
	var i2 = 0;
	var combined = [];
	while (i1 < a1.length && i2 < a2.length) {
		var num1 = a1[i1];
		var num2 = a2[i2];
		if (num1 < num2) {
			i1++;
			continue;
		}
		if (num2 < num1) {
			i2++;
			continue;
		}
		if (num1 === num2) {
			combined.push(num1);
			i1++;
			i2++;
		}
	}
	return combined;
}


function merge(a1, a2) {
	if (a1.length === 0)
		return a2;
	if (a2.length === 0)
		return a1;
	var i1 = 0;
	var i2 = 0;
	var combined = [];
	while (i1 < a1.length && i2 < a2.length) {
		var num1 = a1[i1];
		var num2 = a2[i2];
		if (num1 < num2) {
			combined.push(num1);
			i1++;
			continue;
		}
		if (num2 < num1) {
			combined.push(num2);
			i2++;
			continue;
		}
		if (num1 === num2) {
			combined.push(num1);
			i1++;
			i2++;
		}
	}
	while (i1 < a1.length) {
		combined.push(a1[i1++]);
	}
	while (i2 < a2.length) {
		combined.push(a2[i2++]);
	}
	return combined;
}

function reFactory(mask) {
	var escapeRegexp = new RegExp("[\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|]", "g");
	var parts = mask.split('*');
	var reg_parts = ["^"];
	var mean_parts = [];
	for (var i = 0; i < parts.length; i++) {
		if (i > 0)
			reg_parts.push(".*");
		var part = parts[i];
		if (part.length > 0) {
			var sections = part.split("?");
			for (var n = 0; n < sections.length; n++) {
				if (n > 0)
					reg_parts.push(".");
				var section = sections[n];
				if (section.length > 0) {
					reg_parts.push(section.replace(escapeRegexp, "\\$&"));
					mean_parts.push(section);
				}
			}
		}
	}
	reg_parts.push("$");
	return { re: new RegExp(reg_parts.join("")), parts: mean_parts };
}