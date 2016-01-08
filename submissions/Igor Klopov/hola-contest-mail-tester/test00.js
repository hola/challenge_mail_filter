#!/usr/bin/env node

var async = require("async");
var test00json = require("./test00.json");
var utility = require("./utility.js");
var solve_any = utility.solve_any;
var make_test_from_simple_pair = utility.make_test_from_simple_pair;

var use_hola_timeout = false;

var solve_names = [];
if (use_hola_timeout) solve_names.push("./solve-hola.js");
// solve_names.push("./solve-regexp.js");
solve_names.push("./solve-handy-js.js");
// solve_names.push("./solve-handy-asm.js"); // INCOMPATIBLE WITH KAVYCHKA
// solve_names.push("./solve-borealis.js");
// solve_names.push("./solve-corasick-cpp.js");
// solve_names.push("./solve-corasick-O3-emter.js");
solve_names.push("./solve-corasick-O3.js");
// solve_names.push("./solve-corasick-Oz-g-emter.js");
// solve_names.push("./solve-corasick-Oz-g.js");

module.exports = function(tests, cb) {

  async.mapSeries(tests, function(test, next) {

    var results = {};

    async.mapSeries(solve_names, function(solve_name, next2) {
      var clone = JSON.parse(JSON.stringify(test));
      solve_any(solve_name, clone, function(error, result) {
        if (error) return next2(error);
        var simple_name = solve_name.split("solve-")[1].split(".")[0];
        results[simple_name] = JSON.stringify(result);
        next2();
      });
    }, function(error) {

      if (error) return next(error);

      var reference_key = results.regexp ? "regexp" : "handy-js";
      var reference = results[reference_key];

      if (!reference) {
        return next("no reference");
      } else
      if ((use_hola_timeout) && (results.hola !== reference)) {
        return next("bad reference");
      } else {
        Object.keys(results).some(function(key) {
          if ((key !== "hola") && (key !== reference_key)) {
            var result = results[key];
            if (result !== reference) {
              return next(new Error("bad " + key));
            }
          }
        });
      }

      // console.log("ok", JSON.stringify(results));
      // console.log("ok");

      if (use_hola_timeout) {
        setTimeout(next, use_hola_timeout);
      } else {
        next();
      }

    });

  }, cb);

}

var prepare = [];

test00json.some(function(test) {
  prepare.push(make_test_from_simple_pair([test[0], test[1]]));
  prepare.push(make_test_from_simple_pair([test[1], test[0]]));
});

if (!module.parent) {
  console.log(process.versions.node);
  module.exports(prepare, function(error) {
    if (error) throw(error);
    console.log("all ok");
  });
}
