#!/usr/bin/env node

"use strict";

var http = require("http");

function solve_with_cb(messages, rules, cb) {

  var data = JSON.stringify({
    messages: messages,
    rules: rules
  });

  var options = {
    hostname: "hola.org",
    port: 80,
    path: "/challenge_mail_filter/reference",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  var text = "";

  var req = http.request(options, function(res) {
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      text = text + chunk.toString();
    });
    res.on("end", function() {
      var out;
      try {
        out = JSON.parse(text);
      } catch(error) {
        console.log(text);
        return cb(error);
      }
      cb(null, out);
    });
  });

  req.write(data);
  req.end();

};

module.exports.solve_with_cb = solve_with_cb;

if (!module.parent) {
  require("./utility.js").no_parent(module.exports);
}
