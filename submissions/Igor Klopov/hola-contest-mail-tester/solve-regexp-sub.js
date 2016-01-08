#!/usr/bin/env node

function solve_regexp_sub(inp) {

  var out = "^(?:(?=.)";

  for (var i = 0; i < inp.length; i++) {
    var inpi = inp[i];
    if (inpi === "*") {
      out += "[^\/]*?";
    } else
    if (inpi === "?") {
      out += "[^\/]";
    } else {
      out += inpi;
    }
  }

  out += ")$";

  return new RegExp(out);

}

module.exports = solve_regexp_sub;
