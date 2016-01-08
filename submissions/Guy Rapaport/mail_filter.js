// Task definition: http://hola.org/challenge_mail_filter
// Module created according to: http://howtonode.org/creating-custom-modules
// Example speedups: https://github.com/hola/challenge_strftime/blob/master/submissions/sergii.shpak_strftime.js
// Improve your code: http://www.w3schools.com/js/js_performance.asp

/*
You are in charge of developing the filtering engine for an e-mail system.
Your task is to write a Node.js module exporting one single function:

filter(messages, rules)
messages is a mapping of unique message IDs to objects with two string properties: from and to.
Each object describes one e-mail message.
rules is an array of objects with three string properties: from (optional), to (optional), and action (mandatory).
Each object describes one mail filtering rule.
All strings in the input are non-empty and only contain ASCII characters between 0x20 and 0x7F (inclusive).

A rule is said to match a message if its from and to properties simultaneously match the corresponding properties of the message.
The matching is case-sensitive, with * in the rule matching any number (zero or more) of arbitrary characters,
and ? matching exactly one arbitrary character. If from or to are omitted, they are assumed to have the default value *.
As a consequence, a rule that has neither from nor to, matches all messages.

Every message must have all matching rules applied to it,
in the order in which the rules are listed. The filter function returns a mapping of message IDs to arrays of actions.
For each message, the array should contain the values of the action property from all rules that match this message,
respecting the order of the rules. If no rules match a certain message,
its corresponding array in the output must still exist (and be empty).
*/

function filter(messages, rules){

    //console.log("mail_filter.filter() invoked.");
    // {from: '*@work.com', action: 'tag work'},
    /*
    To utilize regex's (supposed) speed, format a given string as a regex:
    . --> \.
    * --> .*
    ? --> .
    Now your code can break if addresses will contain regex parts ($, ^, etc)
    which is typical of Hola challanges, but let's upload this initial solution and see if this happens.
    */
    var str2regex = function(str){
        return (str === undefined) ? 
            RegExp(".*") :
            RegExp("^" + str.replace(/\./g, '\\.')
                            .replace(/\*/g, '.*')
                            .replace(/\?/g, '.') + "$");
    }

    var str2regex_test = function(str, test){
        regex = str2regex(str);
        //console.log(regex);
        return regex.test(test);
    }
    
    //console.log(str2regex_test("*@work.com", "boss@work.com"));

    var rule2func = function(rule){
        var action = rule.action;
        var from_re = str2regex(rule.from);
        var to_re = str2regex(rule.to);
        return function(message){
            return (from_re.test(message.from) && to_re.test(message.to))
                    ? action
                    : undefined;
        };
    };

    var handle_message = function(message){
        var actions = [];
        funcs.forEach(function(func){
            var res = func(message);
            if (res !== undefined){
                actions.push(res);
            }
        });
        return actions;
    };


    var funcs = rules.map(rule2func);
    
    // this part can be sped-up indefinitely... Possibly with callbacks etc.
    var ret = {};
    for(var msg in messages){
        var message = messages[msg];
        ret[msg] = handle_message(message);
    };

    return ret;

};


exports.filter = filter;
