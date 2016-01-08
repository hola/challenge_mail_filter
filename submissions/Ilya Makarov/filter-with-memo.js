'use strict'

const MATCH_ALL       = 0b00000;
const CHECK_FROM      = 0b00001;
const CHECK_TO        = 0b00010;
const CHECK_FROM_SMPL = 0b00100;
const CHECK_TO_SMPL   = 0b01000;

exports.filter = function (messages, rules) {
   var result = {};
   var _rules = [];
   var _memo = {};
   var split_char = String.fromCharCode(0x80);

   function toRe(wildcard) {
       var re = wildcard
           .replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&')
           .replace(/[*]/g, '.*')
           .replace(/[?]/g, '.');
       return new RegExp('^'+re+'$');
   }

   for (var i = 0; i < rules.length; i++) {
       var _rule = {c: MATCH_ALL, f: null, t: null};
       var from = rules[i].from;
       if (!(from == '*' || from === undefined)) {
           if (from.indexOf('*') == -1 && from.indexOf('?') == -1) {
               _rule.c += CHECK_FROM_SMPL;
               _rule.f = from;
           } else {
               _rule.c += CHECK_FROM;
               _rule.f = toRe(from);
           }
       }
       var to = rules[i].to;
       if (!(to == '*' || to === undefined)) {
           if (to.indexOf('*') == -1 && to.indexOf('?') == -1) {
               _rule.c += CHECK_TO_SMPL;
               _rule.t = to;
           } else {
               _rule.c += CHECK_TO;
               _rule.t = toRe(to);
           }
       }
       _rules.push(_rule);
   }

   var keys = Object.keys(messages);
   for (var k = 0; k < keys.length; k++) {
       var key = keys[k];
       var msg = messages[key];
       var actions = [];
       
       var memo_key = msg.from + split_char + msg.to;
       if (_memo[memo_key]) {
           actions = _memo[memo_key];
       } else {
           for (var i = 0; i < _rules.length; i++) {
               switch (_rules[i].c) {
                   case CHECK_FROM:
                       if (msg.from.match(_rules[i].f)) break;
                       continue;
                   case CHECK_TO:
                       if (msg.to.match(_rules[i].t)) break;
                       continue;
                   case CHECK_FROM + CHECK_TO:
                       if (msg.from.match(_rules[i].f) && msg.to.match(_rules[i].t)) break;
                       continue;
                   case CHECK_FROM_SMPL:
                       if (msg.from == _rules[i].f) break;
                       continue;
                   case CHECK_TO_SMPL:
                       if (msg.to == _rules[i].t) break;
                       continue;
                   case CHECK_FROM_SMPL + CHECK_TO_SMPL:
                       if (msg.from == _rules[i].f && msg.to == _rules[i].t) break;
                       continue;
                   case CHECK_FROM + CHECK_TO_SMPL:
                       if (msg.from.match(_rules[i].f) && msg.to == _rules[i].t) break;
                       continue;
                   case CHECK_FROM_SMPL + CHECK_TO:
                       if (msg.from == _rules[i].f && msg.to.match(_rules[i].t)) break;
                       continue;
               }
               actions.push(rules[i].action);
           }
           _memo[memo_key] = actions;
       }
       result[key] = actions;
   }

   return result;
}
