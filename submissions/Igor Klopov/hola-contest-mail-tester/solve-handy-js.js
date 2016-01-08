#!/usr/bin/env node

function match(wild, string) {

  var wsz = wild.length, ssz = string.length;
  var _wild = 0, _string = 0;
  var cp = 0, mp = 0;

  while ((_string < ssz) && (wild[_wild] !== "*")) {
    if ((wild[_wild] !== string[_string]) && (wild[_wild] !== "?")) {
      // console.log(false);
      return false;
    }
    _wild++;
    _string++;
  }

  while (_string < ssz) {
    if (wild[_wild] === "*") {
      _wild++;
      if (_wild === wsz) {
        // console.log(true);
        return true;
      }
      mp = _wild;
      cp = _string + 1;
    } else
    if ((wild[_wild] === string[_string]) || (wild[_wild] === "?")) {
      _wild++;
      _string++;
    } else {
      _wild = mp;
      _string = cp;
      cp++;
    }
  }

  while (wild[_wild] === "*") {
    _wild++;
  }

  // console.log(_wild === wsz);
  return (_wild === wsz);

}

function solve(messages, rules) {
  "use strict";

  var results = {};

  Object.keys(messages).forEach(function(key) {
    var message = messages[key];
    results[key] = rules.filter(function(rule) {
      var f = (!rule.from);
      if (!f) f = match(rule.from, message.from);
      if (f) {
        var t = (!rule.to);
        if (!t) t = match(rule.to, message.to);
        if (t) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }).map(function(rule) {
      return rule.action;
    });
  });

  return results;

};

module.exports = solve;

if (!module.parent) {
  require("./utility.js").no_parent(module.exports);
}
