#!/usr/bin/env node

var test20js = require("./test20async.js");
var test22json = require("./test22.json");

if (!module.parent) {
  console.log(process.versions.node);
  test20js([test22json], function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
