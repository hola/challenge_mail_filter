var asterisk = "*".charCodeAt(0);
var question = "?".charCodeAt(0);

function Pattern(str) {
	this.frontNull = str.charCodeAt(0) === asterisk;
	this.front = [];
	this.middle = [];
	this.backNull = str.charCodeAt(str.length - 1) === asterisk;
	this.back = [];
	this.word = str.indexOf("*") === - 1;
	this.sum = 0;

	var fr = true;
	for (var i = 0; i < str.length;) {
		if (str.charCodeAt(i) === asterisk) {
			++i;
			continue;
		}

		var curr = [];
		var j = i;

		for (; j < str.length; ++j) {
			if (str.charCodeAt(j) === asterisk)
				break;

			curr.push(str.charCodeAt(j));
		}

		if (fr && !this.frontNull) {
			this.front = curr;
			fr = false;
		}
		else if (j === str.length && !this.backNull) {
			this.back = curr;
		}
		else {
			this.middle.push(curr);
		}

		i = j;
	}

	this.sum = this.front.length + this.back.length;
	for (var i = 0; i < this.middle.length; ++i)
		this.sum += this.middle[i].length;
};

Pattern.prototype.match = function(str) {
	if (this.word && this.front.length !== str.length)
		return false;

	if (this.sum > str.length)
		return false;

	var pos = 0;
	var count = 0;

	// front
	var begin = this.front.length;
	var frontMatch = false;

	if (!this.frontNull) {
		count = 0;
		for (var i = 0; i < this.front.length; ++i) {
			if (this.front[i] === str.charCodeAt(i) || this.front[i] === question)
				count++;
		}
		frontMatch = count === this.front.length;
	}

	// back
	var end = str.length - this.back.length;
	var backMatch = false;

	if (!this.backNull) {
		count = 0;
		for (var i = 0; i < this.back.length; ++i) {
			if (this.back[i] === str.charCodeAt(end + i) || this.back[i] === question)
				count++;
		}
		backMatch = count === this.back.length;
	}

	// middle
	var fragIndex = 0;

	while (begin < end && fragIndex < this.middle.length) {
		pos = 0;
		count = 0;

		var fragment = this.middle[fragIndex];
	
		while (pos < fragment.length && begin + pos < end) {
			if (str.charCodeAt(begin + pos) === fragment[pos] || fragment[pos] === question)
				count++;

			pos++;
		}

		if (count === fragment.length) {
			begin += fragment.length;
			fragIndex++;
		}
		else {
			begin++;
		}
	}

	return (this.frontNull || frontMatch) && (fragIndex === this.middle.length) && (this.backNull || backMatch);
};

function filter(messages, rules) {
	// rules
	var any = new Pattern("*");
	for (var i = 0; i < rules.length; ++i) {
		var rule = rules[i];

		if ("from" in rule)
			rule.from = new Pattern(rule.from);
		else
			rule.from = any;

		if ("to" in rule)
			rule.to = new Pattern(rule.to);
		else
			rule.to = any;
	}

	// main loop
	var keys = Object.keys(messages);
	for (var i = 0; i < keys.length; ++i) {
		var key = keys[i];
		var message = messages[key];
		var a = [];

		for (var j = 0; j < rules.length; ++j) {
			var rule = rules[j];
			if (rule.from.match(message.from) && rule.to.match(message.to))
				a.push(rule.action);
		}
		messages[key] = a;
	}

	return messages;
};

module.exports = filter;
