(function (exports) {
	exports.filter = filter;

	function filter(messages, rules) {
		var regexCache = new RegexCache();
		var resultCache = new Map();

		var result = {};

		Object.keys(messages).forEach(function (key) {
			var message = messages[key];
			var id = encode(message);

			if (!resultCache.has(id)) {
				resultCache.set(id, rules
					.filter(rule => applies(rule, message))
					.map(rule => rule.action));
			}

			result[key] = resultCache.get(id);
		});

		return result;

		function applies(rule, message) {
			return (!rule.from || regexCache.toRegExp(rule.from).test(message.from)) &&
				(!rule.to || regexCache.toRegExp(rule.to).test(message.to));
		}
	}

	function RegexCache() {
		this.cache = new Map();
	}

	RegexCache.prototype.toRegExp = function (str) {
		if (!this.cache.has(str)) {
			this.cache.set(str, new RegExp('^' + str.replace(/\?|\*/g, x => '.' + x) + '$'));
		}

		return this.cache.get(str);
	};

	function encode(message) {
		return message.from + ';' + message.to;
	}
})(exports);