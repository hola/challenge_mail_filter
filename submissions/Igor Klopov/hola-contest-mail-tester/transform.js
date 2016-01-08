#!/usr/bin/env node

"use strict";

var fs = require("fs");

var test = require("./test20.json");

Object.keys(test.messages).some(function(key) {
  var message = test.messages[key];
  if (message.from) {
    message.from = 
      message.from + message.from + message.from + message.from +
      message.from + message.from + message.from + message.from;
  }
  if (message.to) {
    message.to = 
      message.to + message.to + message.to + message.to +
      message.to + message.to + message.to + message.to;
  }
});

test.rules.some(function(rule) {
  if (rule.from) {
    rule.from = 
      rule.from + rule.from + rule.from + rule.from +
      rule.from + rule.from + rule.from + rule.from;
  }
  if (rule.to) {
    rule.to = 
      rule.to + rule.to + rule.to + rule.to +
      rule.to + rule.to + rule.to + rule.to;
  }
});

fs.writeFileSync("test21.json", JSON.stringify(test, null, 2));
