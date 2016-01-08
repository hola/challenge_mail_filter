"use strict";
/* global describe, it */
/* eslint comma-dangle:0 */

var beautify = require("js-beautify").js_beautify;
var fs = require("fs");
var chai = require("chai");
var expect = chai.expect;

var filter = require("../index.js");
var tokenize = filter.tokenize;
var compile = filter.compile;

chai.util.addMethod(chai.Assertion.prototype, "eqPretty", function(str) {
  var obj = chai.util.flag(this, "object");
  var objNorm = beautify(obj, {indent_size: 2});
  if (process.env.MOCHA_FIXTURES) {
    fs.writeFileSync(`${__dirname}/fixtures/compile_${str}.js`, objNorm);
  }
  var data  = fs.readFileSync(`${__dirname}/fixtures/compile_${str}.js`).toString();
  var dataNorm = beautify(data, {indent_size: 2});

  new chai.Assertion(objNorm).to.eql(dataNorm);
});

describe("compile", function() {
  it("check ast 1 pattern", function() {
    var ast = tokenize("*@bk.ru", 0);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("code1");
    var func = compile("1", ast);
    expect(func).to.be.instanceof(Function);
    expect(func()).to.eql([1]);
    expect(func("test@bk.ru")).to.eql([1]);
    expect(func("test@bk.su")).to.eql([0]);
    expect(func("test@bk.rus")).to.eql([0]);
  });
  it("check ast 2 pattern", function() {
    var ast = tokenize("*@bk.ru", 0);
    ast = tokenize("*@td.ru", 1, ast);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("code2");
    var func = compile("1", ast);
    expect(func()).to.eql([0b11]);
    expect(func("test@bk.ru")).to.eql([0b01]);
    expect(func("test@td.ru")).to.eql([0b10]);
    expect(func("test@bk.su")).to.eql([0]);
    expect(func("test@bk.rus")).to.eql([0]);
  });
  it("check ast 3 pattern", function() {
    var ast = tokenize("*@bk.ru", 0);
    tokenize("*@td.ru", 1, ast);
    tokenize("a?@*", 2, ast);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("code3");
    var func = compile("1", ast);
    expect(func()).to.eql([0b111]);
    expect(func("test@bk.ru")).to.eql([0b001]);
    expect(func("test@td.ru")).to.eql([0b010]);
    expect(func("test@bk.su")).to.eql([0]);
    expect(func("test@bk.rus")).to.eql([0]);
    expect(func("a1@mail.ru")).to.eql([0b100]);
    expect(func("a1@bk.ru")).to.eql([0b101]);
    expect(func("a1@td.ru")).to.eql([0b110]);
  });
  it("check ast complex pattern", function() {
    var ast = {};
    tokenize("*@bk.ru", 0, ast);
    tokenize("hello@bk.ru", 1, ast);
    tokenize("hello@*.ru", 2, ast);
    tokenize("*@*.ru", 3, ast);
    tokenize("h?llo@b?.ru", 4, ast);
    tokenize("*@bk.ru", 5, ast);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("code4");
    var func = compile("1", ast);
    var res1 = func();
    expect(res1).to.eql([0b111111]);
    var res2 = func("hello@bk.ru");
    expect(res2).to.eql([0b111111]);
    var res3 = func("hollo@bu.ru");
    expect(res3).to.eql([0b011000]);
  });
  it("check ast 4 pattern", function() {
    var ast = tokenize("*@bk.ru", 0);
    tokenize("*@td.ru", 1, ast);
    tokenize("a?@*", 2, ast);
    tokenize(null, 3, ast);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("code5");
    var func = compile("1", ast);
    expect(func()).to.eql([0b1111]);
    expect(func("test@bk.ru")).to.eql([0b1001]);
    expect(func("test@td.ru")).to.eql([0b1010]);
    expect(func("test@bk.su")).to.eql([0b1000]);
    expect(func("test@bk.rus")).to.eql([0b1000]);
    expect(func("a1@mail.ru")).to.eql([0b1100]);
    expect(func("a1@bk.ru")).to.eql([0b1101]);
    expect(func("a1@td.ru")).to.eql([0b1110]);
  });

  it("check main6", function() {
    var ast = tokenize("*a*b*", 0, {});
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("main6");
    var func = compile("1", ast);
    expect(func("abaabaaba")).to.eql([1]);
    expect(func("aba")).to.eql([1]);
    expect(func("d;rflkght")).to.eql([0]);
  });

  it("check main6-big", function() {
    var ast = tokenize("*a*b*", 80, {});
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("main6-big");
    var func = compile("1", ast);
    expect(func("abaabaaba")).to.eql([0, 0, 262144]);
    expect(func("aba")).to.eql([0, 0, 262144]);
    expect(func("d;rflkght")).to.eql([0, 0, 0]);
  });

  it("check main8", function() {
    var ast = {};
    tokenize("abaabaab*", 0, ast);
    tokenize("abaabaaba*?", 1, ast);
    tokenize("abaabaab*?*", 2, ast);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("main8");
    var func = compile("1", ast);
    expect(func("abaabaaba")).to.eql([0b101]);
    expect(func("aba")).to.eql([0]);
    expect(func("d;rflkght")).to.eql([0]);
  });
  it("check main9", function() {
    var ast = {};
    tokenize("*", 0, ast);
    tokenize("**", 1, ast);
    tokenize("***", 2, ast);
    tokenize("*jack@example.com", 3, ast);
    tokenize("jack@example.com*", 4, ast);
    tokenize("**jack@**.com**", 5, ast);
    tokenize("**@**.c*m**", 6, ast);
    var str = compile("1", ast, true);
    expect(str).to.eqPretty("main9");
    var func = compile("1", ast);
    expect(func("jack@example.com")).to.eql([0b1111111]);
    expect(func("noreply@spam.com")).to.eql([0b1000111]);
    expect(func("boss@work.com")).to.eql([0b1000111]);
  });
});
