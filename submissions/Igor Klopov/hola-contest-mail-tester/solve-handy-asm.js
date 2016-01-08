#!/usr/bin/env node

"use strict";

function allocate_memory(ex) {

  var ms = JSON.stringify(ex.messages);
  var rs = JSON.stringify(ex.rules);
  ex.mb = new Buffer(ms, "ascii");
  ex.rb = new Buffer(rs, "ascii");

  ex.morder = Object.keys(ex.messages);
  ex.msize = ex.morder.length;
  ex.rorder = ex.rules;
  ex.rsize = ex.rorder.length;

  var mbrb = ex.mb.length + ex.rb.length;
  var mbrb4 = mbrb + pad4(mbrb);

  ex.section_header = (
    4 + // poex to footer
    4 + // msize
    4   // rsize
  );

  ex.section_mbrb = (
    mbrb
  );

  ex.section_padding = (
    mbrb4 - mbrb
  );

  ex.section_matrix = (
    ex.msize * (4 + 4) + // from, to
    ex.rsize * (4 + 4)   // from, to
  );

  ex.section_results = (
    ex.msize * (ex.rsize + 1) * 4 // + 1 - будут заканчиваться нулями
  );

  var section_header_buffer = new Buffer(ex.section_header);
  section_header_buffer.writeInt32LE(ex.section_header + ex.section_mbrb + ex.section_padding, 0);
  section_header_buffer.writeInt32LE(ex.msize, 4);
  section_header_buffer.writeInt32LE(ex.rsize, 8);

  var section_padding_buffer = new Buffer(ex.section_padding);
  section_padding_buffer.fill(0);

  var section_footer_buffer = new Buffer(ex.section_matrix + ex.section_results);
  section_footer_buffer.fill(0);

  ex.bb = Buffer.concat([
    section_header_buffer,
    ex.mb, ex.rb, section_padding_buffer,
    section_footer_buffer
  ]);

}

function populate_memory(ex) {

  var heap8 = ex.heap8 = new Uint8Array(ex.bb);
  var heap32 = ex.heap32 = new Int32Array(heap8.buffer);

  var posi = ex.section_header;
  var poso = ((ex.section_header + ex.section_mbrb + ex.section_padding) >> 2);

  posi += 1; // {

  ex.morder.forEach(function(key) {
    posi += (5 + key.length); // "msg1":"
    var message = ex.messages[key];
    while (1) {
      if (heap8[posi - 1] === 44) { // ,
        break;
      } else
      if (heap8[posi] === 102) { // f
        posi += 7; // from":"
        var length = message.from.length;
        heap8[posi + length] = 0;
        heap32[poso] = posi;
        posi += (length + 3);
      } else
      if (heap8[posi] === 116) { // t
        posi += 5; // to":"
        var length = message.to.length;
        heap8[posi + length] = 0;
        heap32[poso + 1] = posi;
        posi += (length + 3);
      } else
      if (heap8[posi] === 91) { // [
        break;
      } else {
        console.log(posi, heap8[posi]);
        throw new Error(heap8[posi]); // TODO comment
      }
    }
    poso += 2;
  });

  posi += 3; // "}}[{" против "},

  ex.rorder.forEach(function(rule) {
    while (1) {
      if (heap8[posi - 1] === 93) { // ]
        break;
      } else
      if (heap8[posi] === 102) { // f
        posi += 7; // from":"
        var length = rule.from.length;
        heap8[posi + length] = 0;
        heap32[poso] = posi;
        posi += (length + 3);
      } else
      if (heap8[posi] === 116) { // t
        posi += 5; // to":"
        var length = rule.to.length;
        heap8[posi + length] = 0;
        heap32[poso + 1] = posi;
        posi += (length + 3);
      } else
      if (heap8[posi] === 97) { // a
        posi += 9; // action":"
        var length = rule.action.length;
        posi += (length + 3);
      } else
      if (heap8[posi] === 123) { // {
        break;
      } else {
        console.log(posi, heap8[posi]);
        throw new Error(heap8[posi]); // TODO comment
      }
    }
    posi += 2;
    poso += 2;
  });

}

function execute_asm(stdlib, env, heap) {
  "use asm";

  var Math = stdlib.Math;
  var Uint8Array = stdlib.Uint8Array;
  var Int32Array = stdlib.Int32Array;
  var HEAP8 = new Uint8Array(heap);
  var HEAP32 = new Int32Array(heap);

  function match(wild, string) {

    wild = wild|0;
    string = string|0;
    var cp = 0;
    var mp = 0;
    cp = 0|0;
    mp = 0|0;

    while (1) {

      if ( ( HEAP8[ string>>0 ]|0 ) == ( 0|0 ) ) break;
      if ( ( HEAP8[ wild>>0 ]|0 ) == ( 42|0 ) ) break; // *

      if ( ( HEAP8[ wild>>0 ]|0 ) != ( HEAP8[ string>>0 ]|0 ) ) {
        if ( ( HEAP8[ wild>>0 ]|0 ) != ( 63|0 ) ) { // ?
          return 0|0;
        }
      }

      wild = ( ( wild|0 ) + ( 1|0 ) )|0;
      string = ( ( string|0 ) + ( 1|0 ) )|0;

    }

    while (1) {

      if ( ( HEAP8[ string>>0 ]|0 ) == ( 0|0 ) ) break;

      if ( ( HEAP8[ wild>>0 ]|0 ) == ( 42|0 ) ) { // *
        wild = ( ( wild|0 ) + ( 1|0 ) )|0;
        if ( ( HEAP8[ wild>>0 ]|0 ) == ( 0|0 ) ) {
          return 1|0;
        }
        mp = wild|0;
        cp = ( (string|0) + (1|0) )|0;
      } else {

        if ( ( HEAP8[ wild>>0 ]|0 ) == ( HEAP8[ string>>0 ]|0 ) ) {
          wild = ( ( wild|0 ) + ( 1|0 ) )|0;
          string = ( ( string|0 ) + ( 1|0 ) )|0;
        } else {

          if ( ( HEAP8[ wild>>0 ]|0 ) == ( 63|0 ) ) { // ?
            wild = ( ( wild|0 ) + ( 1|0 ) )|0;
            string = ( ( string|0 ) + ( 1|0 ) )|0;
          } else {

            wild = mp|0;
            string = cp|0;
            cp = ( ( cp|0 ) + ( 1|0 ) )|0;

          }

        }

      }

    }

    while (1) {

      if ( ( HEAP8[ wild>>0 ]|0 ) != ( 42|0 ) ) break; // *

      wild = ( ( wild|0 ) + ( 1|0 ) )|0;

    }

    if ( ( HEAP8[ wild>>0 ]|0 ) == ( 0|0 ) ) {
      return 1|0;
    } else {
      return 0|0;
    }

  }

  function match_or_empty(wild, string) {
    wild = wild|0;
    string = string|0;
    var wp = 0;
    var sp = 0;
    wp = HEAP32[ (wild|0)>>2 ]|0;
    sp = HEAP32[ (string|0)>>2 ]|0;
    if ( ( wp|0 ) == ( 0|0 ) ) {
      return 1|0;
    } else {
      return match(wp, sp);
    }
  }

  function relation(message_from, rule_from) {
    message_from = message_from|0;
    rule_from = rule_from|0;
    var message_to = 0;
    var rule_to = 0;
    var f = 0;
    var t = 0;
    message_to = ( ( message_from|0 ) + ( 4|0 ) )|0;
    rule_to = ( ( rule_from|0 ) + ( 4|0 ) )|0;
    f = match_or_empty( rule_from|0, message_from|0 )|0;
    if ( ( f|0 ) == ( 1|0 ) ) {
      t = match_or_empty( rule_to|0, message_to|0 )|0;
      if ( ( t|0 ) == ( 1|0 ) ) {
        return 1|0;
      } else {
        return 0|0;
      }
    } else {
      return 0|0;
    }
  }

  function main() {

    var footer = 0;
    var msize = 0;
    var rsize = 0;
    var mcounter = 0;
    var rcounter = 0;
    var message = 0;
    var rule_start = 0;
    var rule = 0;
    var result = 0;
    var f = 0;

    footer = HEAP32[ 0>>2 ]|0;
    msize = HEAP32[ 4>>2 ]|0;
    rsize = HEAP32[ 8>>2 ]|0;
    mcounter = 0|0;
    rcounter = 0|0;

    message = footer|0;
    rule_start = ( ( message|0 ) + ( Math.imul( msize|0, 8|0 )|0 ) )|0;
    rule = rule_start|0;
    result = ( ( rule_start|0 ) + ( Math.imul( rsize|0, 8|0 )|0 ) )|0;

    while (1) {

      if ( ( mcounter|0 ) == ( msize|0 ) ) break;

      while (1) {

        if ( ( rcounter|0 ) == ( rsize|0 ) ) break;

        if ( ( relation( message|0, rule|0 )|0 ) == ( 1|0 ) ) {
          HEAP32[ result>>2 ] = rcounter|0;
          result = ( ( result|0)  + ( 4|0 ) )|0;
        }

        rule = ( ( rule|0 ) + ( 8|0 ) )|0;
        rcounter = ( ( rcounter|0 ) + ( 1|0 ) )|0;

      }

      HEAP32[ result>>2 ] = 0x7FFFFFFF;
      result = ( ( result|0 ) + ( 4|0 ) )|0;

      message = ( ( message|0 ) + ( 8|0 ) )|0;
      mcounter = ( ( mcounter|0)  + ( 1|0 ) )|0;

      rule = rule_start|0;
      rcounter = 0|0;

    }

    return 0|0;

  }


  return main();

};

function parse_memory(ex) {

  var heap8 = ex.heap8;
  var heap32 = ex.heap32;

  var posu = ((ex.section_header + ex.section_mbrb + ex.section_padding + ex.section_matrix) >> 2);
  var results = {};
  var i = 0;

  while (i < ex.msize) {
    var key = ex.morder[i];
    results[key] = [];
    while (true) {
      var index = heap32[posu];
      posu++;
      if (index === 0x7FFFFFFF) break;
      results[key].push(ex.rules[index].action);
    }
    i++;
  }

  return results;

}

function pad4(x) {
  return [0, 3, 2, 1][x % 4];
}

function solve(messages, rules) {

  var ex = { messages: messages, rules: rules };
  allocate_memory(ex);
  populate_memory(ex);

  execute_asm({
    Math: Math,
    Uint8Array: Uint8Array,
    Int32Array: Int32Array
  }, {}, ex.heap8.buffer);

  return parse_memory(ex);

};

module.exports = solve;

if (!module.parent) {
  require("./utility.js").no_parent(module.exports);
}
