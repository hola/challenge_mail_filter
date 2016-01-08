function filter(messages, rules) {

    var o_r = []; //optimized_rules
    var rules_len = rules.length;

    // Convert rules.
    for (i = 0; i < rules_len; ++i) {
        if (!rules[i].hasOwnProperty('from'))
            rules[i]['from'] = '';

        if (!rules[i].hasOwnProperty('to'))
            rules[i]['to'] = '';

        rules[i]['from'] = rules[i]['from'].replace('*', "[\\x20-\\x7f]*").replace('?', "[\\x20-\\x7f]");
        rules[i]['to'] = rules[i]['to'].replace('*', "[\\x20-\\x7f]*").replace('?', "[\\x20-\\x7f]");
        rules[i]['ffl'] = ''; // from first letter
        rules[i]['tfl'] = ''; // to first letter

        // [0]=from, [1]=to, [2]=action, [3]=from first letter, [4]=to first letter,
        // [5]=from regexp, [6]=to regexp
        o_r.push([rules[i]['from'], rules[i]['to'], rules[i]['action'],
            rules[i]['from'].charAt(0), rules[i]['to'].charAt(0),
            new RegExp(rules[i]['from'], ""), new RegExp(rules[i]['to'], "")]);
    }

    var result = {};
    var key;
    var from;
    var to;
    var ffl;
    var tfl;
    var fre;
    var tre;
    var act;
    var j;
    var actions;
    var o_r_len = o_r.length;

    // Interate over all messages.
    for (key in messages) {
        actions = [];

        for (j = 0; j < o_r_len; ++j) {

            from = o_r[j][0];
            to = o_r[j][1];
            act = o_r[j][2];
            ffl = o_r[j][3];
            tfl = o_r[j][4];
            fre = o_r[j][5];
            tre = o_r[j][6];

            if ( from === '' || (ffl === messages[key]['from'].charAt(0) && (from.indexOf("[") ===-1 && from === messages[key]['from'])) || ((from.indexOf("[") !==-1 && fre.test(messages[key]['from']))) ) {
                if ( to === '' || (tfl === messages[key]['to'].charAt(0) && (to.indexOf("[") ===-1 && to === messages[key]['to'])) || ((to.indexOf("[") !==-1 && tre.test(messages[key]['to']))) ) {
                    actions.push(act);
                }
            }
        }

        result[key] = actions;
    }
 
    return result;
}
