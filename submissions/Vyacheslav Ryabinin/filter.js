'use strict';

function m(p, s) {
  var i = 0;
  var j = 0;
  var x = 0;
  var y = 0;

  while (s[j] !== undefined && p[i] !== '*') {
    if (p[i] !== s[j] && p[i] !== '?')
      return false;
    i++; j++;
  }

  while (s[j] !== undefined) {
    switch (p[i]) {
      case '*':
        if (p[++i] === undefined)
          return true;
        y = i; x = j + 1;
        break;
      case '?': case s[j]: i++, j++; break;
      default: i = y, j = x++;
    }
  }

  while (p[i] === '*')
    i++;

  return p[i] === undefined;
}

function filter(messages, rules) {
  var l = rules.length;
  var i = -1;
  for (var k in messages) {
    var from  = messages[k].from;
    var to    = messages[k].to;
    messages[k] = [];
    while (++i<l){
      var rto   = rules[i].to;
      var rfrom = rules[i].from;
      if ((rto === undefined || m(rto, to)) && (rfrom === undefined || m(rfrom, from)))
        messages[k].push(rules[i].action);
    }
    i = -1;
  }
  return messages;
}

module.exports = filter;
