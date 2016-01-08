"use strict";

function write_ascii_to_memory(string, memory) {
  var heap8 = Module.HEAP8;
  var length = string.length;
  for (var i = 0; i < length; i++) {
    heap8[memory++] = string.charCodeAt(i);
  }
  heap8[memory++] = 0;
  return memory;
}

var raw_buffer_size = 16 * 1024 * 1024;

function raw_buffer_add(raw_buffers) {
  var buffer = Module._malloc(raw_buffer_size);
  raw_buffers.buffers.push(buffer);
  raw_buffers.pos = buffer;
  raw_buffers.end = buffer + raw_buffer_size;
}

function raw_buffers_init() {
  return { buffers: [], pos: 0, end: 0 };
}

function raw_buffers_free(raw_buffers) {
  raw_buffers.buffers.some(function(buffer) {
    Module._free(buffer);
  });
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
    heap32[pos++] = message.from.length;
    heap32[pos++] = pos_raw;
    pos_raw = write_ascii_to_memory(message.to, pos_raw);
    heap32[pos++] = message.to.length;

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

  }

  raw_buffers.pos = pos_raw;

}

function parse_output(messages, rules, messages_order, messages_count, results_buffer) {

  var heap32 = Module.HEAP32;
  var pos = results_buffer >> 2;
  var results = messages; // ВНИМАНИЕ! ПОРЧУ ИСХОДНЫЙ ОБЪЕКТ

  for (var i = 0; i < messages_count; i++) {
    var key = messages_order[i];
    var result = results[key] = [];
    var header = heap32[pos++]
    if (header > 0) {
      result[header - 1] = null;
    }
    var end = pos + header;
    var index = 0;
    for (var j = pos; j < end; j++, index++) {
      result[index] = rules[heap32[j]].action;
    }
    pos = end;
  }

  return results;

}

function solve(messages, rules) {

  var messages_order = Object.keys(messages);
  var messages_count = messages_order.length;
  var rules_order = rules;
  var rules_count = rules_order.length;

  var sizeof_messages = 16 * messages_count;
  var sizeof_rules = 8 * rules_count;
  var raw_buffers = raw_buffers_init();
  var messages_buffer = Module._malloc(sizeof_messages);
  var rules_buffer = Module._malloc(sizeof_rules);

  stringify_input_messages(
    messages, messages_order, messages_count, messages_buffer, raw_buffers
  );

  stringify_input_rules(
    rules, rules_order, rules_count, rules_buffer, raw_buffers
  );

  Module.ticks_counter = 0;

  var results_buffer = Module.ccall(
    'solve', 'number', [
    'number', 'number',
    'number', 'number',
  ], [
    messages_buffer, rules_buffer,
    messages_count, rules_count
  ]);

  if (Module.ticks_counter) {
    console.log("ticks_counter " + Module.ticks_counter.toString());
  }

  var result = parse_output(
    messages, rules, messages_order, messages_count, results_buffer
  );

  // raw_buffers_free(raw_buffers);
  // Module._free(messages_buffer);
  // Module._free(rules_buffer);

  // Module.ccall('cleanup', 'number', [], []); // THEY RESTART VM!

  return result;

}

module.exports = solve;

(function REMOVE_BEFORE_FLIGHT() {

  module.exports.write_ascii_to_memory = write_ascii_to_memory;
  module.exports.parse_output = parse_output;

  if (!module.parent) {
    require("./utility.js").no_parent(module.exports);
  }

})();
