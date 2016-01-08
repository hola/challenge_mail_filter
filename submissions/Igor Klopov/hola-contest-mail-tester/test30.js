#!/usr/bin/env node

/*
var out = [];

function random_char() {
  var r = Math.random();
  if (r < 1/3) {
    return "a";
  } else
  if (r < 2/3) {
    return "b";
  } else {
    return "c";
  }
}

console.log("[");
for (var i = 0; i < 35000; i++) {
  var s = "";
  for (var j = 0; j < 72; j++) {
    s = s + random_char();
  }
  console.log("  \"" + s + "\",");
}

console.log("]");

return;
*/

var test00js = require("./test00.js");
var test30fjson = require("./test30f.json");
var test30tjson = require("./test30t.json");

function generate_random_test(rules_length) {

  var email_length = 16;
  var messages_length = rules_length * 1000;
  var test = { messages: {}, rules: [] };
  var i, j;

  for (i = 0; i < rules_length; i++) {

    var f = "";

    for (j = 0; j < email_length; j++) {
      var r = Math.random();
      if (r < 0.05) {
        f = f + "*";
      } else
      if (r < 0.10) {
        f = f + "?";
      } else {
        f = f + test30fjson[i][j];
      }
    }

    var t = "";

    for (j = 0; j < email_length; j++) {
      var r = Math.random();
      if (r < 0.10) {
        t = t + "*";
      } else
      if (r < 0.05) {
        t = t + "?";
      } else {
        t = t + test30tjson[i][j];
      }
    }

    test.rules.push({
      from: f + ["@gmail.com", "@yandex.ru", "@yahoo.com", "@mail.ru"][Math.random() * 4 | 0],
      to: t + ["@gmail.com", "@yandex.ru", "@yahoo.com", "@mail.ru"][Math.random() * 4 | 0],
      action: "act" + i.toString()
    });

  }

  for (i = 0; i < messages_length; i++) {

    var pick_index = Math.random() * rules_length | 0;
    var pick = test.rules[pick_index];

    var f = "";

    for (j = 0; j < pick.from.length; j++) {
      if (pick.from[j] === "*") {
        var r = Math.random();
        if (r < 0.33) {
          f = f + ["a", "b", "c"][Math.random() * 3 | 0];
        } else
        if (r < 0.66) {
          f = f + ["a", "b", "c"][Math.random() * 3 | 0] +
                  ["a", "b", "c"][Math.random() * 3 | 0];
        } else {
          f = f + ["a", "b", "c"][Math.random() * 3 | 0] +
                  ["a", "b", "c"][Math.random() * 3 | 0] +
                  ["a", "b", "c"][Math.random() * 3 | 0];
        }
      } else
      if (pick.from[j] === "?") {
        f = f + ["a", "b", "c"][Math.random() * 3 | 0];
      } else {
        f = f + pick.from[j];
      }
    }

    var t = "";

    for (j = 0; j < pick.to.length; j++) {
      if (pick.to[j] === "*") {
        var r = Math.random();
        if (r < 0.33) {
          t = t + ["a", "b", "c"][Math.random() * 3 | 0];
        } else
        if (r < 0.66) {
          t = t + ["a", "b", "c"][Math.random() * 3 | 0] +
                  ["a", "b", "c"][Math.random() * 3 | 0];
        } else {
          t = t + ["a", "b", "c"][Math.random() * 3 | 0] +
                  ["a", "b", "c"][Math.random() * 3 | 0] +
                  ["a", "b", "c"][Math.random() * 3 | 0];
        }
      } else
      if (pick.to[j] === "?") {
        t = t + ["a", "b", "c"][Math.random() * 3 | 0];
      } else {
        t = t + pick.to[j];
      }
    }

    test.messages["msg" + i.toString() + "act" + pick_index.toString()] = { from: f, to: t };

  }

  // require("fs").writeFileSync("test24.json", JSON.stringify(test, null, 2));
  // process.exit();

  return test;

}

// return console.log(generate_random_test());

module.exports = function(cb) {

  var counter = 250;

  function loop() {
    console.log("-------------------------------------------------");
    console.log("counter", counter);
    var random = generate_random_test(counter);
    test00js([random], function(error) {
      if (error) {
        console.error(random);
        return cb(error);
      }
      counter += 100;
      loop();
    })
  }

  loop();

}

if (!module.parent) {
  console.log(process.versions.node);
  module.exports(function(error) {
    if (error) throw error;
    console.log("all ok");
  });
}
