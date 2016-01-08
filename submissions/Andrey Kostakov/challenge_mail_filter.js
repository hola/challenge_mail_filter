function prepare_regexp(src){
    return new RegExp('^' + src.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
}

function get_match_function(pattern){
    if(!pattern){return null;}
    if(pattern.indexOf('?') == -1 && pattern.indexOf('*') == -1){
        return function(text){
            return pattern == text;
        }
    }else{
        pattern = prepare_regexp(pattern);
        return function(text){
            return pattern.test(text);
        }
    }
}

function filter_function(rule){
    if((rule.is_match_from && !rule.is_match_from(this.from)) || (rule.is_match_to && !rule.is_match_to(this.to))){
        return false;
    }
    return true;
}

function map_function(rule){
    return rule.action;
}

function prepare_rule(rule){
    rule.is_match_from = rule.from && get_match_function(rule.from)
    rule.is_match_to = rule.to && get_match_function(rule.to)
}

function filter(messages, rules){
    var result = {}, cache = {}, message = {}, hash = "";

    rules.map(prepare_rule);

    Object.keys(messages).map(function (key){
        message = messages[key];
        hash = message.from.concat('\t', message.to);
        if(hash in cache){
            result[key] = result[cache[hash]];
            return;
        }else{
            cache[hash] = key;
        }
        result[key] = rules.filter(filter_function, message).map(map_function);
    });

    return result;
}

exports.filter = filter;