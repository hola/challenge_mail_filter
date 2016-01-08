#!/usr/bin/env node

var test00js = require("./test00.js");
var test10json = require("./test10.json");

if (!module.parent) {
  console.log(process.versions.node);
  test00js(test10json, function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
