#!/usr/bin/env node

var test20js = require("./test20async.js");
var test24json = require("./test24.json");

if (!module.parent) {
  console.log(process.versions.node);
  test20js([test24json], function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
