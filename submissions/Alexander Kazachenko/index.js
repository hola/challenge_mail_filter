"use strict";
exports.filter = function(e, q){
    function p(l, m){
        return l.substr(l.indexOf('@')+1, l.length) == m.substr(m.indexOf('@')+1, m.length) && ((l[0] == '*' && l[0].length == 1) || (l[0] == '?' && l[0].length == 1 && m.indexOf('@') == 1));
    }
    for(var id in e){
        var h = e[id];
        e[id] = [];
        for(var i=0; i<q.length; i++){
            var z = q[i];
            if( !z.from && !z.to || !z.to && z.from == h.from || !z.from && z.to == h.to || z.from == h.from && z.to == h.to || z.from && p(z.from, h.from) || z.to && p(z.to, h.to)) e[id].push(z.action);
        }
    }
    return e;
};