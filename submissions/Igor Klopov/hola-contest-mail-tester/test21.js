#!/usr/bin/env node

var test20js = require("./test20async.js");
var test21json = require("./test21.json");

if (!module.parent) {
  console.log(process.versions.node);
  test20js([test21json], function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
