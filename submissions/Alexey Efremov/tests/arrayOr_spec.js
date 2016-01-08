"use strict";
/* global describe, it, xdescribe */
/* eslint comma-dangle:0 */

var filter = require("../index.js");
var arrayOr = filter.arrayOr;

var chai = require("chai");
var expect = chai.expect;

describe("arrayOr", function() {
  it("check plain mode", function() {
    var str1 = arrayOr("r", [1, 2, 3, 4]);
    expect(str1).to.eql("r_0|=1;r_1|=2;r_2|=3;r_3|=4;");
    var str2 = arrayOr("r", []);
    expect(str2).to.eql("");
  });
});
