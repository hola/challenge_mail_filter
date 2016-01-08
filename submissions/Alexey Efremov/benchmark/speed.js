"use strict";

var lib = require("../index");
var fs = require("fs");
var _ = require("lodash");
var beautify = require("js-beautify").js_beautify;

function test(name, messages, rules) {
  var start = new Date();
  var result = lib(messages, rules);
  var end = new Date();
  var diff = end - start;
  console.log(
    "[" + name + "] time:",  diff + "ms",
    "msgs:", _.size(messages),
    "rules:", _.size(rules),
    "m/r:", (_.size(messages) / _.size(rules)).toFixed(1),
    "speed:", (_.size(messages) / diff).toFixed(2) + " ops/ms"
  );
  fs.writeFileSync(`${__dirname}/logs/${name}-result.json`,
    JSON.stringify(result, null, 2));
}

function precompile(name, rules) {
  var body = lib.compileFilter(rules, []);
  fs.writeFileSync(`${__dirname}/logs/${name}.js`,
    beautify(body, {indent_size: 2})
  );
}

var isTest1 = !process.env.TEST || process.env.TEST === "1";
var isTest2 = !process.env.TEST || process.env.TEST === "2";
var isTest3 = !process.env.TEST || process.env.TEST === "3";
var isTest4 = !process.env.TEST || process.env.TEST === "4";
var isTest5 = !process.env.TEST || process.env.TEST === "5";

if (isTest1) {
  test("test1",
    require("./fixtures/messages").messages,
    require("./fixtures/rules").rules
  );
}

if (isTest2) {
  var obj = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/data.json`, "utf8"));
  test("test2", obj.messages, obj.rules);
}

if (isTest3) {
  test("test3",
    require("./fixtures/messages").messages,
    require("./fixtures/rules").rules.slice(250)
  );
}

if (isTest4) {
  test("test4",
    require("./fixtures/messages").messages,
    require("./fixtures/rules").rules.slice(100)
  );
}

if (isTest5) {
  test("test5",
    require("./fixtures/messages").messages,
    require("./fixtures/rules").rules.slice(350)
  );
}

isTest1 && precompile("test1", require("./fixtures/rules").rules);
isTest2 && precompile("test2", obj.rules);
