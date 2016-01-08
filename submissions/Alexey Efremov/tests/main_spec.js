"use strict";
/* global describe, it */
/* eslint comma-dangle:0 */

var beautify = require("js-beautify").js_beautify;
var fs = require("fs");
var chai = require("chai");
var expect = chai.expect;
var filter = require("../index.js");
var compileFilter = filter.compileFilter;
var tests = require("./data");

chai.util.addMethod(chai.Assertion.prototype, "eqlCode", function(str) {
  var obj = chai.util.flag(this, "object");
  var objNorm = beautify(obj, {indent_size: 2});
  if (process.env.MOCHA_FIXTURES) {
    fs.writeFileSync(`${__dirname}/fixtures/main_${str}.js`, objNorm);
  }
  var data  = fs.readFileSync(`${__dirname}/fixtures/main_${str}.js`).toString();
  var dataNorm = beautify(data, {indent_size: 2});

  new chai.Assertion(objNorm).to.eql(dataNorm);
});

describe("filter", function() {
  for (var key in tests) {
    /* eslint no-loop-func:0 */
    (function(name, item) {
      it(`check filter - ${name}`, function() {
        var body = compileFilter(item.rules, []);
        expect(body).to.eqlCode(name);
        var result = filter(item.messages, item.rules);
        expect(result).to.eql(item.expected);
      });
    })(key, tests[key]);
  }
});
