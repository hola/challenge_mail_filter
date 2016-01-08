'use strict';

// Aho-Corasick algorithm implementation
// source: https://github.com/xudejian/aho-corasick (MIT License)
class Trie {
  constructor() {
    this.next = {};
    this.is_word = null;
    this.value = null;
    this.data = [];
  }

  add(word, data, original_word) {
    var chr, node;
    chr = word.charAt(0);
    node = this.next[chr];
    if (!node) {
      node = this.next[chr] = new Trie();
      if (original_word) {
        node.value = original_word.substr(0, original_word.length - word.length + 1);
      } else {
        node.value = chr;
      }
    }
    if (word.length > 1) {
      return node.add(word.substring(1), data, original_word || word);
    } else {
      node.data.push(data);
      return node.is_word = true;
    }
  }

  explore_fail_link(word) {
    var chr, i, node, _i, _ref;
    node = this;
    for (i = _i = 0, _ref = word.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      chr = word.charAt(i);
      node = node.next[chr];
      if (!node) {
        return null;
      }
    }
    return node;
  }

  each_node(callback) {
    var node, _k, _ref, _ref1;
    _ref = this.next;
    for (_k in _ref) {
      node = _ref[_k];
      callback(this, node);
    }
    _ref1 = this.next;
    for (_k in _ref1) {
      node = _ref1[_k];
      node.each_node(callback);
    }
    return this;
  }
}

class AhoCorasick {
  constructor() {
    this.trie = new Trie();
  }

  add(word, data) {
    return this.trie.add(word, data);
  }

  build_fail(node) {
    var fail_node, i, sub_node, _i, _k, _ref, _ref1;
    node = node || this.trie;
    node.fail = null;
    if (node.value) {
      for (i = _i = 1, _ref = node.value.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        fail_node = this.trie.explore_fail_link(node.value.substring(i));
        if (fail_node) {
          node.fail = fail_node;
          break;
        }
      }
    }
    _ref1 = node.next;
    for (_k in _ref1) {
      sub_node = _ref1[_k];
      this.build_fail(sub_node);
    }
    return this;
  }

  foreach_match(node, pos, callback) {
    var offset;
    while (node) {
      if (node.is_word) {
        offset = pos - node.value.length;
        callback(node.value, node.data, offset);
      }
      node = node.fail;
    }
    return this;
  }

  search(string, callback) {
    var chr, current, idx, _i, _ref;
    current = this.trie;
    for (idx = _i = 0, _ref = string.length; 0 <= _ref ? _i < _ref : _i > _ref; idx = 0 <= _ref ? ++_i : --_i) {
      chr = string.charAt(idx);
      while (current && !current.next[chr]) {
        current = current.fail;
      }
      if (!current) {
        current = this.trie;
      }
      if (current.next[chr]) {
        current = current.next[chr];
        if (callback) {
          this.foreach_match(current, idx + 1, callback);
        }
      }
    }
    return this;
  }
}

const defaultRegexpSymbols = '[]()^$:+=!|.,';

// makes valid regex from input string
class RegexpTransformer {

  static escapeAll(str) {
    return '\\' + str.split('').join('\\');
  }

  // special symbols to be escaped with '\'
  constructor(specialSymbols) {
    if (specialSymbols === undefined || specialSymbols.length < 1) {
      return new RegExp('', 'g');
    }
    this._re = new RegExp('[' + RegexpTransformer.escapeAll(specialSymbols) + ']', 'g');
  }

  // escapes special symbols,
  // replaces '?' with '.' and '*' with '.*'
  transform(str) {
    if (str === undefined) {
      return new RegExp('');
    }
    return new RegExp('^' + str.replace(this._re, '\\$&').replace(/\?/g, '.').replace(/\*/g, '.*') + '$');
  }
}

// computes intersection of 2 sorted arrays
// complexity: linear
function arrayIntersection(arr1, arr2) {
  if (arr2 === undefined) {
    return [];
  }
  
  // arr1 === [-1] is a special case means arr1 contains all possible elements
  // thus intersection === arr2
  if (arr1.length === 1 && arr1[0] === -1) {
    return arr2.slice();
  }
  
  let j = 0;
  let res = [];
  for (let i = 0; i < arr1.length && j < arr2.length; ++i) {
    while (j < arr2.length && arr2[j] < arr1[i]) j += 1;
    if (j < arr2.length && arr1[i] === arr2[j]) {
      res.push(arr1[i]);
    }
  }
  return res;
}

// main function
// time complexity:
//    O(messages*rules) worst case
//    O(matches) best case (few matches, unique rule templates)
// memory complexity:
//    O(matches + rules*alphabet_size)
function filter(messages, rules) {
  let transformer = new RegexpTransformer(defaultRegexpSymbols);
  let rulesRegExp = rules.map(r => {
    return {
      from: transformer.transform(r.from),
      to: transformer.transform(r.to)
    };
  });

  // rules 'from' and 'to' fields splitted into non-empty parts with '?' and '*' as separators
  let rulePartsFrom = new Array(rules.length);
  let rulePartsTo = new Array(rules.length);
  
  // Aho-Corasick automatons built from rule parts
  let authFrom = new AhoCorasick();
  let authTo = new AhoCorasick();

  let re = /[\*\?]/;
  for (let i = 0; i < rules.length; ++i) {
    rulePartsFrom[i] = [];
    rulePartsTo[i] = [];
    if (rules[i].from) {
      rulePartsFrom[i] = rules[i].from.split(re).filter(r => r.length > 0);
      for (let j = 0; j < rulePartsFrom[i].length; ++j) {
        authFrom.add(rulePartsFrom[i][j]);
      }
    }
    if (rules[i].to) {
      rulePartsTo[i] = rules[i].to.split(re).filter(r => r.length > 0);
      for (let j = 0; j < rulePartsTo[i].length; ++j) {
        authTo.add(rulePartsTo[i][j]);
      }
    }
  }

  authFrom.build_fail();
  authTo.build_fail();

  // Map (rule part) => [matched messages]
  let partMatchesFrom = new Map();
  let partMatchesTo = new Map();

  let messageKeys = Object.keys(messages);

  // get list of matched rule parts for each message using Aho-Corasick algorithm
  for (let k = 0; k < messageKeys.length; ++k) {
    let from1 = messages[messageKeys[k]].from;
    let to1 = messages[messageKeys[k]].to;
    authFrom.search(from1, match => {
      let matches = partMatchesFrom.get(match);
      if (matches === undefined) {
        matches = [];
        partMatchesFrom.set(match, matches);
      } 
      if (matches.length === 0 || matches[matches.length - 1] !== k) {
        matches.push(k);  
      }
    });
    authTo.search(to1, match => {
      let matches = partMatchesTo.get(match);
      if (matches === undefined) {
        matches = [];
        partMatchesTo.set(match, matches);
      } 
      if (matches.length === 0 || matches[matches.length - 1] !== k) {
        matches.push(k);  
      }
    });
  }

  // List (message) => [rules with all parts matched to message]
  let probableFullMatches = new Array(messages.length);

  for (let i = 0; i < rules.length; ++i) {
    let currentMatches = [-1]; // [-1] means it contains all rules
    
    // for each rule, compute intersection of all message lists for its parts 
    for (let j = 0; j < rulePartsFrom[i].length; ++j) {
      currentMatches = arrayIntersection(currentMatches, partMatchesFrom.get(rulePartsFrom[i][j]));
    }
    for (let j = 0; j < rulePartsTo[i].length; ++j) {
      currentMatches = arrayIntersection(currentMatches, partMatchesTo.get(rulePartsTo[i][j]));
    }
    
    // empty rule should be matched to all messages
    if (currentMatches.length > 0 && currentMatches[0] === -1) {
      for (let j = 0; j < messageKeys.length; ++j) {
        if (probableFullMatches[j] === undefined) {
          probableFullMatches[j] = [];
        }
        probableFullMatches[j].push(i);
      }
    } else {
      for (let j = 0; j < currentMatches.length; ++j) {
        if (probableFullMatches[currentMatches[j]] === undefined) {
          probableFullMatches[currentMatches[j]] = [];
        }
        probableFullMatches[currentMatches[j]].push(i);
      }
    }

  }

  let fullMatches = {}; // final answer

  for (let k = 0; k < messageKeys.length; ++k) {
    fullMatches[messageKeys[k]] = [];
  }
  
  // verify all matches using regexps
  for (let k = 0; k < probableFullMatches.length; ++k) {
    if (probableFullMatches[k] !== undefined) {
      for (let j = 0; j < probableFullMatches[k].length; ++j) {
        let r = rulesRegExp[probableFullMatches[k][j]];
        if (r.from.test(messages[messageKeys[k]].from) && r.to.test(messages[messageKeys[k]].to)) {
          fullMatches[messageKeys[k]].push(rules[probableFullMatches[k][j]].action);
        }
      }
    }

  }

  return fullMatches;
}

exports.filter = filter;