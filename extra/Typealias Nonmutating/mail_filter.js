var rxesc = {
    '*': '.*?',
    '?': '.',
    '.': '\\.',
    '+': '\\+',
    '^': '\\^',
    '$': '\\$',
    '{': '\\{',
    '}': '\\}',
    '(': '\\(',
    ')': '\\)',
    '|': '\\|',
    '[': '\\[',
    ']': '\\]',
    '\\': '\\\\'
};

function mkrx(pattern)
{
    if (!pattern)
        return '.*?';
    var p = pattern.replace(/\*+/, '*');
    return p.replace(/[*?.+^${}()|[\]\\]/g, function(r)
    {
        return rxesc[r] || r;
    });
}

function filter(messages, rules)
{
    var i, j;
    var rr = [];
    for (i = 0; i < rules.length; i++)
    {
        var rx = '^' + mkrx(rules[i].from) + '\xff' + mkrx(rules[i].to) + '$';
        rr.push({ rx: new RegExp(rx), action: rules[i].action });
    }
    var c = {};
    var ret = {};
    var k = Object.keys(messages);
    for (i = 0; i < k.length; i++)
    {
        var rtki = [];
        var msg = messages[k[i]];
        var mm = messages[k[i]].from + '\xff' + messages[k[i]].to;
        if (c[mm])
        {
            ret[k[i]] = c[mm];
            continue;
        }
        for (j = 0; j < rr.length; j++)
            if (rr[j].rx.test(mm))
                rtki.push(rr[j].action);
        ret[k[i]] = c[mm] = rtki;
    }
    return ret;
}

module.exports = filter;
