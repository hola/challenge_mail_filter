"use strict";
/* global describe, it, xdescribe */
/* eslint comma-dangle:0 */

var filter = require("../index.js");
var tokenize = filter.tokenize;

var chai = require("chai");
var expect = chai.expect;

describe("tokenize", function() {
  it("check", function() {
    var ast = {};
    tokenize("*@bk.ru", 0, ast);
    expect(ast).to.eql({
      deep: 0,
      mask: 1,
      act: [1],
      len: 1,
      "*": {
        len: 1,
        "@": {
          len: 1,
          "b": {
            len: 1,
            "k": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b1]}}}}}}}});

    tokenize("*@td.ru", 1, ast);
    expect(ast).to.eql({
      deep: 0,
      mask: 1,
      act: [0b11],
      len: 1,
      "*": {
        len: 1,
        "@": {
          len: 2,
          "b": {
            len: 1,
            "k": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b1]}}}}},
          "t": {
            len: 1,
            "d": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b10]}}}}}
        }
      },

    });
    tokenize("a?@*", 2, ast);

    expect(ast).to.eql({
      deep: 3,
      mask: 1,
      act: [0b111],
      len: 2,
      "*": {
        len: 1,
        "@": {
          len: 2,
          "b": {
            len: 1,
            "k": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b1]}}}}},
          "t": {
            len: 1,
            "d": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b10]}}}}}}},
      "a": {
        len: 1,
        "?": {
          len: 1,
          "@": {
            len: 1,
            "*": {
              len: 0,
              act: [0b100]
            }}}}});
    tokenize(null, 3, ast);
    expect(ast).to.eql({
      deep: 3,
      mask: 1,
      act: [0b1111],
      alw: [0b1000],
      len: 2,
      "*": {
        len: 1,
        "@": {
          len: 2,
          "b": {
            len: 1,
            "k": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b1]}}}}},
          "t": {
            len: 1,
            "d": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b10]}}}}}}},
      "a": {
        len: 1,
        "?": {
          len: 1,
          "@": {
            len: 1,
            "*": {
              len: 0,
              act: [0b100]}}}}});

    tokenize("*", 4, ast);
    expect(ast).to.eql({
      deep: 3,
      mask: 1,
      act: [0b11111],
      alw: [0b11000],
      len: 2,
      "*": {
        len: 1,
        "@": {
          len: 2,
          "b": {
            len: 1,
            "k": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b1]}}}}},
          "t": {
            len: 1,
            "d": {
              len: 1,
              ".": {
                len: 1,
                "r": {
                  len: 1,
                  "u": {
                    len: 0,
                    act: [0b10]}}}}}}},
      "a": {
        len: 1,
        "?": {
          len: 1,
          "@": {
            len: 1,
            "*": {
              len: 0,
              act: [0b100]}}}}});
  });

  it("check only * pattern", function() {
    var ast = {};
    tokenize("*", 0, ast);
    expect(ast).to.eql({
      deep: 0,
      mask: 1,
      act: [0b1],
      alw: [0b1],
      len: 0
    });

    tokenize("**", 1, ast);
    expect(ast).to.eql({
      deep: 0,
      mask: 1,
      act: [0b11],
      alw: [0b11],
      len: 0
    });
    tokenize("***", 2, ast);
    expect(ast).to.eql({
      deep: 0,
      mask: 1,
      act: [0b111],
      alw: [0b111],
      len: 0
    });
  });

  it("check complex multiple * pattern", function() {
    var ast = tokenize("**@**.c*m**", 0);
    expect(ast).to.eql({
      deep: 0,
      mask: 1,
      act: [0b1],
      len: 1,
      "*": {
        len: 1,
        "@": {
          len: 1,
          "*": {
            len: 1,
            ".": {
              len: 1,
              "c": {
                len: 1,
                "*": {
                  len: 1,
                  "m": {
                    len: 1,
                    "*": {
                      len: 0,
                      act: [0b1]}}}}}}}}});
  });

  it("check big index", function() {
    /* eslint no-sparse-arrays:0 */
    var ast = {};
    tokenize("z", 0, ast);
    tokenize("a", 29, ast);
    tokenize("b", 30, ast);
    tokenize("c", 31, ast);
    expect(ast).to.eql({
      deep: 0,
      mask: 2,
      len: 4,
      act: [1 | 1 << 29 | 1 << 30, 1],
      z: {
        len: 0,
        act: [1]},
      a: {
        len: 0,
        act: [1 << 29]},
      b: {
        len: 0,
        act: [1 << 30]},
      c: {
        len: 0,
        act: [, 1]}
    });
  });
});
