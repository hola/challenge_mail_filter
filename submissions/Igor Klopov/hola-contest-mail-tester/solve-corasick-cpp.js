#!/usr/bin/env node

"use strict";

var spawn_sync = require("child_process").spawnSync;
var parse_string = require("xml2js").parseString;

var Module = global.Module = {};
var TOTAL_MEMORY = 256 * 1024 * 1024;
var HEAP = new ArrayBuffer(TOTAL_MEMORY);

var postjs = require("../hola-contest-mail/solve-corasick-postjs.js");
var write_ascii_to_memory = postjs.write_ascii_to_memory;
var parse_output = postjs.parse_output;

function write_heap8_to_buffer(heap8, buffer) {
  var length = buffer.length;
  for (var i = 0; i < length; i++) {
    buffer[i] = heap8[i];
  }
}

var raw_buffer_size = 16 * 1024 * 1024;

function raw_buffers_init_simple(start) {
  var raw_buffers = {};
  raw_buffers.start = start;
  raw_buffers.pos = start;
  raw_buffers.end = start + raw_buffer_size;
  return raw_buffers;
}

function stringify_input_messages(messages, messages_order, messages_count, messages_buffer, raw_buffers) {

  var heap8 = Module.HEAP8;
  var heap32 = Module.HEAP32;
  var pos = messages_buffer >> 2;
  var pos_raw = raw_buffers.pos;
  var end_raw = raw_buffers.end;

  for (var i = 0; i < messages_count; i++) {

    var key = messages_order[i];
    var message = messages[key];

    if (pos_raw + message.from.length + message.to.length + 2 > end_raw) { // + ZERO
      raw_buffer_add(raw_buffers);
      pos_raw = raw_buffers.pos;
      end_raw = raw_buffers.end;
    }

    heap32[pos++] = pos_raw;
    pos_raw = write_ascii_to_memory(message.from, pos_raw);
    heap32[pos++] = 0; // pad to 64 bit
    heap32[pos++] = message.from.length;
    heap32[pos++] = 0; // pad to 64 bit
    heap32[pos++] = pos_raw;
    pos_raw = write_ascii_to_memory(message.to, pos_raw);
    heap32[pos++] = 0; // pad to 64 bit
    heap32[pos++] = message.to.length;
    heap32[pos++] = 0; // pad to 64 bit

  }

  raw_buffers.pos = pos_raw;

}

function stringify_input_rules(rules, rules_order, rules_count, rules_buffer, raw_buffers) {

  var heap8 = Module.HEAP8;
  var heap32 = Module.HEAP32;
  var pos = rules_buffer >> 2;
  var pos_raw = raw_buffers.pos;
  var end_raw = raw_buffers.end;

  for (var i = 0; i < rules_count; i++) {

    var rule = rules[i];
    var rule_from = rule.from;
    var rule_to = rule.to;

    if (!rule_from) {
      heap32[pos++] = 0;
    } else {
      if (pos_raw + rule_from.length + 2 > end_raw) { // + ZERO
        raw_buffer_add(raw_buffers);
        pos_raw = raw_buffers.pos;
        end_raw = raw_buffers.end;
      }
      heap32[pos++] = pos_raw;
      pos_raw = write_ascii_to_memory(rule_from, pos_raw);
    }

    heap32[pos++] = 0; // pad to 64 bit

    if (!rule_to) {
      heap32[pos++] = 0;
    } else {
      if (pos_raw + rule_to.length + 2 > end_raw) { // + ZERO
        raw_buffer_add(raw_buffers);
        pos_raw = raw_buffers.pos;
        end_raw = raw_buffers.end;
      }
      heap32[pos++] = pos_raw;
      pos_raw = write_ascii_to_memory(rule_to, pos_raw);
    }

    heap32[pos++] = 0; // pad to 64 bit

  }

  raw_buffers.pos = pos_raw;

}

function solve_with_fail_cb(messages, rules, fail, cb) {

  var messages_order = Object.keys(messages);
  var messages_count = messages_order.length;
  var rules_order = rules;
  var rules_count = rules_order.length;

  var sizeof_messages = 32 * messages_count; // 64 bit pointers
  var sizeof_rules = 16 * rules_count;
  var messages_buffer = 0;
  var rules_buffer = sizeof_messages;
  var raw_buffers = raw_buffers_init_simple(sizeof_messages + sizeof_rules);

  Module.HEAP8 = new Int8Array(HEAP);
  Module.HEAP32 = new Int32Array(HEAP);

  stringify_input_messages(
    messages, messages_order, messages_count, messages_buffer, raw_buffers
  );

  stringify_input_rules(
    rules, rules_order, rules_count, rules_buffer, raw_buffers
  );

  var input = new Buffer(raw_buffers.end);
  write_heap8_to_buffer(Module.HEAP8, input);
  input = Buffer.concat([new Buffer(4 * 3), input]);
  input.writeInt32LE(messages_count, 0);
  input.writeInt32LE(rules_count, 4);
  input.writeInt32LE(raw_buffers.end - raw_buffers.start, 8);

  var child = spawn_sync("valgrind", [
    "--xml=yes", "--xml-fd=2", // ********************************
    "--leak-check=full",
    "--show-reachable=yes",
    "./solve-corasick.exe"
  ], {
    input: input,
    env: { ACF_FAIL_AT: fail }
  });

  if (child.error) {
    return cb(child.error);
  }

  var stdout = child.stdout;
  var stderr = child.stderr;

  if (!stdout) {
    return cb(new Error("No exe-file found or Valgrind not installed"));
  }

  parse_string(stderr, function(error, valgrind) {

    if (error) {
      console.log(stderr.toString());
    }

    if (valgrind) {

      var errors = valgrind.valgrindoutput.error;

      if (errors && errors.length) {
        return cb(new Error("Valgrind errors found"));
      }

    }

    Module.HEAP8 = new Int8Array(stdout.buffer);
    Module.HEAP32 = new Int32Array(stdout.buffer);
    var results = parse_output(messages, rules, messages_order, messages_count, 0);
    cb(null, results);

  });

};

function solve_with_cb(messages, rules, cb) {
  solve_with_fail_cb(messages, rules, 0, cb);
}

module.exports.solve_with_cb = solve_with_cb;

if (!module.parent) {

  var counter = 0;

  function loop() {
    // console.log("acf_fail_at", counter++);
    require("./utility.js").no_parent({
      solve_with_cb: function(messages, rules, cb) {
        solve_with_fail_cb(messages, rules, counter, cb);
      }
    }, function(error, results) {
      if (error) throw error;
      console.log(results);
      // loop();
    })
  }

  loop();

}
