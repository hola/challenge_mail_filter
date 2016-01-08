function init(filters) {

    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i],
            condition = "",
            to = filter.to,
            from = filter.from;

        if (from) {
            var fromLast = from.length - 1,
                fromZ = (from.match(/[*]/g) || []).length
            fromFirstLetter = from[0],
                fromLastLetter = from[fromLast];
            if (fromZ == 0 && (from.match(/[?]/g) || []).length == 0) {
                condition += "m.from===\"" + from + "\"";
            } else if (fromZ == 1) {
                if (fromFirstLetter == "*")
                    condition += ("(function(d){for(var i=0,l=d.length,f=\"" + from + "\",g=" + (fromLast + 1) + ";i<" + fromLast + ";i++){if(d[l-i]!=f[g-i]&&f[g-i]!=\"?\")return false;}return true;})(m.from)");
                else if (fromLastLetter == "*")
                    condition += ("(function(d){for(var i=0,f=\"" + from + "\";i<" + fromLast + ";i++){if(d[i]!=f[i]&&f[i]!=\"?\")return false;}return true;})(m.from)");
            } else if (fromZ == 2 && fromFirstLetter == "*" && fromLastLetter == "*")
                condition += "(r=m.from.indexOf(\"" + from.substr(1, fromLast - 1) + "\"))!=-1&&r!=0&&r!=m.from.length-" + fromLast + "+2;";
            else {
                condition += "islands(m.from, '" + from + "')";
            }
        }
        if (to) {
            if (from)
                condition += "&&";

            var toLast = to.length - 1,
                toZ = (to.match(/[*]/g) || []).length,
                toFirstLetter = to[0],
                toLastLetter = to[toLast];
            if (toZ == 0 && (to.match(/[?]/g) || []).length == 0) {
                condition += "m.to===\"" + to + "\"";
            } else if (toZ == 1) {
                if (toFirstLetter == "*")
                    condition += ("(function(d){for(var i=0,l=d.length,f=\"" + to + "\",g=" + to.length + ";i<" + (to.length - 1) + ";i++){if(d[l-i]!=f[g-i]&&f[g-i]!=\"?\")return false;}return true;})(m.to)");
                else if (toLastLetter == "*")
                    condition += ("(function(d){for(var i=0,f=\"" + to + "\";i<" + toLast + ";i++){if(d[i]!=f[i]&&f[i]!=\"?\")return false;}return true;})(m.to)");
            } else if (toZ == 2 && toFirstLetter == "*" && toLastLetter == "*")
                condition += "(r=m.to.indexOf(\"" + to.substr(1, toLast - 1) + "\"))!=-1&&r!=0&&r!=m.to.length-" + toLast + "+2;";
            else {
                condition += "islands(m.to, '" + to + "')";
            }
        }

        filter.check = new Function("m", "return " + condition);
    }

}

function filter(msgs, filters) {
    init(filters);
    var res = {};
    for (var i in msgs) {
        res[i] = [];
        for (var j = 0; j < filters.length; j++)
            if ((f=filters[j]).check(msgs[i]))
                res[i].push(f.action);
    }
    return res;
};

function islands(msg, filter) {
    var islands = filter.match(/[^*]+/g);
    var isBeginZ = (filter[0] === '*')
    var isEndZ = (filter[filter.length-1] === '*')
    var msgIndex = 0,
        islandIndex = 0,
        islandStringIndex = 0;
    for (; msgIndex < msg.length; msgIndex++) {
        if (islandIndex == islands.length)
            return !isEndZ ? msgIndex + 1 == msg.length : true;
        if (islands[islandIndex].length == 0) {
            islands.splice(islandIndex, 1);
            msgIndex -= 1;
            continue;
        }
        if (islands[islandIndex][islandStringIndex] == msg[msgIndex] || islands[islandIndex][islandStringIndex] == "?") {
            if (islandStringIndex + 1 == islands[islandIndex].length) {
                if (islandIndex + 1 == islands.length)
                    return !isEndZ ? msgIndex + 1 == msg.length : true;
                islandIndex++;
                islandStringIndex = 0;
                continue;
            }
            islandStringIndex++;
        } else if (!isBeginZ && msgIndex == 0)
            return false;
        else {
            if (islandStringIndex > 0)
                msgIndex -= islandStringIndex;
            islandStringIndex = 0;
        }

        if (msgIndex + 1 == msg.length && islandIndex + 1 != islands.length)
            return false;
    }
    if (islandIndex < islands.length)
        return false;
    return true;
}
