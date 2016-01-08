// match expression generator
function wildcard_match_expression(wildcard,arg/*,init*/){
    var ret = '';
    var qwildcard = '"'+wildcard+'"';
    if(wildcard.indexOf('*')===-1 && wildcard.indexOf('?')===-1){
        ret = (arg+" === "+qwildcard);
    }else if(wildcard.indexOf('*') === 0 && wildcard.indexOf('*',1) === -1
            && wildcard.indexOf('?',1) === -1
    ){
        var wildcard_length = -(wildcard.length - 1);
        var wildcard_resedue = wildcard.substr(wildcard_length);
        ret = arg+".substr("+wildcard_length+") === '"+wildcard_resedue+"'";
    }else{
        ret = '/'+wildcard2str_re(wildcard)+'/.test('+arg+')';
    }
    return ret;
}



// convert rules into filter_body function 
function generate_filter_body(rules){
    var actions_js = [];
    actions_js[actions_js.length] = 'var actions=[];';
    for(var r in rules){
        if('from' in rules[r] && 'to' in rules[r]){
            actions_js[actions_js.length] = 'if('+wildcard_match_expression(rules[r].from,'msg.from')+' && '+
                    wildcard_match_expression(rules[r].to,'msg.to')+')'; 
            
        }else if('from' in rules[r]){ 
            actions_js[actions_js.length]  = 'if('+wildcard_match_expression(rules[r].from,'msg.from')+')';
        }else if( 'to' in rules[r]){
            actions_js[actions_js.length] = 'if('+wildcard_match_expression(rules[r].to,'msg.to')+' ) ';
        }
        actions_js[actions_js.length] = '{actions[actions.length] = "'+rules[r].action+'"}';
    }
    
    return "function filter_hola_email_body(messages){var result = {}; for(var i in messages){msg=messages[i];"+actions_js.join("\n")+
            "result[i] = actions; } return result;}";
}



exports.filter = function(messages,rules){
    eval(generate_filter_body(rules));
    return filter_hola_email_body(messages);
}
