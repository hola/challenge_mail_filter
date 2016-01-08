"use strict";

function wild_card(expr, str){
    var strl = str.length,
        _expr = 0, 
        _str = 0, 
        _e = 0, 
        _s = 0, 
        star = false;

    for(;;){
        for(_e=_expr, _s=_str; _s < strl; ++_s, ++_e){
            if("*" == expr[_e]){
                if((_expr = ++_e) >= expr.length) return true;
                _str = _s, star = true; 
                break;
            } else if(expr[_e] != str[_s] && "?" != expr[_e]){
                if(!star) return false;
                _str++;
                break;
            }
        }

        if(_s >= strl){
            while ("*" == expr[_e]) ++_e;
            return _e >= expr.length;
        }
    }
}

module.exports.filter = function (data, filters){
    var l = filters.length;

    for(var i in data){
        var d = data[i], r = [];
        for(var j=0; j<l; j++){
            if(
                (!filters[j].from || filters[j].from == d.from || wild_card(filters[j].from, d.from)) && 
                (!filters[j].to || filters[j].to == d.to || wild_card(filters[j].to, d.to))
            ) 
                r.push(filters[j].action);
        }
        data[i] = r;
    }

    return data;
}