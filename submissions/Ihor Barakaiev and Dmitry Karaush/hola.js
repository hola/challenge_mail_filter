function init(filters) {
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i],
            from   = filter.from,
            to     = filter.to,
            con    = "";
        if (from) {
            if (from.indexOf("*") == -1 && from.indexOf("?") == -1)
                con += "\""+from+"\"===m.from";
            else
                con += "/"+convert(from)+"/.test(m.from)";
        }  
 
        if (to) {
            if (con != "")
                con += "&&";
             
            if (to.indexOf("*") == -1 && to.indexOf("?") == -1)
               con += "\""+to+"\"===m.to";
            else
                con += "/"+convert(to)+"/.test(m.to)";
        }
 
        if (con == "")
            con = "true";
 
        filter.check = new Function("m", "return "+con);
    }
}

exports.filter = function(messages, rules) {
    init(rules)
    var res = {};
    for (var i in messages) {
        res[i] = [];
        for (var j = 0, f; j < rules.length; j++)
            if ((f=rules[j]).check(messages[i]))
                res[i].push(f.action);
    }
    return res
}

var r = new RegExp("\\?|\\*","g")

function convert(str) {
    return '^' + str.replace(r, function(d){ return {'?': '.', '*': '.*'}[d]; }) + '$'
}