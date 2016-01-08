#!/usr/bin/env node

"use strict";

var COMMENT = false;

var fs = require("fs");
var assert = require("assert");

var order = 0;

function check(counter) {
  assert.equal(counter, 1);
}

function removeLine(wrap, content) {

  console.log(content);

  var lines = wrap.lines;
  var output = [];
  var counter = 0;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.slice(-content.length) !== content) {
      output.push(line);
    } else {
      assert(i >= order);
      order = i;
      counter++;
    }
  }

  wrap.lines = output;

  return counter;

}

function clearBlock(wrap, start, end, remove) {

  console.log(start);

  var lines = wrap.lines;
  var removeStart = ((remove === "start") || (remove === "both"));
  var removeEnd = ((remove === "end") || (remove === "both"));

  var output = [];
  var removing = false;
  var level;
  var counter = 0;

  for (var i = 0; i < lines.length; i++) {

    var line = lines[i];

    if ((!removing) && (line.slice(-start.length) === start)) {
      removing = true;
      level = line.slice(0, line.length - start.length); // spaces at left from start
      counter++;
      assert(i >= order);
      order = i;
      if (!removeStart) output.push(line);
      if (removeStart && COMMENT) output.push(level + "// " + start);
    } else
    if ((removing) && (line === level + end)) {
      removing = false;
      if (!removeEnd) output.push(line);
      if (removeEnd && COMMENT) output.push(level + "// " + end);
    } else {
      if (!removing) output.push(line);
      if (removing && COMMENT) output.push(level + "// " + line.slice(level.length));
    }

  }

  wrap.lines = output;

  return counter;

}

module.exports = function(filename) {

  var lines = fs.readFileSync(filename, "utf8").split("\n");
  var wrap = { lines: lines };

  check(clearBlock(wrap, "Module.stdout = (function(b) {", "});", "both"));
  check(clearBlock(wrap, "var Module;", "var Runtime = {", "start"));

  check(clearBlock(wrap, "setTempRet0: (function(value) {", "}),", "both"));
  check(clearBlock(wrap, "getTempRet0: (function() {", "}),", "both"));
  check(clearBlock(wrap, "stackSave: (function() {", "}),", "both"));
  check(clearBlock(wrap, "stackRestore: (function(stackTop) {", "}),", "both"));
  check(clearBlock(wrap, "getNativeTypeSize: (function(type) {", "}),", "both"));
  check(clearBlock(wrap, "getNativeFieldSize: (function(type) {", "}),", "both"));
  check(clearBlock(wrap, "prepVararg: (function(ptr, type) {", "}),", "both"));
  check(clearBlock(wrap, "getAlignSize: (function(type, size, vararg) {", "}),", "both"));
  check(clearBlock(wrap, "dynCall: (function(sig, ptr, args) {", "}),", "both"));
  check(clearBlock(wrap, "addFunction: (function(func) {", "}),", "both"));
  check(clearBlock(wrap, "removeFunction: (function(index) {", "}),", "both"));
  check(clearBlock(wrap, "warnOnce: (function(text) {", "}),", "both"));
  check(clearBlock(wrap, "getFuncWrapper: (function(func, sig) {", "}),", "both"));
  check(clearBlock(wrap, "getCompilerSetting: (function(name) {", "}),", "both"));
  check(clearBlock(wrap, "makeBigInt: (function(low, high, unsigned) {", "}),", "both"));

  check(clearBlock(wrap, "var func = Module[\"_\" + ident];", "return func;"));
  check(clearBlock(wrap, "var JSfuncs = {", "};", "both"));
  check(clearBlock(wrap, "var toC = {", "};"));
  check(clearBlock(wrap, "var sourceRegex = /^function\\s*\\(([^)]*)\\)\\s*{\\s*([^*]*?)[\\s;]*(?:return\\s*(.*?)[;\\s]*)?}$/;", "}", "both"));
  check(clearBlock(wrap, "for (var fun in JSfuncs) {", "}", "both"));
  check(clearBlock(wrap, "cwrap = function cwrap(ident, returnType, argTypes) {", "};", "both"));

  check(removeLine(wrap, "Module[\"cwrap\"] = cwrap;"));

  check(clearBlock(wrap, "function setValue(ptr, value, type, noSafe) {", "}", "both"));
  check(removeLine(wrap, "Module[\"setValue\"] = setValue;"));

  check(clearBlock(wrap, "function getValue(ptr, type, noSafe) {", "}", "both"));
  check(removeLine(wrap, "Module[\"getValue\"] = getValue;"));

  check(removeLine(wrap, "Module[\"ALLOC_NORMAL\"] = ALLOC_NORMAL;"));
  check(removeLine(wrap, "Module[\"ALLOC_STACK\"] = ALLOC_STACK;"));
  check(removeLine(wrap, "Module[\"ALLOC_STATIC\"] = ALLOC_STATIC;"));
  check(removeLine(wrap, "Module[\"ALLOC_DYNAMIC\"] = ALLOC_DYNAMIC;"));
  check(removeLine(wrap, "Module[\"ALLOC_NONE\"] = ALLOC_NONE;"));

  check(removeLine(wrap, "Module[\"allocate\"] = allocate;"));

  check(clearBlock(wrap, "function getMemory(size) {", "}", "both"));
  check(removeLine(wrap, "Module[\"getMemory\"] = getMemory;"));

  check(clearBlock(wrap, "function Pointer_stringify(ptr, length) {", "}", "both"));
  check(removeLine(wrap, "Module[\"Pointer_stringify\"] = Pointer_stringify;"));

  check(clearBlock(wrap, "function AsciiToString(ptr) {", "}", "both"));
  check(removeLine(wrap, "Module[\"AsciiToString\"] = AsciiToString;"))

  check(clearBlock(wrap, "function stringToAscii(str, outPtr) {", "}", "both"));
  check(removeLine(wrap, "Module[\"stringToAscii\"] = stringToAscii;"))

  check(clearBlock(wrap, "function UTF8ArrayToString(u8Array, idx) {", "}", "both"));
  check(removeLine(wrap, "Module[\"UTF8ArrayToString\"] = UTF8ArrayToString;"))

  check(clearBlock(wrap, "function UTF8ToString(ptr) {", "}", "both"));
  check(removeLine(wrap, "Module[\"UTF8ToString\"] = UTF8ToString;"))

  check(clearBlock(wrap, "function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {", "}", "both"));
  check(removeLine(wrap, "Module[\"stringToUTF8Array\"] = stringToUTF8Array;"))

  check(clearBlock(wrap, "function stringToUTF8(str, outPtr, maxBytesToWrite) {", "}", "both"));
  check(removeLine(wrap, "Module[\"stringToUTF8\"] = stringToUTF8;"))

  check(clearBlock(wrap, "function lengthBytesUTF8(str) {", "}", "both"));
  check(removeLine(wrap, "Module[\"lengthBytesUTF8\"] = lengthBytesUTF8;"))

  check(clearBlock(wrap, "function UTF16ToString(ptr) {", "}", "both"));
  check(removeLine(wrap, "Module[\"UTF16ToString\"] = UTF16ToString;"))

  check(clearBlock(wrap, "function stringToUTF16(str, outPtr, maxBytesToWrite) {", "}", "both"));
  check(removeLine(wrap, "Module[\"stringToUTF16\"] = stringToUTF16;"))

  check(clearBlock(wrap, "function lengthBytesUTF16(str) {", "}", "both"));
  check(removeLine(wrap, "Module[\"lengthBytesUTF16\"] = lengthBytesUTF16;"))

  check(clearBlock(wrap, "function UTF32ToString(ptr) {", "}", "both"));
  check(removeLine(wrap, "Module[\"UTF32ToString\"] = UTF32ToString;"))

  check(clearBlock(wrap, "function stringToUTF32(str, outPtr, maxBytesToWrite) {", "}", "both"));
  check(removeLine(wrap, "Module[\"stringToUTF32\"] = stringToUTF32;"))

  check(clearBlock(wrap, "function lengthBytesUTF32(str) {", "}", "both"));
  check(removeLine(wrap, "Module[\"lengthBytesUTF32\"] = lengthBytesUTF32;"))

  check(clearBlock(wrap, "function demangle(func) {", "}", "both"));
  check(clearBlock(wrap, "function demangleAll(text) {", "}", "both"));
  check(clearBlock(wrap, "function jsStackTrace() {", "}", "both"));

  check(clearBlock(wrap, "function stackTrace() {", "}"));
  check(removeLine(wrap, "Module[\"stackTrace\"] = stackTrace;"))

  check(clearBlock(wrap, "function callRuntimeCallbacks(callbacks) {", "}", "both"));
  check(clearBlock(wrap, "function preRun() {", "}", "both"));
  check(clearBlock(wrap, "function ensureInitRuntime() {", "}", "both"));
  check(clearBlock(wrap, "function preMain() {", "}", "both"));
  check(clearBlock(wrap, "function exitRuntime() {", "}", "both"));
  check(clearBlock(wrap, "function postRun() {", "}", "both"));

  check(clearBlock(wrap, "function addOnPreRun(cb) {", "}", "both"));
  check(removeLine(wrap, "Module[\"addOnPreRun\"] = addOnPreRun;"));

  check(clearBlock(wrap, "function addOnInit(cb) {", "}", "both"));
  check(removeLine(wrap, "Module[\"addOnInit\"] = addOnInit;"));

  check(clearBlock(wrap, "function addOnPreMain(cb) {", "}", "both"));
  check(removeLine(wrap, "Module[\"addOnPreMain\"] = addOnPreMain;"));

  check(clearBlock(wrap, "function addOnExit(cb) {", "}", "both"));
  check(removeLine(wrap, "Module[\"addOnExit\"] = addOnExit;"));

  check(clearBlock(wrap, "function addOnPostRun(cb) {", "}", "both"));
  check(removeLine(wrap, "Module[\"addOnPostRun\"] = addOnPostRun;"));

  check(clearBlock(wrap, "function intArrayFromString(stringy, dontAddNull, length) {", "}", "both"));
  check(removeLine(wrap, "Module[\"intArrayFromString\"] = intArrayFromString;"));

  check(clearBlock(wrap, "function intArrayToString(array) {", "}", "both"));
  check(removeLine(wrap, "Module[\"intArrayToString\"] = intArrayToString;"));

  check(clearBlock(wrap, "function writeStringToMemory(string, buffer, dontAddNull) {", "}", "both"));
  check(removeLine(wrap, "Module[\"writeStringToMemory\"] = writeStringToMemory;"));

  check(clearBlock(wrap, "function writeArrayToMemory(array, buffer) {", "}", "both"));
  check(removeLine(wrap, "Module[\"writeArrayToMemory\"] = writeArrayToMemory;"));

  check(clearBlock(wrap, "function writeAsciiToMemory(str, buffer, dontAddNull) {", "}", "both"));
  check(removeLine(wrap, "Module[\"writeAsciiToMemory\"] = writeAsciiToMemory;"));

  check(clearBlock(wrap, "function unSign(value, bits, ignore) {", "}", "both"));
  check(clearBlock(wrap, "function reSign(value, bits, ignore) {", "}", "both"));

  check(clearBlock(wrap, "function getUniqueRunDependency(id) {", "}", "both"));

  check(clearBlock(wrap, "function addRunDependency(id) {", "}", "both"));
  check(removeLine(wrap, "Module[\"addRunDependency\"] = addRunDependency;"));

  check(clearBlock(wrap, "function removeRunDependency(id) {", "}", "both"));
  check(removeLine(wrap, "Module[\"removeRunDependency\"] = removeRunDependency;"));

  check(clearBlock(wrap, "function copyTempFloat(ptr) {", "}", "both"));
  check(clearBlock(wrap, "function copyTempDouble(ptr) {", "}", "both"));

  check(clearBlock(wrap, "dependenciesFulfilled = function runCaller() {", "};", "both"));
  check(clearBlock(wrap, "Module[\"callMain\"] = Module.callMain = function callMain(args) {", "};", "both"));

  check(clearBlock(wrap, "function run(args) {", "}"));
  check(removeLine(wrap, "Module[\"run\"] = Module.run = run;"));

  check(clearBlock(wrap, "function exit(status, implicit) {", "}"));
  check(removeLine(wrap, "Module[\"exit\"] = Module.exit = exit;"));

  // check(clearBlock(wrap, "function abort(what) {", "}"));
  check(removeLine(wrap, "Module[\"abort\"] = Module.abort = abort;"));

  check(clearBlock(wrap, "if (Module[\"preInit\"]) {", "}", "both"));

  check(clearBlock(wrap, "if (Module.ticks_counter) {", "}", "both"));
  check(clearBlock(wrap, "(function REMOVE_BEFORE_FLIGHT() {", "})();", "both"));

  wrap.lines = wrap.lines.filter(function(line) {
    return line;
  });

  fs.writeFileSync(filename, wrap.lines.join("\n") + "\n", "utf8");

}

if (!module.parent) {
  module.exports(process.argv[2]);
}
