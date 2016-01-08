#!/usr/bin/env node

var test20js = require("./test20async.js");
var test23json = require("./test23.json");

if (!module.parent) {
  console.log(process.versions.node);
  test20js([test23json], function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
