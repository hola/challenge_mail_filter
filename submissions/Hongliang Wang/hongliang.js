/*******************************************************************************
 *
 * filter() - JS challenge Winter 2015: Mail Filtering Engine
 *
 * URL: http://hola.org/challenge_mail_filter
 *
 * AUTHOR: Hongliang Wang (loudking@gmail.com)
 *
 *******************************************************************************
 */
'use strict';

function filter(messages, rules)
{
    var result = {};
    var array_from = new Array(rules.length);
    var array_to = new Array(rules.length);
    var i;
    var j;

    for(i in rules) {
        array_from[i] = new RegExp(build_regex(rules[i]['from']));
        array_to[i] = new RegExp(build_regex(rules[i]['to']));
    }

    for(i in messages) {
        result[i] = [];
        for(j in array_from) {
            if(array_from[j].test(messages[i]['from']) &&
               array_to[j].test(messages[i]['to'])) {
                result[i].push(rules[j]['action']);
            }
        }
    }

    return result;
}

/*******************************************************************************
 *
 * build_regex()
 *
 * Build Javascript-compatible-regular-expression @output from @input.
 * If @input is undefined then use '.*' instead.
 *
 *  1. Escape RegExp special characters: .|^$\+()[]{}
 *  2. Replace * with .*
 *  3. Replace ? with .
 *  4. Add '^' and '$' to both ends respectively.
 *
 *******************************************************************************
 */
function build_regex(input)
{
    var output;

    if(typeof input === 'undefined') {
        output = '.*';
    }
    else {
        output = input.
                     replace(/[.+^${}()|[\]\\]/g, "\\$&").
                     replace(/\*/g, '.*').
                     replace(/\?/g, '.');
    }

    output =  '^'+output+'$';

    return output;
}
