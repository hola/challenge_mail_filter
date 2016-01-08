function filter(messages, rules){
    var delim1  = String.fromCharCode(1)
      , delim2  = String.fromCharCode(2)
      , delim3  = String.fromCharCode(3)
      , maskOne = '[^'+delim1+delim2+delim3+']'
      , maskAll = maskOne + '*'
      , keysMes = Object.keys(messages)
      , ruleId, str, indexes, me, re, notRegexp, groups, grp, idx, maskFrom, maskTo, from, to
      , groupRules = {};

    function convertMask(mask){
        if (mask == undefined){
            return maskAll;
        } else if (/\*|\?/.test(mask)){
            return mask
                .replace(/[-\/\\^$+.()|[\]{}]/g, '\\$&')
                .replace(/\?/g, maskOne)
                .replace(/\*/g, maskAll);
        } else {
            return mask;
        }
    }

    function add_action(m_index, action){
        indexes[m_index].forEach(function(msgid){
            groupRules[ruleId].push(msgid);
            ret[msgid].push(action);
        });
    }

    function match_rule(rule){
        ruleId = (rule.from || '*') + (rule.to || '*');

        if ((grp = groupRules[ruleId]) != undefined){
            grp.forEach(function(msgid){
                ret[msgid].push(rule.action);
            });
        } else {
            groupRules[ruleId] = [];

            maskFrom = maskAll;
            maskTo   = maskAll;

            if (rule.from)
                maskFrom = convertMask(rule.from);

            if (rule.to)
                maskTo   = convertMask(rule.to);

            if (maskTo == maskAll && maskFrom == maskAll){
                keysMes.forEach(function(msgid){
                    groupRules[ruleId].push(msgid);
                    ret[msgid].push(rule.action);
                })
            } else {

                if (maskFrom == maskAll){
                    me        = delim1+maskTo+delim2;
                    str       = messagesStrTo;
                    indexes   = dictTo;
                    groups    = groupTo;
                    notRegexp = maskTo == rule.to;
                } else if (maskTo == maskAll){
                    me        = delim1+maskFrom+delim2;
                    str       = messagesStrFrom;
                    indexes   = dictFrom;
                    groups    = groupFrom;
                    notRegexp = maskFrom == rule.from;
                } else {
                    me        = delim1+maskFrom+delim2+maskTo+delim3;
                    str       = messagesStr;
                    indexes   = dict;
                    groups    = group;
                    notRegexp = maskTo == rule.to && maskFrom == rule.from;
                }

                if (notRegexp){
                    if ((idx = groups[me]) != undefined){
                        add_action(idx, rule.action);
                    }
                } else {
                    re = new RegExp(me, 'g');
                    while((m = re.exec(str)) != null){
                        add_action(m.index, rule.action);
                    }
                }
            }
        }
    }

    var index
        , messagesStr = ''
        , dict  = {}
        , ret   = messages
        , group = {}
        , s
        , indexTo
        , messagesStrTo = ''
        , dictTo  = {}
        , groupTo = {}
        , sTo
        , indexFrom
        , messagesStrFrom = ''
        , dictFrom  = {}
        , groupFrom = {}
        , sFrom;

    keysMes.forEach(function(msgkey){
        from = messages[msgkey].from;
        to   = messages[msgkey].to;

        index = messagesStr.length;

        s     = delim1 + from + delim2 + to + delim3;
        sTo   = delim1 + to   + delim2;
        sFrom = delim1 + from + delim2;

        ret[msgkey]  = [];

        if ((idx = group[s]) !=undefined){
            dict[idx].push(msgkey);
            dictTo[groupTo[sTo]].push(msgkey);
            dictFrom[groupFrom[sFrom]].push(msgkey);
            return;
        } else {
            messagesStr += s;
            group[s]     = index;
            dict[index]  = [msgkey];
        }

        indexTo   = messagesStrTo.length;
        indexFrom = messagesStrFrom.length;

        if ((idx = groupTo[sTo]) !=undefined){
            dictTo[idx].push(msgkey);
        } else {
            messagesStrTo  += sTo;
            groupTo[sTo]    = indexTo;
            dictTo[indexTo] = [msgkey];
        }

        if ((idx = groupFrom[sFrom]) !=undefined){
            dictFrom[idx].push(msgkey);
        } else {
            messagesStrFrom    += sFrom;
            groupFrom[sFrom]    = indexFrom;
            dictFrom[indexFrom] = [msgkey];
        }
    });

    rules.forEach(match_rule);

    return ret;
}

exports.filter = filter;
