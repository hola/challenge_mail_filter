/*
Almaz Mubinov
almaz@mubinov.com
17.11.2015
*/

function prepareRules(rules){
    rules.forEach(function(rule){
        var rule_exp={from: [], to: []}, vars = [];

        ['from', 'to'].forEach(function(type) {
            var val = rule[type]; // val - is a from/to part of rule. (ex, "*@gmail.com")

            if (val != null && val != '*') {
                if (val.indexOf('*') !== -1 && val.indexOf('?') !== -1) {
                    // rules with * and ?
                    // ex, "super?@*.com"
                    rule['reg_'+type] = new RegExp('^'+
                        val.replace(/\./g, '\.').replace(/\*/g, '.*').replace(/\?/g, '.')+
                        '$');

                    rule_exp[type] = "this.reg_"+type+".test("+type+")";

                }else if (val.indexOf('*') !== -1) {
                    // rule with *, ex. "*@gmail.com"
                    while (val.indexOf('**') !== -1) {
                        val = val.replace('**', '*');
                    }
                    var reg = [];
                    var l = 0;
                    var arr = val.split('*');

                    var start_i = 0, end_i = arr.length-1, min_char_id = -1, max_char_id= 0;

                    if(arr[0]!==''){
                        // First block
                        reg.push(type+".substr(0,"+arr[0].length+")==='"+arr[0]+"'");

                        start_i = 1;
                        min_char_id = arr[0].length-1;
                    }

                    if(arr[arr.length - 1]!=='') {
                        // Last block

                        reg.push(type+".substr(-"+arr[arr.length - 1].length+")==='"+arr[arr.length - 1]+"'");

                        end_i = arr.length-2;
                        max_char_id = arr[arr.length - 1].length;
                    }

                    // Others
                    for(var i = start_i; i<=end_i;i++){
                        if(arr[i]=="")continue;

                        reg.push(
                            "("+
                            "(index_"+i+"="+type+".indexOf('"+arr[i]+"',"+min_char_id+"))!==-1 && "+
                            min_char_id+"<index_"+i+" && "+
                            "index_"+i+"<"+type+".length-"+max_char_id+
                            ")"
                        );
                        vars.push("index_"+i);
                        min_char_id = "index_"+i+"-1+"+arr[i].length;
                    }

                    rule_exp[type] = reg.join(' && ');
                } else if (val.indexOf('?') !== -1) {
                    // rule with ?, ex. "super?@gmail.com"
                    arr = val.split('?');
                    reg = [];
                    l = 0;
                    reg.push(type+".length==="+val.length);

                    arr.forEach(function (reg_block) {
                        if(reg_block!=''){
                            reg.push(type+".substr("+l+","+reg_block.length+")==='"+reg_block+"'");
                        }
                        l+=reg_block.length+1;
                    });
                    rule_exp[type] = reg.join(' && ');
                } else {
                    // simple rule without ? or *, ex. "super@gmail.com"
                    rule_exp[type] = type+"==='" + val + "'";
                }
            }else{
                rule_exp[type] = 'true';
            }
        });

        vars = vars.join(',');
        if(vars!=''){
            vars = 'var '+vars+';';
        }
        
        eval("rule.exp = function(from,to){"+vars+" return "+rule_exp['to']+" && "+rule_exp['from']+";}");
    });
}

function filter(messages, rules) {

    // create functions in rules objects
    prepareRules(rules);

    var result = {};
    var rules_length = rules.length;

    for(var mes_id in messages){
        //if(!messages.hasOwnProperty(mes_id))continue;
        var mes = messages[mes_id];
        var res = [];
        for(var i = 0; i < rules_length; i++) {
            if(rules[i].exp(mes.from, mes.to)){
                res.push(rules[i].action);
            }
        }
        result[mes_id] = res;
    }

    return result;
}

exports.filter = filter;