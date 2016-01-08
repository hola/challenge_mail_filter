/**
 * Created by Мальцев Иван on 16.11.2015.
 * Update on 17.11.2015
 * email: mrfreeman02@ya.ru
 */

exports.filter = function (messages, rules) {

    function fnmatch(s, rule) {
        if (rule == undefined || rule == '*' || s == rule) return true;
        var ii;
        var len = rule.length;
        var slen = s.length;
        var slens = slen - 1;
        var lens = len - 1;
        for (var i = 0; i < len; i++) {
            if (rule[i] == "*") {
                ii = i + 1;
                var smax = len > slen ? len : slen;
                for (var c = i; c < smax; c++) {
                    if (fnmatch(s.substr(c, lens), rule.substr(ii, slens))) {
                        return true;
                    }
                }
                return false;
            }

            if (rule[i] == "?") {
                continue;
            }
            if (rule[i] != s[i]) {
                return false;
            }
        }
        return true;
    }

    var good = {};
    for (var m in messages) {
        good[m] = [];
        var mo = messages[m];
        for (var r = 0; r < rules.length; r++) {
            var ro = rules[r];
            if (fnmatch(mo.from, ro.from) && fnmatch(mo.to, ro.to)) {
                good[m].push(ro.action);
            }
        }
    }
    return good;
};