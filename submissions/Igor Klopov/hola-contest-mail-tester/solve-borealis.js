#!/usr/bin/env node

// Aho-Corasick in pure JS

"use strict";

var MINIMAL_WIDTH = 6;

var AC_MIN_SYMBOL = 0x20;
var AC_MAX_SYMBOL = 0x7F;
var SYMBOLS = AC_MAX_SYMBOL - AC_MIN_SYMBOL + 1;

// Goto list

function ac_goto_list_new() {
  var gotos = [];
  gotos[SYMBOLS - 1] = undefined;
  return gotos;
}

function ac_goto_list_get(self, symbol) {
  return self.gotos[symbol - AC_MIN_SYMBOL];
}

function ac_goto_list_add(self, symbol, state) {
  self.gotos[symbol - AC_MIN_SYMBOL] = state;
}

// Output list

function ac_output_list_new() {
  return [];
}

function ac_output_list_add(self, object, object2) {
  var length = self.length;
  self[length++] = object;
  self[length++] = object2;
}

function ac_output_list_add_list(self, other) {
  var other_length = other.length;
  for (var i = 0; i < other_length; i += 2) {
    ac_output_list_add(self, other[i], other[i + 1]);
  }
}

// Result list

function ac_result_list_add_outputs_KLOPOV4(objects, outputs) {
  var length = outputs.length;
  for (var i = 0; i < length; i += 2) {
    objects[outputs[i]] |= outputs[i + 1];
  }
}

// State object

function ac_state_new() {
  return {
    gotos: ac_goto_list_new(),
    outputs: ac_output_list_new(),
    failure: undefined
  }
}

// State queue

// TODO

// Index object

function ac_index_new() {
  return {
    state_0: ac_state_new()
  }
}

function ac_index_enter(index, keyword, start, size, object, object2) {
  var state = index.state_0;
  var j = start;
  var new_state = null;
  var finish = start + size;

  while ((j < finish) &&
         (new_state = ac_goto_list_get(state, keyword.charCodeAt(j)))) {
    state = new_state;
    j++;
  }

  while (j < finish) {
    new_state = ac_state_new();
    ac_goto_list_add(state, keyword.charCodeAt(j), new_state);
    state = new_state;
    j++;
  }

  ac_output_list_add(state.outputs, object, object2);
}

function ac_index_fix(self) {
  var symbol = 0;
  var state = null;
  var r = null;
  var queue = [];
  var new_state = null;
  var next = null;

  for (symbol = AC_MIN_SYMBOL; symbol <= AC_MAX_SYMBOL; symbol++) {
    if (state = ac_goto_list_get(self.state_0, symbol)) {
      queue.push(state);
      state.failure = self.state_0;
    } else {
      ac_goto_list_add(self.state_0, symbol, self.state_0);
    }
  }

  while (r = queue.shift()) {

    for (symbol = AC_MIN_SYMBOL; symbol <= AC_MAX_SYMBOL; symbol++) {
      new_state = ac_goto_list_get(r, symbol);
      state = r.failure;
      next =  ac_goto_list_get(state, symbol);

      if (new_state) {
        queue.push(new_state);
        new_state.failure = next;
        ac_output_list_add_list(new_state.outputs, next.outputs);
      } else {
        ac_goto_list_add(r, symbol, next);
      }
    }

  }
}

function ac_index_query_KLOPOV4(self, phrase, objects) {
  var size = phrase.length;
  var state = self.state_0;
  for (var j = 0; j < size; j++) {
    state = ac_goto_list_get(state, phrase.charCodeAt(j));
    ac_result_list_add_outputs_KLOPOV4(objects, state.outputs);
  }
}

function brain_new(messages, rules) {
  var masks_from = [];
  var masks_to = [];
  var query_from = [];
  var query_to = [];
  var length = rules.length;
  masks_from[length - 1] = undefined;
  masks_to[length - 1] = undefined;
  query_from[length - 1] = undefined;
  query_to[length - 1] = undefined;
  return {
    messages: messages,
    messages_order: Object.keys(messages),
    rules: rules,
    index_from: ac_index_new(),
    index_to: ac_index_new(),
    masks_from: masks_from,
    masks_to: masks_to,
    query_from: query_from,
    query_to: query_to
  }
}

function brain_process_rule(s, index, n, masks) {
  if (!s) {
    masks[n] = 0;
    return;
  }
  var pos = 0;
  var start = 0;
  var length = 0;
  var bit = 1;
  var char = 0;
  while (true) {
    char = s.charCodeAt(pos); // TODO LEFT_SIDE
    if ((isNaN(char)) ||
        (char === 42) || // *
        (char === 63)) { // ?
      if (pos !== start) {
        length = pos - start;
//        if (length > MINIMAL_WIDTH) {
          ac_index_enter(index, s, start, length, n, bit);
          bit = bit << 1;
          if (bit !== 0x40000000) break;
//        }
      }
      if (isNaN(char)) break;
      start = pos + 1;
    }
    pos++;
  }
  masks[n] = bit - 1;
}

function brain_process_rules(core) {
  var rules = core.rules;
  var length = rules.length;
  var index_from = core.index_from;
  var index_to = core.index_to;
  var masks_from = core.masks_from;
  var masks_to = core.masks_to;
  var query_from = core.query_from;
  var query_to = core.query_to;
  var rule;
  for (var n = 0; n < length; n++) {
    rule = rules[n];
    brain_process_rule(rule.from, index_from, n, masks_from);
    brain_process_rule(rule.to, index_to, n, masks_to);
    query_from[n] = 0;
    query_to[n] = 0;
  }
}

function brain_fix_indices(core) {
  ac_index_fix(core.index_from);
  ac_index_fix(core.index_to);
}

function handy(wildcard, string) {

  if (!wildcard) {
    return true;
  }

  var wsz = wildcard.length, ssz = string.length;
  var _wildcard = 0, _string = 0;
  var cp = 0, mp = 0;

  while ((_string < ssz) && (wildcard[_wildcard] !== "*")) {
    if ((wildcard[_wildcard] !== string[_string]) && (wildcard[_wildcard] !== "?")) {
      return false;
    }
    _wildcard++;
    _string++;
  }

  while (_string < ssz) {
    if (wildcard[_wildcard] === "*") {
      _wildcard++;
      if (_wildcard === wsz) {
        return true;
      }
      mp = _wildcard;
      cp = _string + 1;
    } else
    if ((wildcard[_wildcard] === string[_string]) || (wildcard[_wildcard] === "?")) {
      _wildcard++;
      _string++;
    } else {
      _wildcard = mp;
      _string = cp;
      cp++;
    }
  }

  while (wildcard[_wildcard] === "*") {
    _wildcard++;
  }

  return (_wildcard === wsz);

}

function relation_handy(message, rule) {
  return (handy(rule.from, message.from) &&
          handy(rule.to, message.to));
}

function brain_process_message(core, message) {
  var rules = core.rules;
  var rules_length = rules.length;
  var index_from = core.index_from;
  var index_to = core.index_to;
  var masks_from = core.masks_from;
  var masks_to = core.masks_to;
  var query_from = core.query_from;
  var query_to = core.query_to;
  var result = [];

  ac_index_query_KLOPOV4(
    index_from, message.from, query_from
  )

  ac_index_query_KLOPOV4(
    index_to, message.to, query_to
  )

  for (var i = 0; i < rules_length; i++) {

    if ( ( (masks_from[i] == 0) || (query_from[i] == masks_from[i]) ) &&
         ( (masks_to  [i] == 0) || (query_to  [i] == masks_to  [i]) ) ) {
      var rule = rules[i];
      if (relation_handy(message, rule)) {
        result.push(rule.action);
      }
    }

    query_from[i] = 0;
    query_to[i] = 0;

  }

  return result;

}

function brain_process_messages(core) {
  var messages = core.messages;
  var order = core.messages_order;
  var length = order.length;
  var message;
  for (var n = 0; n < length; n++) {
    message = messages[order[n]];
    messages[order[n]] = brain_process_message(core, message);
  }
  return messages;
}

function brain_solve(core) {
  brain_process_rules(core);
  brain_fix_indices(core);
  return brain_process_messages(core);
}

function solve(messages, rules) {
  var brain = brain_new(messages, rules);
  return brain_solve(brain);
};

module.exports = solve;

if (!module.parent) {
  require("./utility.js").no_parent(module.exports);
}
