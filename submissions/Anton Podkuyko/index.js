'use strict';

/**
 * Entry point function
 * @param messages
 * @param rules
 * @returns {{}}
 */
function filter(messages, rules) {
  var answer = {},
    i, j,
    messagesKeys = Object.keys(messages),
    allIds = new Array(messagesKeys.length),
    bor = new Bor(messages, messagesKeys);

  for( i = 0; i < messagesKeys.length ; i++ ) {
    answer[messagesKeys[i]] = [];
    allIds[i] = i;
  }
  for (i = 0; i < rules.length; i++) {
    var rule = rules[i];
    var messagesIds = bor.getMessages(rule);
    if (messagesIds === null) {
      messagesIds = allIds;
    }
    for (j = 0; j < messagesIds.length; j++) {
      answer[messagesKeys[messagesIds[j]]].push(rule.action);
    }
  }
  return answer;
}


/**
 * Bor class, stores strings in tree
 * @param {Object[]} messages
 * @param {int[]} messagesKeys
 * @constructor
 */
function Bor(messages, messagesKeys) {
  this.fromTree = this.makeNode();
  this.toTree = this.makeNode();
  this.messages = messages;

  for(var i = 0; i < messagesKeys.length ; i++ ) {
    var message = messages[messagesKeys[i]];
    this.add(this.fromTree, message.from, i);
    this.add(this.toTree, message.to, i);
  }
}

Bor.prototype.starsReplaceRegexp = /\*/g;

/**
 * Make empty node
 * @param letter
 * @returns {{links: Array, arr: Array, leafArr: Array, maxlen: number, letter: *}}
 */
Bor.prototype.makeNode = function (letter) {
  return {
    links: [],
    arr: [],
    leafArr: null,
    maxlen: 0,
    mask: 0,
    letter: letter,
    leafString: null
  };
};

/**
 * Get or create child node with letter
 * @param node
 * @param letter
 */
Bor.prototype.makeNextNode = function(node, letter) {
  var nextNode = this.findNextNode(node, letter);
  if (! nextNode) {
    nextNode = this.makeNode(letter);
    node.links.push(nextNode)
  }
  return nextNode;
};

/**
 * Find child node by letter
 * @param node
 * @param letter
 * @returns {Object}
 */
Bor.prototype.findNextNode = function(node, letter) {
  for( var i = 0; i < node.links.length; i++) {
    if (letter === node.links[i].letter) {
      return node.links[i];
    }
  }
};

/**
 * Add string to tree
 * @param node
 * @param {string} string
 * @param {int} id
 */
Bor.prototype.add = function (node, string, id) {
  var charCode;

  if (string.length) {
    node.maxlen = Math.max(string.length, node.maxlen);

    for (var i = 0; i < string.length; i++) {
      charCode = string.charCodeAt(i) - 65;
      if (charCode >= 0 && charCode <= 60) {
        node.mask |= (1 << charCode );
      }
    }

    if (!node.links.length) {
      var leaf = node.leafString;
      if (leaf === null || leaf === string) {
        node.leafString = string;
        if (id instanceof Array) {
          node.leafArr = (node.leafArr instanceof Array) ? node.leafArr.concat(id) : id;
        } else {
          if (node.leafArr instanceof Array) {
            node.leafArr.push(id);
          } else {
            node.leafArr = [id];
          }
        }
      } else {
        this.add(this.makeNextNode(node, leaf.charAt(0)), leaf.substring(1), node.leafArr);
        node.leafString = null;
        node.leafArr = null;
      }
    }
    if (node.links.length) {
      this.add(this.makeNextNode(node, string.charAt(0)), string.substring(1), id);
    }
  } else {
    if (id instanceof Array) {
      node.arr = node.arr.concat(id);
    } else {
      node.arr.push(id);
    }
    if (node.leafString !== null) {
      this.add(this.makeNextNode(node, node.leafString.charAt(0)), node.leafString.substring(1), node.leafArr);
      node.leafString = null;
      node.leafArr = null;
    }
  }
}

/**
 * Find messages ids which matches pattern in tree
 * @param {int} treeType
 * @param {string} pattern
 */
Bor.prototype.findActions = function (treeType, pattern) {
  if (pattern === undefined) return null;
  while (pattern.indexOf('**') !== -1 || pattern.indexOf('*?*') !== -1) {
    pattern = pattern.replace('**', '*');
    pattern = pattern.replace('*?*', '?*');
  }
  if (pattern === '*' || pattern === '?*') return null;
  return this.recFind(treeType ? this.toTree : this.fromTree, pattern);
};

/**
 * Find messages ids which matches pattern in node subtree
 * @param node
 * @param {string} pattern
 */
Bor.prototype.recFind = function (node, pattern) {
  var substr = pattern.substring(1), nextNode, i;
  if (pattern.length) {
    if (node.mask) {
      var charCode;
      for (i = 0; i < pattern.length; i++) {
        charCode = pattern.charCodeAt(i) - 65;
        if (charCode >= 0 && charCode <= 60 && ! (node.mask & (1 << charCode ))) {
          return [];
        }
      }
    }
    if (pattern.replace(this.starsReplaceRegexp, '').length > node.maxlen) {
      return [];
    }
    if (node.leafString !== null) {
      return this.dirtyCheck(pattern, node.leafString) ? node.leafArr : [];
    }
    var answer = [];
    nextNode = this.findNextNode(node, pattern[0]);
    if (nextNode) {
      answer = Bor.merge(answer, this.recFind(nextNode, substr));
    }
    if (pattern[0] === '?' || pattern[0] === '*') {
      for (i = 0; i < node.links.length; i++) {
        answer = Bor.merge(answer, this.recFind(node.links[i], substr));
      }
    }
    if (pattern[0] === '*') {
      for (i = 0; i < node.links.length; i++) {
        answer = Bor.merge(answer, this.recFind(node.links[i], pattern));
      }
      answer = Bor.merge(answer, this.recFind(node, substr));
    }
    return answer;
  } else {
    return node.arr || [];
  }
};

/**
 * Get messages ids which matches rules
 * @param rule
 * @returns {int[]}
 */
Bor.prototype.getMessages = function (rule) {
  return this.intersection(this.findActions(0, rule.from),
    this.findActions(1, rule.to));
};


Bor.prototype.starsTestRegexp = /^[\*]+$/;

/**
 * Test string to pattern
 * @param {string} pattern
 * @param {string} string
 */
Bor.prototype.dirtyCheck = function(pattern, string) {
  var pl = pattern.length, sl = string.length;
  if (pattern === string || (sl === 0 && pl === 0) || this.starsTestRegexp.test(pattern)) {
    return true;
  }
  if (pl === 0 || sl === 0 ) {
    return false;
  }
  var i = 0;
  while (i < sl && i < pl && (pattern[i] === string[i] || pattern[i] === '?')) {
    i++;
  }
  if(i > 0 && this.dirtyCheck(pattern.substring(i), string.substring(i))) {
    return true;
  }
  if (pattern[0] === '*') {
    if (pattern.charAt(pl - 1) !== '*') {
      return this.dirtyCheck(reverse(pattern), reverse(string));
    }
    return this.dirtyCheck(pattern, string.substring(1)) || this.dirtyCheck(pattern.substring(1), string);
  }
  return false;
};

function reverse (string) {
  var ans = '', l = string.length;
  for (var i = 0; i < l; i++) {
    ans += string[l - i - 1];
  }
  return ans;
}

/**
 * Merge two sorted arrays to one
 * @param {Array} a
 * @param {Array} b
 * @returns {Array}
 */
Bor.merge = function (a, b) {
  var al = a.length, bl = b.length;

  if (!al) return b;
  if (!bl) return a;

  var i = 0, j = 0, ans = [];
  while (i < al && j < bl) {
    if (a[i] < b[j]) {
      ans.push(a[i++]);
    } else if (b[j] < a[i]) {
      ans.push(b[j++]);
    } else {
      ans.push(a[i]);
      i++;
      j++;
    }
  }
  while (i < al) {
    ans.push(a[i++]);
  }
  while (j < bl) {
    ans.push(b[j++]);
  }
  return ans;
};

/**
 * Intersect two sorted arrays
 * @param {Array} a
 * @param {Array} b
 * @returns {Array}
 */
Bor.prototype.intersection = function(a, b) {
  if (! (a instanceof Array) ) return b;
  if (! (b instanceof Array)) return a;
  var al = a.length, bl = b.length;
  if (!al || !bl) return [];

  var i = 0, j = 0, ans = [];
  while (i < al && j < bl) {
    if (a[i] < b[j]) {
      i++;
    } else if (b[j] < a[i]) {
      j++;
    } else {
      ans.push(a[i]);
      i++;
      j++;
    }
  }
  return ans;
};


module.exports.filter = filter;
