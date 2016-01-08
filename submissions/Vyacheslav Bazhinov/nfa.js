function get_actions(from_tree, to_tree, rules, message) {
    var from_ids = get_ids(message.from, from_tree);
    var to_ids = get_ids(message.to, to_tree);
    var res = [];
    var cur_from_id = 0;
    var cur_to_id = 0;
    while (cur_from_id < from_ids.length && cur_to_id < to_ids.length) {
        if (from_ids[cur_from_id] < to_ids[cur_to_id]) {
            cur_from_id++;
        } else if (to_ids[cur_to_id] < from_ids[cur_from_id]) {
            cur_to_id++;
        } else {
            res.push(rules[from_ids[cur_from_id]].action);
            cur_from_id++;
            cur_to_id++;
        }
    }
    return res;
}

function get_ids(s, cur_node) {
    var positions = [cur_node];
    for (var i = 0; i < s.length; i++) {
        var next_positions = [];
        var c = s[i];
        for (var j = 0; j < positions.length; j++) {
            var cur_pos = positions[j];
            if (cur_pos[c]) {
                next_positions.push(cur_pos[c]);
            }
            if (cur_pos.any) {
                next_positions.push(cur_pos.any);
            }
            if (cur_pos.star) {
                next_positions.push(cur_pos.star);
            }
        }
        positions = next_positions;
    }
    var res = [];
    for (var i = 0; i < positions.length; i++) {
        var cur_pos = positions[i];
        for (var j = 0; j < cur_pos.indexes.length; j++) {
            res.push(cur_pos.indexes[j]);
        }
    }
    if (res.length < 50) {
        for (var i = 0; i < res.length; i++) {
            for (var j = 0; j < res.length - i - 1; j++) {
                if (res[j] > res[j + 1]) {
                    var tmp = res[j];
                    res[j] = res[j + 1];
                    res[j + 1] = tmp;
                }
            }
        }
    } else {
        res.sort(function(a, b) {return a - b});
    }
    return res;
}

function go(node, edge) {
    if (!node[edge]) {
        node[edge] = {indexes: []};
    }
    return node[edge];
}

function append_rule(tree, mask, idx) {
    var cur_node = tree;
    var has_star = false;
    for (var i = 0; i < mask.length; i++) {
        var c = mask[i];
        if (c == '*') {
            has_star = true;
        } else if (c == '?') {
            cur_node = go(cur_node, 'any');
        } else {
            if (has_star) {
                has_star = false;
                var star_node = go(cur_node, 'star');
                star_node.star = star_node;
                append_rule(star_node, mask.slice(i), idx);
            }
            cur_node = go(cur_node, c);
        }
    }
    if (has_star) {
        var star_node = go(cur_node, 'star');
        star_node.star = star_node;
        star_node.indexes.push(idx);
    }
    cur_node.indexes.push(idx);
}

function get_tree(rules) {
    var tree = {indexes: []};
    for (var i = 0; i < rules.length; i++) {
        append_rule(tree, rules[i].rule, rules[i].idx);
    }
    return tree;
}

exports.filter = function(messages, rules) {
    var from_rules = [];
    var to_rules = [];
    for (var i = 0; i < rules.length; i++) {
        from_rules.push({rule: rules[i].from || '*', idx: i});
        to_rules.push({rule: rules[i].to || '*', idx: i});
    }
    var from_tree = get_tree(from_rules);
    var to_tree = get_tree(to_rules);
    var res = {};
    for (var msg_id in messages) {
        var message = messages[msg_id];
        res[msg_id] = get_actions(from_tree, to_tree, rules, message);
    }
    return res;
}