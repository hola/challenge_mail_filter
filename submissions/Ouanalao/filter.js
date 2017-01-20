/* (c) G.V.
 * 
 *  Версия с простейшим выборочным кэшированием: все адреса кэшируются только
 *  после второго появления.
 *    
 *      */

"use strict";
module.exports = function filter(m, r) {
    var defBuf = new Buffer(r.length);
    defBuf.fill(0);
    var counter = 0;
    var fromRoot = new N();
    var toRoot = new N();
    for (var i = 0; i < r.length; i++) {
        if (r[i].from != null) {
            parsePattern(r[i].from, fromRoot, i);
        } else {
            defBuf[i] = 1;
        }
        if (r[i].to != null) {
            parsePattern(r[i].to, toRoot, i);
        } else {
            defBuf[i] += 2;
            if (defBuf[i] == 3)
                counter++;
        }
    }

    var keys = Object.keys(m);
    var ra = new Buffer(r.length);
    var context = {counter: counter, flag: 0, toc: 0, frc: 0, result: ra};
    var tc = new Map();
    var fc = new Map();
    for (var i = 0; i < keys.length; i++) {
        context.counter = counter;
        var t_entry = tc.get(m[keys[i]].to);
        if (t_entry != null) {
            context.flag = 1;
        } else {
            t_entry = new cacheEntry();
            tc.set(m[keys[i]].to, t_entry);
            context.flag = 0;
        }

        if (context.flag == 1) {
            if (t_entry.buf != null) {
                t_entry.buf.copy(ra);
                context.counter = t_entry.counter;
            } else {
                defBuf.copy(ra);
                nl(context, m[keys[i]].to, 0, null, toRoot.sc, toRoot.ac);
                t_entry.buf = new Buffer(r.length);
                t_entry.counter = context.counter;
                ra.copy(t_entry.buf);
            }
        } else {
            defBuf.copy(ra);
            nl(context, m[keys[i]].to, 0, null, toRoot.sc, toRoot.ac);
        }


        var f_entry = fc.get(m[keys[i]].from);
        if (f_entry != null) {
            context.flag = 3;
        } else {
            f_entry = new fEntry();
            fc.set(m[keys[i]].from, f_entry);
            context.flag = 2;
        }

        if (context.flag == 3) {

            var fnn = f_entry.a != null;
            if (fnn) {
                for (var j = 0; j < f_entry.a.length; j++) {
                    if (ra[f_entry.a[j]] == 2) {
                        context.counter++;
                        ra[f_entry.a[j]] = 3;
                    }
                }
            } else {
                context.frc = 0;
                nl(context, m[keys[i]].from, 0, null, fromRoot.sc, fromRoot.ac);
                f_entry.a = new Uint32Array(context.frc);
            }

            if (!fnn && context.frc > 0) {
                if ((context.counter) > 0) {
                    m[keys[i]] = new Array(context.counter);
                    for (var j = ra.length - 1; j >= 0; j--) {
                        switch (ra[j]) {
                            case 3:
                                m[keys[i]][--context.counter] = r[j].action;
                            case 1:
                            {
                                if (ra[j] != defBuf[j] && defBuf[j] != 1)
                                    f_entry.a[--context.frc] = j;
                            }
                        }
                    }
                } else {
                    m[keys[i]] = [];
                    for (var j = ra.length - 1; j >= 0; j--) {
                        switch (ra[j]) {
                            case 3:
                            case 1:
                            {
                                if (ra[j] != defBuf[j] && defBuf[j] != 1)
                                    f_entry.a[--context.frc] = j;
                            }
                        }
                    }
                }
            } else {
                if ((context.counter) > 0) {
                    m[keys[i]] = new Array(context.counter);
                    for (var j = ra.length - 1; j >= 0; j--) {
                        if (ra[j] == 3) {
                            m[keys[i]][--context.counter] = r[j].action;
                        }
                    }
                } else {
                    m[keys[i]] = [];
                }
            }


        } else {
            nl(context, m[keys[i]].from, 0, null, fromRoot.sc, fromRoot.ac);
            if ((context.counter) > 0) {
                m[keys[i]] = new Array(context.counter);
                for (var j = ra.length - 1; j >= 0; j--) {
                    if (ra[j] == 3) {
                        m[keys[i]][--context.counter] = r[j].action;
                    }
                }
            } else {
                m[keys[i]] = [];
            }
        }

    }

    return m;
}

function cacheEntry() {
    this.buf = null;
    this.counter = 0;
}

function fEntry() {
    this.a = null;
}

function addFilters(context, filters) {
    switch (context.flag) {
        case 0: // TO w/o CACHE
            {
                for (var i = filters.length - 1; i >= 0; i--) {
                    switch (context.result[filters[i]]) {
                        case 1:
                            context.counter++;
                        case 0:
                        {
                            context.result[filters[i]] += 2;
                        }
                    }
                }
            }
            break;
        case 1: // TO w/ CACHE
            {
                for (var i = filters.length - 1; i >= 0; i--) {
                    switch (context.result[filters[i]]) {
                        case 1:
                            context.counter++;
                        case 0:
                        {
                            context.result[filters[i]] += 2;
                            context.toc++;
                        }
                    }
                }
            }
            break;
        case 2: // FROM w/o CACHE
            {
                for (var i = filters.length - 1; i >= 0; i--) {
                    if (context.result[filters[i]] == 2) {
                        context.counter++;
                        context.result[filters[i]] += 1;
                    }
                }
            }
            break;
        case 3: // FROM w/ CACHE
            {
                for (var i = filters.length - 1; i >= 0; i--) {
                    switch (context.result[filters[i]]) {
                        case 2:
                            context.counter++;
                        case 0:
                        {
                            context.result[filters[i]] += 1;
                            context.frc++;
                        }
                    }
                }
            }
    }
}



function nl(context, str, offset, filters, sc, ac) {
    if ((filters != null) && (str.length == offset)) {
        addFilters(context, filters);
    } else {
        var b = str.length - offset;
        if (b < sc.length) {
            if ((sc[b] != null) && (sc[b][0] != null)) {
                addFilters(context, sc[b][0].filters);
            }
        } else {
            b = sc.length;
        }
        for (var min = 0; min < b; min++) {
            if (sc[min] != null) {
                var next = sc[min][str.charCodeAt(offset + min) - 31];
                if (next != null) {
                    nl(context, str, offset + min + 1, next.filters, next.sc, next.ac);
                }
            }
        }
        b = Math.min(ac.length, str.length - offset);
        for (min = 0; min < b; min++) {
            if (ac[min] != null) {
                for (var i = offset + min; i < str.length; i++) {
                    var next = ac[min][str.charCodeAt(i) - 31];
                    if (next != null && next.c <= str.length - i + min) {
                        nl(context, str, i + 1, next.filters, next.sc, next.ac);
                    }
                }
            }
        }
    }
    var boundary = Math.min(ac.length, str.length - offset + 1);
    for (var min = 0; min < boundary; min++) {
        if ((ac[min] != null) && (ac[min][0] != null)) {
            addFilters(context, ac[min][0].filters);
        }
    }
}

function N() {
    this.c = -1;
    this.sc = [];
    this.ac = [];
    this.filters = [];
}

function addNode(parent, char, min, asterisk, c) {

    var set = (asterisk ? parent.ac : parent.sc);
    var node;
    if (min >= set.length) {

        var i = min + 1;
        var newArray = new Array(i--);
        while (i--) {
            newArray[i] = set[i];
        }
        if (asterisk) {
            parent.ac = newArray;
            set = newArray;
        } else {
            parent.sc = newArray;
            set = newArray;
        }
    }

    if (set[min] == null) {
        set[min] = new Array(97);
    }

    node = set[min][(char == '') ? 0 : char.charCodeAt(0) - 31];
    if (node == null) {
        node = new N();
        set[min][(char == '') ? 0 : char.charCodeAt(0) - 31] = node;
    }
    if (node.c == -1 || node.c > c) {
        node.c = c;
    }

    return node;
}


function parsePattern(pstr, parent, rule) {

    var segments = pstr.split("*");
    var min = 0;
    var asterisk = false;
    var c = pstr.length - segments.length + 1;
    for (var i = 0; i < segments.length; i++) {
        asterisk = i > 0;
        for (var j = 0; j < segments[i].length; j++) {
            switch (segments[i][j]) {
                case "?":
                    {
                        min++;
                    }
                    break;
                default:
                {
                    parent = addNode(parent, segments[i][j], min, asterisk, c);
                    c -= min + 1;
                    min = 0;
                    asterisk = false;
                }
            }
        }
    }
    if (segments.length > 0 && segments[segments.length - 1] == "") {
        parent = addNode(parent, "", min, true, c);
    } else if (pstr.length > 0 && pstr.charAt(pstr.length - 1) == "?") {
        parent = addNode(parent, "", min, asterisk, c);
    }
    parent.filters.push(rule);
}
