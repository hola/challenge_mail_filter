#!/usr/bin/env node

var async = require("async");
var test20json = require("./test20.json");
var utility = require("./utility.js");
var solve_any = utility.solve_any;

var solve_names = [];
// solve_names.push("./solve-regexp.js");
solve_names.push("./solve-handy-js.js");
// solve_names.push("./solve-handy-asm.js");
// solve_names.push("./solve-borealis.js");
// solve_names.push("./solve-corasick-cpp.js");
// solve_names.push("./solve-corasick-O3-emter.js");
solve_names.push("./solve-corasick-O3.js");
// solve_names.push("./solve-corasick-Oz-g-emter.js");
// solve_names.push("./solve-corasick-Oz-g.js");

module.exports = function(tests, cb) {

  var compare;

  async.mapSeries(solve_names, function(solve_name, next) {

    var before = process.hrtime();
    var counter = 0;
    var last_result;

    console.log(solve_name + "...");

    async.mapSeries(tests, function(test, next2) {
      if (tests.length > 1) console.log("test", counter++);
      var clone = JSON.parse(JSON.stringify(test));
      solve_any(solve_name, clone, function(error, result) {
        if (error) return next2(error);
        last_result = result;
        next2();
      });
    }, function(error) {

      if (error) return next(error);

      var took = process.hrtime(before);
      var time = took[0] + took[1] / 1000000000;
      time = time / tests.length;
      time = time / 1.25;
      time = ((time * 1000) | 0) / 1000;

      console.log(solve_name + ": " + time.toString());

      if (solve_names.length > 1) {

        var c = JSON.stringify(last_result, null, 2);

        if (!compare) {
          compare = c;
        } else {
          if (c !== compare) {
            fs.writeFileSync("___1", compare);
            fs.writeFileSync("___2", c);
            return next2(new Error("Wrong answer"));
          }
        }

      }

      next();

    });

  }, cb);

}

var prepare = [];

if (solve_names.length === 1) {
  for (var many = 0; many < 16; many++) {
    prepare.push(test20json);
  }
} else {
  prepare.push(test20json);
}

if (!module.parent) {
  console.log(process.versions.node);
  module.exports(prepare, function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
