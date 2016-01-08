#!/usr/bin/env node

"use strict";

var regexp_sub = require("./solve-regexp-sub.js");

function solve(messages, rules) {

  rules = rules.map(function(rule) {
    var clone = { "action": rule.action };
    if (rule.from) {
      clone.from = regexp_sub(rule.from);
    }
    if (rule.to) {
      clone.to = regexp_sub(rule.to);
    }
    return clone;
  });

  var results = {};

  Object.keys(messages).forEach(function(key) {
    var message = messages[key];
    results[key] = rules.filter(function(rule) {
      var f = (!rule.from);
      if (!f) f = message.from.match(rule.from);
      if (f) {
        var t = (!rule.to);
        if (!t) t = message.to.match(rule.to);
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
