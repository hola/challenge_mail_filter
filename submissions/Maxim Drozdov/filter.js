exports.filter = function (messages, rules) {
//cache maintenance variables
  var sample_size_default = 128;
  var skip_size_default = 128;
  var max_safe_int = 1415841654;
  var sample_size = sample_size_default;
  var skip_size = skip_size_default;
  var cache_hits = 0;
  var cache_misses = 0;
  var messages_visited = 0;
  var gathering_samples = true;
  
  var addr_rules = new Map();
  var r_l = rules.length;
  var regex_rules = new Array(r_l << 1);
  var r_iter = 0;
  for ( var iter = 0; iter < r_l; iter++ ) {
    regex_rules[r_iter] = ( "from" in rules[iter] ? new RegExp(
      "^"+rules[iter]["from"]
        .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&")
        .replace(/[?]/g, ".")
        .replace(/[*]+/g, ".*")
        +"$"
    ) : null );
    regex_rules[r_iter+1] = ( "to" in rules[iter] ? new RegExp(
      "^"+rules[iter]["to"]
        .replace(/[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g, "\\$&")
        .replace(/[?]/g, ".")
        .replace(/[*]+/g, ".*")
        +"$"
      ) : null );
    r_iter+=2;
    rules[iter] = rules[iter]["action"];
  };
  for( var m in messages ) {
    var addr_from = messages[m].from;
    var addr_to = messages[m].to;
    var temp = [];
    var a_idx = 0;
    if ( gathering_samples ) {
        var from_undef = ( ! addr_rules.has(addr_from) );
        var to_undef = ( ! addr_rules.has(addr_to) );
        var from_results;
        var to_results;
        if (from_undef) {
          cache_misses++;
          var from_results_l = ( ( r_l >> 4 ) + 1 );
          from_results = new Array(from_results_l);
          for ( var i = 0; i < from_results_l; i++ ) {
            from_results[i] = 0;
          }
          addr_rules.set( addr_from, from_results );
        } else {
          cache_hits++;
          from_results = addr_rules.get(addr_from);
        }
        if ( to_undef ) {
          cache_misses++;
          var to_results_l = ( ( r_l >> 4 ) + 1 );
          to_results = new Array(to_results_l);
          for ( var i = 0; i < to_results_l; i++ ) {
            to_results[i] = 0;
          }
          addr_rules.set( addr_to, to_results );
        } else {
          cache_hits++;
          to_results = addr_rules.get(addr_to);
        }
        for ( var iter = 0; iter < r_l; iter++ ) {
          var rule_idx = iter << 1; // * 2
          var result_idx = iter >> 4; // div 16
          var off_base = iter & 15; // mod 16, if iter > 0
          var off_from = off_base << 1; // * 2
          var off_to = (off_base << 1)+1; // * 2 + 1
          var accepted_as_from = (1 << off_from);
          var accepted_as_to = (1 << off_to);
          if ( from_undef ) {
            if ( ( regex_rules[rule_idx] === null ) || regex_rules[rule_idx].test(addr_from) ) {
              from_results[result_idx] |= accepted_as_from;
            }
            if ( ( regex_rules[rule_idx+1] === null ) || regex_rules[rule_idx+1].test(addr_from) ) {
              from_results[result_idx] |= accepted_as_to;
            }
          }
          if ( to_undef ) {
            if ( ( regex_rules[rule_idx] === null ) || regex_rules[rule_idx].test(addr_to) ) {
              to_results[result_idx] |= accepted_as_from;
            }
            if ( ( regex_rules[rule_idx+1] === null ) || regex_rules[rule_idx+1].test(addr_to) ) {
              to_results[result_idx] |= accepted_as_to;
            }
          }
          if (
            (from_results[result_idx] & accepted_as_from ) === accepted_as_from
            && (to_results[result_idx] & accepted_as_to ) === accepted_as_to
          ) { temp[a_idx] = rules[iter]; a_idx++;}
        }
    } else {
      for( var iter = 0; iter < r_l; iter++ ) {
        var r_idx = iter << 1;
        if (
          ( ( regex_rules[r_idx] == null ) || regex_rules[r_idx].test(addr_from) ) &&
          ( ( regex_rules[r_idx+1] == null ) || regex_rules[r_idx+1].test(addr_to) )
        ) { temp[a_idx] = rules[iter]; a_idx++; }
      }
    }
    messages[m] = temp;
// cache throttling
    messages_visited++;
    if ( gathering_samples ) {
      if ( messages_visited == sample_size ) {
        if ( cache_misses > ( cache_hits << 4 ) ) { // hit-rate < 6%
          gathering_samples = false;
          messages_visited = 0;
          skip_size = ( skip_size << 1 ) - ( skip_size >> 1 );
          sample_size = sample_size_default;
        } else {
          if ( sample_size < max_safe_int ) {
            sample_size = ( sample_size << 1 ) - ( sample_size >> 1 );
            skip_size = skip_size_default;
          }
        }
        cache_misses = 0;
        cache_hits = 0;
      }
    } else if ( messages_visited == skip_size ) {
      gathering_samples = true;
      messages_visited = 0;
      cache_misses = 0;
      cache_hits = 0;
    }
  }
  return messages;
}