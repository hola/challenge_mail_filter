#!/usr/bin/env node

"use strict";

var fs = require("fs");

var test = require("./test20.json");

var new_messages = {};

Object.keys(test.messages).some(function(key) {
  var message = test.messages[key];
  ["a", "b", "c", "d", "e", "f", "g", "h"].some(function(char) {
    new_messages[key + char] = message;
  });
});

test.messages = new_messages;

fs.writeFileSync("test21.json", JSON.stringify(test, null, 2));
