exports.filter = function(messages, rules) {
/*
  Contest module for JS challenge Winter 2015: Mail Filtering Engine
  Created by: Konstantin Boyandin <konstantin@boyandin.com>
  Version sent: 2015-12-20

  Usage:

  var mail_filter = require('./mail_filter');
  var result = mail_filter.filter({
      msg1: {from: 'jack@example.com', to: 'jill@example.org'},
      msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
      msg3: {from: 'boss@work.com', to: 'jack@example.com'}
  }, [
      {from: '*@work.com', action: 'tag work'},
      {from: '*@spam.com', action: 'tag spam'},
      {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
      {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
  ]);

  Implementation features:
     - adjacent multiple asterisks ('*') in rules reduced to single asterisk
     - rules are prepared in single copy, to speed up matching
     - if no wildcards are detected ('*','?'), simple string comparison performed
     - all from/to messages entry are only matched to given rule once, result is cached

  We begin with copying rules into local working copy,
  performing all optimizations as we go
*/
  var l_rules = [];
  var l_rule_items = new Object();
  var l_msgs_cache = new Object();
  var rc = Object.create(null); /* output placeholder */

/* Loop over all rules */

  var rules_length = rules.length;
  for (var rcnt = 0; rcnt < rules_length; rcnt++) {
    var nr = Object.create(null); // placeholder for new rules list
    /* Process 'from' rule */
    var l_from = rules[rcnt].from;
    if (typeof(l_from) == "undefined") {
      nr.from = true; /* Always match */
    } else {
      /* Otherwise, prepare to insert into l_ruke_items */
      l_from = mergeStars(l_from);
      if (l_from === '*') {
        nr.from = true; /* Always match */
      } else {
        nr.from = l_from;
        /* If absent in l_rule_items, optimize and insert */
        if (! l_rule_items.hasOwnProperty(l_from)) {
          l_rule_items[l_from] = optimizeRule(l_from);
        }
      }
    }
    /* Process 'to' rule */
    var l_to = rules[rcnt].to;
    if (typeof(l_to) == "undefined") {
      nr.to = true; /* Always match */
    } else {
      /* Otherwise, prepare to insert into l_ruke_items */
      l_to = mergeStars(l_to);
      if (l_to === '*') {
        nr.to = true; /* Always match */
      } else {
        nr.to = l_to;
        /* If absent in l_rule_items, optimize and insert */
        if (! l_rule_items.hasOwnProperty(l_to)) {
          l_rule_items[l_to] = optimizeRule(l_to);
        }
      }
    }
    /* Copy action as is */
    nr.action = rules[rcnt].action;
    /* Add to local rules array */
    l_rules.push(nr);
  }

/* Loop over all messages */
  for (var msg in messages) {
    if (messages.hasOwnProperty(msg)) {
      /* Npte: we do not validate input (won't throw exception) */
      var t_rc = [];
      var t_from = messages[msg].from;
      var t_to = messages[msg].to;
      if ((typeof(t_from) != "undefined") && (typeof(t_to) != "undefined")) {
        /* Check through all l_rules */
        for (var rcnt = 0; rcnt < rules_length; rcnt++) {
          var f_res = false;
          var t_res = false;
          /* Checking from */
          if (! l_msgs_cache.hasOwnProperty(t_from)) {
            l_msgs_cache[t_from] = new Object();
          }
          var f_rule = l_rules[rcnt].from;
          if (f_rule === true) {
            f_res = true;
          } else {
            /* Cached? */
            if (! l_msgs_cache[t_from].hasOwnProperty(f_rule)) {
              if (typeof(l_rule_items[f_rule]) == "string") {
                l_msgs_cache[t_from][f_rule] = (l_rule_items[f_rule] === t_from);
              } else {
                l_msgs_cache[t_from][f_rule] = (t_from.match(l_rule_items[f_rule]) !== null);
              }
            }
            /* Assigned cached item */
            f_res = l_msgs_cache[t_from][f_rule];
          }
          /* Checking to */
          if (! l_msgs_cache.hasOwnProperty(t_to)) {
            l_msgs_cache[t_to] =  new Object();
          }
          var t_rule = l_rules[rcnt].to;
          if (t_rule === true) {
            t_res = true;
          } else {
            /* Cached? */
            if (! l_msgs_cache[t_to].hasOwnProperty(t_rule)) {
              if (typeof(l_rule_items[t_rule]) == "string") {
                l_msgs_cache[t_to][t_rule] = (l_rule_items[t_rule] === t_to);
              } else {
                l_msgs_cache[t_to][t_rule] = (t_to.match(l_rule_items[t_rule]) !== null);
              }
            }
            /* Assigned cached item */
            t_res = l_msgs_cache[t_to][t_rule];
          }
          /* Now both 'from' and 'to' checked...*/
          if (f_res && t_res) {
            t_rc.push(l_rules[rcnt].action);
          }
        }
      }
      /* Assign actions list */
      rc[msg] = t_rc;
    }
  }

  return rc;

/* Optimize: merge several consequent stars into single one */
  function mergeStars(str) {
    return str.replace(/\*+/g, '*');
  }

  /* Escape specials in string we use for creating matching rule */
  function escapeRegEx(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&");
  }

/* Transform rule into optimal form */
  function optimizeRule(str) {
    /* Star becomes Boolean true (no match required) */
    if (str == '*') {
      return true;
    }
    /* No *, ?: simple string, return untouched */
    if ((str.indexOf('*') < 0) && (str.indexOf('?') < 0)) {
      return str;
    }
    /* Otherwise, transform into RegExp */
    /* First, escape control characters */
    var newstr = escapeRegEx(str);
    /* Now replace ? */
    newstr = newstr.replace(/\?/g, '.');
    /* ...and * */
    newstr = newstr.replace(/\*/g, '.*?');
    /* Add anchors and create RegExp */
    return new RegExp('^' + newstr + '$');
  }

}
