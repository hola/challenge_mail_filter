'use strict'

var _Keys = Object.keys,
	__slice = [].slice;
var __merge = function (target, source) {
	var k;
	for (k in source) {
		if (k in target) continue;
		else target[k] = source[k];
	}
	return target;
};
var __mergeDeep = function (target, source) {
	var k,v,t;
	for (k in source) {
		for (v in source[k]) {
			if (v in target) continue;
			else {
				t=/.+@(.+)$/.exec(v)[1];
				target[t] = source[k][t];
			}
		}
	}
	return target;
};
var __addDeep = function (target, toAdd) {
	var _from,_to,tfrom;
	for (_from in target) {
		tfrom=target[_from];
		for (_to in toAdd) {
			if (!(_to in tfrom)) tfrom[_to] = [];
		}
	}
	return target;
}


var filter = function(messages, rules) {
	
	var parseRules = function parseRules(rules) {
		var createRegExp = function createRegExp(lit) {
			return RegExp(('^' + lit + '$').replace(/\*+/g, '.*').replace(/\?/g, '.'));
		};
		var createRule = function createRule(rawrule) {
			var from = rawrule.from;
			var to = rawrule.to;
			var aFrom, aTo, equalFrom, equalTo, domainFrom, domainTo, tDomain;
			if (from) {
				equalFrom = /^[^*?]*$/.test(from);
			}
			if (to) {
				equalTo = /^[^*?]*$/.test(to);
			}
			tDomain = /.+@(.+)$/.exec(from);
			domainFrom = tDomain ? (/^[^*?]*$/.test(tDomain[1]) ? tDomain[1] : 'all') : 'all';
			// console.log(domainFrom);
			tDomain = /.+@(.+)$/.exec(to);
			domainTo = tDomain ? (/^[^*?]*$/.test(tDomain[1]) ? tDomain[1] : 'all') : 'all';
			// console.log(domainTo);
			var emptyFrom = !from, 
				emptyTo = !to, 
				emptyBoth = emptyFrom && emptyTo,
				fromPoint = !emptyFrom ? (equalFrom ? from : createRegExp(from)) : '',
				toPoint = !emptyTo ? (equalTo ? to : createRegExp(to)) : '';
			var outfn;
			if (emptyBoth) outfn = function outfn1(){return true;};
			else if (emptyTo) {
				if (equalFrom) outfn = function outfn2(){return arguments[0].from === fromPoint;};
				else outfn = function outfn3(){return fromPoint.test(arguments[0].from);};
			} else if (emptyFrom) {
				if (equalTo) outfn = function outfn4(){return arguments[0].to === toPoint;};
				else outfn = function outfn5(){return toPoint.test(arguments[0].to);};
			} else {
				if (equalFrom && equalTo) outfn = function outfn6(){return arguments[0].from === fromPoint && arguments[0].to === toPoint;};
				else if (equalFrom) outfn = function outfn7(){return arguments[0].from === fromPoint && toPoint.test(arguments[0].to);};
				else if (equalTo) outfn = function outfn8(){return arguments[0].to === toPoint && fromPoint.test(arguments[0].from);};
				else outfn = function outfn9(){return fromPoint.test(arguments[0].from) && toPoint.test(arguments[0].to);};
			}
			return {
				fromPoint: fromPoint,
				toPoint: toPoint,
				fromDomain: domainFrom,
				toDomain: domainTo,
				test: outfn,
				action: rawrule.action
			};
		};
		var buildFromNode = function buildFromNode() {
			return {
				set: function setTo(rule) {
					var dom, toDomain, k, regx, pattern, temp;
					if (rule.toPoint) {
						if (typeof rule.toPoint === 'string') {
							dom = this.fullMailsTo[rule.toPoint];
							if (dom) {
								dom[dom.length] = rule;
							} else this.fullMailsTo[rule.toPoint] = [rule];
						} else {
							temp = this.domainsTo[rule.toDomain];
							if (temp) {
								temp[temp.length] = rule;
							} else this.domainsTo[rule.toDomain] = [rule];
							if (rule.toDomain === 'all') {
								for (k in this.fullMailsTo) {
									if (rule.toPoint.test(k)) 
										this.fullMailsTo[k][this.fullMailsTo[k].length] = rule;
								}
								for (k in this.domainsTo) {
									pattern = /.+@(.+)\$/.exec(rule.toPoint);
									if (pattern) {
										regx = RegExp(pattern[1]);
										if (regx.test(k)) this.domainsTo[k][this.domainsTo[k].length] = rule;
									} else {
										this.domainsTo[k][this.domainsTo[k].length] = rule;
									}
								}
							}
						};
					} else {
						for (k in this.fullMailsTo) {
							this.fullMailsTo[k][this.fullMailsTo[k].length] = rule;
						}
						for (k in this.domainsTo) {
							this.domainsTo[k][this.domainsTo[k].length] = rule;
						}
					}
				},
				setPatterns: function setPatterns(fromTo, fromDomain, isFull) {
					var doms,mails;
					if (isFull) {
						doms = fromTo.fullMailsTodomains;
						mails = fromTo.fullMailsTofullMails;
					} else {
						doms = fromTo.domainsTodomains;
						mails = fromTo.domainsTofullMails;
					}
					__merge(this.domainsTo, doms[fromDomain] || {});
					if (!('all' in this.domainsTo)) this.domainsTo.all = [];
					__merge(this.fullMailsTo, mails[fromDomain] || {});
				},
				domainsTo: {
					all: []
				},
				fullMailsTo: {}
			};
		};
		var buildDomains = function buildDomains(rules) {
			var l=rules.length, i=0, 
			builtRules=[], domains={}, fullMails={}, 
			domainsTodomains={}, fullMailsTofullMails={}, allTofullMails={},
			domainsTofullMails={}, fullMailsTodomains={}, allTodomains={},
			rule, temp;
			for (;l--;i++) {
				rule = createRule(rules[i]);
				// Section for From
				if (rule.fromPoint && 
					typeof rule.fromPoint === 'string') {
					if (!(rule.fromPoint in fullMails)) {
						fullMails[rule.fromPoint] = buildFromNode();
						fullMailsTofullMails[rule.fromPoint] = {};
						fullMailsTodomains[rule.fromPoint] = {};
					} 
					if (rule.toPoint && typeof rule.toPoint === 'string') { 
						if (!(rule.toPoint in fullMailsTofullMails[rule.fromPoint])) {
							fullMailsTofullMails[rule.fromPoint][rule.toPoint] = [];
						}
					} else if (!(rule.toDomain in fullMailsTodomains[rule.fromPoint])) {
						fullMailsTodomains[rule.fromPoint][rule.toDomain] = [];
					}
				} else if (rule.fromPoint) {
					if (!(rule.fromDomain in domains)) {
						domains[rule.fromDomain] = buildFromNode();
						domainsTodomains[rule.fromDomain] = {};
						domainsTofullMails[rule.fromDomain] = {};
					}
					if (rule.toPoint && typeof rule.toPoint === 'string') { 
						if (!(rule.toPoint in domainsTofullMails[rule.fromDomain])) {
							domainsTofullMails[rule.fromDomain][rule.toPoint] = [];
						}
					} else if (!(rule.toDomain in domainsTodomains[rule.fromDomain])) {
						domainsTodomains[rule.fromDomain][rule.toDomain] = [];
					}
				} 

				if (!rule.fromPoint) {
					if (rule.toPoint && typeof rule.toPoint === 'string') {
						allTofullMails[rule.toPoint] = [];
					} else {
						allTodomains[rule.toDomain] = [];
					}
				}
				
				// Apply to both
				builtRules[i] = rule;
			}
			__addDeep(domainsTodomains,allTodomains);
			__addDeep(fullMailsTodomains,allTodomains);
			__addDeep(fullMailsTofullMails,allTofullMails);
			__addDeep(domainsTofullMails,allTofullMails);

			return {
				domains: domains,
				fullMails: fullMails,
				fromTo: {
					domainsTodomains: domainsTodomains,
					fullMailsTodomains: fullMailsTodomains,
					fullMailsTofullMails: fullMailsTofullMails,
					domainsTofullMails: domainsTofullMails
				},
				builtRules: builtRules
			}
		};
		var buildTree = function buildTree(builtDomains) {
			var parsedRules = {
				domains: builtDomains.domains,
				fullMails: builtDomains.fullMails
			};
			var fromTo = builtDomains.fromTo;
			var fromTofullMails = {
				fullMailsTodomains: fromTo.fullMailsTodomains,
				fullMailsTofullMails: fromTo.fullMailsTofullMails
			};
			var fromTodomains = {
				domainsTodomains: fromTo.domainsTodomains,
				domainsTofullMails: fromTo.domainsTofullMails
			};
			var k, v;
			
			for (v in parsedRules.fullMails) {
				parsedRules.fullMails[v].setPatterns(fromTofullMails,v,true);
			}
			for (k in parsedRules.domains) {
				parsedRules.domains[k].setPatterns(fromTodomains,k);
			}
			var rules = builtDomains.builtRules;
			var ruleslen = rules.length, _i = 0, rule, k, v, pattern, regx;
			for (;ruleslen--;_i++) {
				rule = rules[_i];
				if (rule.fromPoint) {
					if (typeof rule.fromPoint === 'string') {
						parsedRules.fullMails[rule.fromPoint].set(rule);
					} else {
						parsedRules.domains[rule.fromDomain].set(rule);
						if (rule.fromDomain === 'all') {
							for (k in parsedRules.fullMails) {
								if (rule.fromPoint.test(k)) 
									parsedRules.fullMails[k].set(rule);
							}
							pattern = /.+@(.+)\$/.exec(rule.fromPoint.toString());
							if (pattern) {
								regx = RegExp(pattern[1]);
							}
							for (k in parsedRules.domains) {
								if (pattern) {
									if (regx.test(k)) parsedRules.domains[k].set(rule);
								} else {
									parsedRules.domains[k].set(rule);
								}
							}
						}
					};
				} else {
					for (k in parsedRules.fullMails) {
						parsedRules.fullMails[k].set(rule);
					}
					for (k in parsedRules.domains) {
						parsedRules.domains[k].set(rule);
					}
				}
			}
			return parsedRules;
		};
		return buildTree(buildDomains(rules));
	}


	var getMatchingRules = function getMatchingRules(msg, builtTree) {

		var iter=0,itrules=0, matchRules = [], mappedRules, nrules=0;
		var mapfrom, mapto, rules = [];
		var fromDomain = /.+@(.+)$/.exec(msg.from);
		var toDomain = /.+@(.+)$/.exec(msg.to);
		if (msg.from in builtTree.fullMails) {
			mapfrom = builtTree.fullMails[msg.from];
			if (msg.to in mapfrom.fullMailsTo) {
				rules = mapfrom.fullMailsTo[msg.to] || [];
			} else if (toDomain && (toDomain[1] in mapfrom.domainsTo)) {
				rules = mapfrom.domainsTo[toDomain[1]] || [];
			} else {
				rules = mapfrom.domainsTo.all || [];
			}
		} else if (fromDomain && (fromDomain[1] in builtTree.domains)) {
			mapfrom = builtTree.domains[fromDomain[1]];
			if (msg.to in mapfrom.fullMailsTo) {
				rules = mapfrom.fullMailsTo[msg.to] || [];
			} else if (toDomain && (toDomain[1] in mapfrom.domainsTo)) {
				rules = mapfrom.domainsTo[toDomain[1]] || [];
			} else {
				rules = mapfrom.domainsTo.all || [];
			}
		} else {
			rules = builtTree.domains.all || [];
		}
		nrules = rules.length;
		for (;nrules--;iter++) {
			if (rules[iter].test(msg)) matchRules[itrules++] = rules[iter].action;
		}
		return matchRules;

	};

	var rulesMap = parseRules(rules);
	
	var k, msg;
	var matchRules;
	for (k in messages) {
		msg = messages[k];
		messages[k] = getMatchingRules(msg, rulesMap);
	}
	return messages;
};

module.exports = filter;