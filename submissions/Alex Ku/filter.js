'use strict';

exports.filter = function(messages, rules) {

var time_1 = new Date();
var time_2 = new Date();
    var result = {};

    // filter graph building
    var i, j, k;
    var rtl = rules.length;
    var Uint32size = Math.ceil(rtl/32);
    var graph_from_start_node = [ undefined, [], 0];
    var graph_to_start_node = [ undefined, [], 0];
    var graph_from  = { letters_level: [], start_filter_node: graph_from_start_node, nodes_by_id: [graph_from_start_node], next_node_id: 1, rules_num: rtl };
    var graph_to    = { letters_level: [], start_filter_node: graph_to_start_node,   nodes_by_id: [graph_to_start_node],   next_node_id: 1, rules_num: rtl };
    var action_filters_by_id = [];
    var from_already_matched_rules = new Uint32Array(Uint32size);
    var to_already_matched_rules = new Uint32Array(Uint32size);
    var from_already_matched_rules_not_empty = 0;
    var to_already_matched_rules_not_empty = 0;

    for ( var rt = 0; rt<rtl; rt++ ) {
        action_filters_by_id[rt] = rules[rt].action;

        var text = rules[rt].from || "";
        var r = "";
        while ( r != text ) {
            r = text;
            text = r.replace(/\*\*/g, "*");
        }
        if ( ! text || text === '*' ) {
            from_already_matched_rules[ Math.floor(rt/32) ] |= ( 1 << rt % 32 );
            from_already_matched_rules_not_empty++;
        } else {
            apply_rule_to_graph( graph_from, [rt, text] );
        }

        text = rules[rt].to || "";
        r = "";
        while ( r != text ) {
            r = text;
            text = r.replace(/\*\*/g, "*");
        }
        if ( ! text || text === '*' ) {
            to_already_matched_rules[ Math.floor(rt/32) ] |= ( 1 << rt % 32 );
            to_already_matched_rules_not_empty++;
        } else {
            apply_rule_to_graph( graph_to, [rt, text] );
        }
    }

    // search.
    var duplicates = {} // { msg: [from, to] }
    var dup, mmres, matched, m_from, m_to, from_matched_rules, to_matched_rules, res_arr;
    for ( var msg in messages ) {
        m_from = messages[msg].from;
        m_to = messages[msg].to;

        if ( (dup = duplicates[m_from]) && dup[0]) {
            mmres = dup[0];
        } else {
            mmres = message_matched (graph_from, m_from);
            if ( !duplicates[m_from] ) {
                duplicates[m_from] = [mmres, undefined];
            }
            else {
                duplicates[m_from][0] = mmres;
            }
        }
        matched = mmres[1];
        from_matched_rules = mmres[0];
        if ( !matched && !from_already_matched_rules_not_empty ) {
            result[msg] = [];
            continue;
        }

        if ( (dup = duplicates[m_to])&& dup[1]) {
            mmres = dup[1];
        } else {
            mmres = message_matched (graph_to, m_to);
            if ( !duplicates[m_to] ) {
                duplicates[m_to] = [undefined, mmres];
            }
            else {
                duplicates[m_to][1] = mmres;
            }
        }
        matched = mmres[1];
        to_matched_rules = mmres[0];
        if ( !matched && !to_already_matched_rules_not_empty ) {
            result[msg] = [];
            continue;
        }

        res_arr = [];
        var m;
        for ( i = 0; i<Uint32size; i++ ) {
            k = (to_matched_rules[i] | to_already_matched_rules[i]) & (from_matched_rules[i] | from_already_matched_rules[i]);
            m = 32*i;
            for ( j=0; j<32; j++ ) {
                if ( (1<<j) & k ) {
                    res_arr.push( action_filters_by_id[m+j] )
                }
            }
        }
        result[msg] = res_arr;
    }

    return(result);
}

// node = [ letter_code, filters[], id ]
// filter:
//  [0] - rules[]               // list of index in source rules array, not in order
                                // grouped by (state, next_level_letter)
//  [1] - action                // done = 1, done_if_last = 2
//  [2] - next_level_letter;    // link to next level node
//  [3] - rules as hash keys

function apply_rule_to_graph(graph, rule ) {
    // rule = [ order, text ]
    var rules_num = graph.rules_num;
    var order = rule[0];
    var text = rule[1];
    var current_node = graph.start_filter_node;
    var next_node;
    var letter_code;

    for (var level = 0, text_length = text.length; level <= text_length; level++ ) {
        if ( ! graph.letters_level[level] ) {
            graph.letters_level[level] = [];
        }

        // '?' is full node with special letter code '1'
        // '*' is full node with special letter code '2' at same level + link to next letter node

        switch ( text[level] ) {
            case undefined:
                // last pass, put 'done if last'
                add_filter( current_node, [ order, 2, undefined ] );
                break;
            case "?":
                // as usual but with special letter code 1
                add_filter_and_change_node();
                break;
            case "*":
                if ( level === (text_length-1) ) {
                    // if last, put 'done'
                    add_filter( current_node, [ order, 1, undefined ] );
                    level++;    // rule applyng done
                } else {
                    // create next_node for level+ letter at level+ if it isn't exsist yet.
                    // make filter for current_node linked to
                    //  - next_node (at level+)
                    //  - '*' node (at level) also linked to next letter at next_node
                    var asterisk_node = graph.letters_level[level][2];
                    if ( ! asterisk_node ) {
                        asterisk_node = [ 2, [], graph.next_node_id ];
                        graph.nodes_by_id[ graph.next_node_id ] = asterisk_node;
                        graph.next_node_id++;
                    }
                    graph.letters_level[level][2] = asterisk_node;
                    add_filter( current_node, [ order, 0, asterisk_node ] );
                    level++;
                    add_filter_and_change_node();
                    add_filter( asterisk_node, [ order, 0, current_node ] );
                }
                break;
            default:
                // action = 0
                // make filter for current_node linked to next_node
                // + create next_node if it isn't exsist yet.
                add_filter_and_change_node();
        }
    }

    function add_filter_and_change_node() {
        var action = 0;  // means nothing
        var letter_code;

        if ( ! graph.letters_level[level] ) {
            graph.letters_level[level] = [];
        }

        if ( text[level] === "?" ) {
            letter_code = 1;
        } else {
            letter_code = text[level].charCodeAt();
        }

        next_node = graph.letters_level[level][letter_code];
        if ( ! next_node ) {
            next_node = [ letter_code, [], graph.next_node_id ];
            graph.nodes_by_id[ graph.next_node_id ] = next_node;
            graph.next_node_id++;
        }

        add_filter( current_node, [ order, action, next_node ] );
        graph.letters_level[level][letter_code] = next_node;
        current_node = next_node;
    }

    function add_filter( node, filter ) {
        var order = filter[0];
        var action = filter[1];
        var next_node = filter[2];
        var node_filters = node[1];

        for (var f = 0, fl = node_filters.length; f<fl; f++) {
             var current_filter = node_filters[f];
             if ( current_filter[1] === action && current_filter[2] === next_node ) {
                 current_filter[0].push( order );
                 current_filter[3][order] = 1;
                 return;
             }
         }
         var new_filter = [ [ order ], action, next_node, {} ];
         new_filter[3][order] = 1;
         node_filters.push(new_filter);
    }

}

function message_matched (graph, msg) {
    // node contains a list of 'filters' which corresponds to list of matched rules
    // for every next letter
    // for every suitable filter
    // we can move to next node, stay on same or drop the filter
    // so in the 'state' we can be in several nodes simultaneously

    var i, f;
    var matched_rules = new Uint32Array(Math.ceil(graph.rules_num/32));
    var matched = 0;
    var state = { 0 : {"all" : 1} }; // {node_id: { rule_id: 1 }}
    var states = 1;
    for (var m_index = 0, m_length = msg.length; states && (m_index <= m_length); m_index++ ) {
        var current_letter_code = (msg[m_index] || 0) && msg[m_index].charCodeAt(); // 0 for after-letters pass
        var new_state = {};
        states = 0;
        for ( var current_node_id in  state ) {
            var current_node = graph.nodes_by_id[current_node_id];
            var current_node_filters = current_node[1];
            var state_node_rules = state[current_node_id];
            var rule_num;

            if ( 2 === current_node[0] && m_index <(m_length-1) ) { // preserve state if in '*' node
                if ( new_state[ current_node_id ] ) {
                    for ( i in state_node_rules ) {
                        new_state[ current_node_id ][i] = state_node_rules[i]
                    }
                } else {
                    new_state[ current_node_id ] = state_node_rules;
                }
                states++;
            }

            for ( f = current_node_filters.length; f--; ) {
                var current_filter = current_node_filters[f];
                var current_filter_rules_arr  = current_filter[0];
                var current_filter_action     = current_filter[1];
                var current_filter_next_node  = current_filter[2];
                var current_filter_rules_hash = current_filter[3];

                if (( current_filter_action === 1 || current_filter_action === 2 && current_letter_code === 0) ) {
                    // matched
                    // merge to matched_rules
                    for ( i = current_filter_rules_arr.length; i--; ) {
                        rule_num = current_filter_rules_arr[i];
                        if ( state_node_rules[ rule_num ] ) {
                            matched_rules[ Math.floor(rule_num/32) ] |= ( 1 << rule_num%32 );
                        }
                    }
                    matched++;
                    continue;
                }

                if ( current_letter_code === 0 || !current_filter_next_node ) {
                    // no letters left in msg || no letters left in filter
                    continue;
                }

                var next_node_letter = current_filter_next_node[0];
                if (    ( current_letter_code === next_node_letter || 1 === next_node_letter || 2 === next_node_letter )
                        && ( state_node_rules["all"] || arr_val_in_obj_keys(current_filter_rules_arr, state_node_rules) ) )
                {
                    // next node
                    var next_node_id = current_filter_next_node[2];
                    if ( state_node_rules["all"] ) {
                        new_state[ next_node_id ] = current_filter_rules_hash;
                        states++;
                        continue;
                    }
                    if ( !new_state[ next_node_id ] ) {
                        new_state[ next_node_id ] = {};
                        states++;
                    }
                    for ( i = current_filter_rules_arr.length; i--; ) {
                        rule_num = current_filter_rules_arr[i];
                        if ( state_node_rules[ rule_num ] ) {
                            new_state[ next_node_id ][ rule_num ] = 1
                        }
                    }
                }
            }
        }
        if (!states) {continue}
        state = new_state;
    }
    return [matched_rules, matched];
}

function arr_val_in_obj_keys (arr, obj) {
    for ( var i = arr.length; i--; ) {
        if ( obj[ arr[i] ] ) {
            return 1;
        }
    }
    return 0;
}

