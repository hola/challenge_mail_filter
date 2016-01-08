module _ {
	interface IMessage {
		from: string;
		to: string;
	}

	interface IRule {
		from?: string;
		to?: string;
		action: string;
		arrayFrom?: number[];
		arrayTo?: number[];
		fromEmpty?: boolean;
		toEmpty?: boolean;
	}

	var star = '*'.charCodeAt(0);
	var questionMark = '?'.charCodeAt(0);


	export function filter(
		messages: { [index: string]: IMessage },
		rules: IRule[]
	): { [index: string]: string[] } {
		preprocessRules(rules);
		return processMessages(messages, rules);
	}

	function preprocessRules(rules: IRule[]) {
		var rLength = rules.length;
		for (var i = 0; i < rLength; i++) {
			var rule = rules[i];
			if (rule.from === "*") {
				rule.from = null;
			}
			rule.fromEmpty = !rule.from;
			rule.arrayFrom = strToArray(rule.from);

			if (rule.to === "*") {
				rule.to = null;
			}

			rule.toEmpty = !rule.to;
			rule.arrayTo = strToArray(rule.to);
		}
	}


	function processMessages(
		messages: { [index: string]: IMessage },
		rules: IRule[]
	): { [index: string]: string[] } {
		var result: { [index: string]: string[] } = {};
		var rLength = rules.length;
		for (var key in messages) {
			var msg = messages[key];

			var m: string[] = [];
			var from = strToArray(msg.from);
			var to = strToArray(msg.to);

			for (var i = 0; i < rLength; i++) {
				var rule = rules[i];
				if ((rule.fromEmpty
						|| matchWildcard(from, rule.arrayFrom)
					)
					&& (rule.toEmpty
						|| matchWildcard(to, rule.arrayTo))
				) {
					m.push(rule.action);
				}
			}
			result[key] = m;
		}
		return result;
	}


	function strToArray(str: string): number[] {
		var result = null;
		if (str) {
			var l = str.length;
			result = new Array<number>(l);
			for (var i = 0; i < l; i++) {
				result[i] = str.charCodeAt(i);
			}
		}
		return result;
	}



	function matchWildcard(str: number[], pattern: number[]): boolean {
		var sIndex = 0;
		var pIndex = 0;

		var starIndex = -1;
		var matchIndex = -1;
		var sLength = str.length;
		while (true) {
			var p = pattern[pIndex];

			if (p === star) {
				starIndex = pIndex++;
				matchIndex = sIndex;
				continue;
			}

			if (sIndex === sLength) break;

			if (p === str[sIndex] || p === questionMark) {
				pIndex++;
				sIndex++;
				continue;
			}


			if (starIndex >= 0) {
				pIndex = starIndex + 1;
				sIndex = ++matchIndex;
				continue;
			}

			return false;
		}
		return pIndex === pattern.length;
	}
}
export = _;