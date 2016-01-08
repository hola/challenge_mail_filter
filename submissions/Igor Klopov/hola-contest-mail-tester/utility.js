#!/usr/bin/env node

"use strict";

var fs = require("fs");
var runInNewContext = require("vm").runInNewContext;

var wrapper = [
  '(function (exports, require, module, __filename, __dirname, process, Buffer, console) { ',
  '\n});'
];

/*
function wrapper_args(m) {
  m.parent = true;
  return [ null, require, m, "__filename", "__dirname", process, Buffer, console ];
}
*/

function wrapper_args(m) {
  m.parent = true;
  return [ null, null, m, "__filename", "__dirname", null, null, null ];
}

function wrap(code) {
  return wrapper[0] + code + wrapper[1];
}

module.exports.solve_any = function(solve, test, cb) {

  if (typeof solve === "string") {

    var code = fs.readFileSync(require.resolve(solve), "utf8");

    if (code.slice(0, 19) === "#!/usr/bin/env node") {
      code = code.slice(19);
    }

    var compiled = runInNewContext(wrap(code), {}, {
      filename: (Math.random() * 1000000 | 0).toString() // fixes "Optimized too many times" in --trace-opt
    });

    var m = {};
    compiled.apply(null, wrapper_args(m));
    var result = m.exports.call(null, test.messages, test.rules);

    if (cb) {
      cb(null, result);
    } else {
      return result;
    }

  } else {

    var solve_with_cb = solve.solve_with_cb;
    if (solve_with_cb) {
      solve_with_cb(test.messages, test.rules, function(error, out) {
        if (error) return cb(error);
        cb(null, out);
      });
    } else {
      var out = solve(test.messages, test.rules);
      cb(null, out);
    }

  }

}

function show(results) {
  var keys = Object.keys(results);
  if (keys.length < 20) {
    console.log(results);
  } else {
    console.log(keys.length);
  }
}

module.exports.make_test_from_simple_pair = function(pair) {
  return {
    messages: { msg1: { from: "me", to: pair[1] } },
    rules: [{ from: "*", to: pair[0], action: "action!" }]
  }
}

function read_one_test_from_file(test_file) {
  var json = require(test_file);
  if (Array.isArray(json)) json = json[json.length - 1];
  if (Array.isArray(json)) json = module.exports.make_test_from_simple_pair(json);
  return JSON.parse(JSON.stringify(json));
}

module.exports.no_parent = function(o, cb) {
  var arg = process.argv[2] || "test10.json";
  var json = read_one_test_from_file("./" + arg);
  module.exports.solve_any(o, json, function(error, results) {
    if (cb) return cb(error, results);
    if (error) throw error;
    show(results);
  });
}
