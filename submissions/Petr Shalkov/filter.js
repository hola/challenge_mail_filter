/***********************************************************
The MIT License (MIT)

Copyright(C) 2015 Petr Shalkov (xio4you@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
************************************************************/

function filter(messages, rules) {
    var keys = Object.keys(messages),
        rulesRegExp = new Array(rules.length),
        allocatedList = new Array(rules.length),
        message,
        val,
        messageKey,
        key,
        result = {},
        cache = {},
        cacheFrom = {},
        cacheTo = {},
        rule,
        from,
        to,
        re1 = /\*/,
        re2 = /\?/;

    for (var idx = 0, len = rules.length; idx < len; ++idx) {
        rule = rules[idx];
        from = rule.from;
        to = rule.to;
        allocatedList[idx] = false;

        rulesRegExp[idx] = {
            from: from && (optimize(from) || new RegExp(reformat(from))),
            to: to && (optimize(to) || new RegExp(reformat(to))),
            action: rule.action
        };
    }

    for (var idx = 0, len = keys.length; idx < len; ++idx) {
        key = keys[idx];
        message = messages[key];
        messageKey = message.from + message.to;
        val = cache[messageKey];

        if (!val) {
            val = checkMessage(message);
            cache[messageKey] = val;
        }

        result[key] = val;
    }

    function reformat(rule) {
        return '^' + rule.split('.').join('\\.').split('*').join('.*').split('?').join('.') + '$';
    }

    function optimize(expression) {
        if (!expression || re1.test(expression)) {
            return;
        }

        if (!re2.test(expression)) {
            return {
                test: function(value) {
                    return expression === value;
                }
            };
        } else {
            var regExp = new RegExp(reformat(expression));
            return {
                test: function(value) {
                    return expression.length === value.length && regExp.test(value);
                }
            };
        }
    }

    function matchFromCache(matchFrom, matchTo) {
        var matching = [];

        for (var idx = 0, len = rulesRegExp.length; idx < len; ++idx) {
            if (matchFrom[idx] && matchTo[idx]) {
                matching.push(rulesRegExp[idx].action);
            }
        }

        return matching;
    }

    function checkMessage(message) {
        var matching,
            messageFrom = message.from,
            messageTo = message.to,
            matchFrom = cacheFrom[messageFrom],
            matchTo = cacheTo[messageTo],
            rule,
            from,
            to,
            flag;

        if (!matchFrom && matchTo) {
            matchFrom = allocatedList.slice(0);

            for (var idx = 0, len = rulesRegExp.length; idx < len; ++idx) {
                rule = rulesRegExp[idx];
                from = rule.from;

                if (from && from.test(messageFrom) || !from) {
                    matchFrom[idx] = true;
                }
            }

            cacheFrom[messageFrom] = matchFrom;
        } else if (!matchTo && matchFrom) {
            matchTo = allocatedList.slice(0);

            for (var idx = 0, len = rulesRegExp.length; idx < len; ++idx) {
                rule = rulesRegExp[idx];
                to = rule.to;

                if (to && to.test(messageTo) || !to) {
                    matchTo[idx] = true;
                }
            }

            cacheTo[messageTo] = matchTo;
        } else if (!matchTo && !matchFrom) {
            matching = [];
            matchFrom = allocatedList.slice(0);
            matchTo = allocatedList.slice(0);

            for (var idx = 0, len = rulesRegExp.length; idx < len; ++idx) {
                rule = rulesRegExp[idx];
                flag = false;
                from = rule.from;
                to = rule.to;

                if (from && from.test(messageFrom) || !from) {
                    matchFrom[idx] = true;
                    flag = true;
                }

                if (to && to.test(messageTo) || !to) {
                    matchTo[idx] = true;
                    flag && matching.push(rule.action);
                }
            }

            cacheFrom[messageFrom] = matchFrom;
            cacheTo[messageTo] = matchTo;

            return matching;
        }

        return matchFromCache(matchFrom, matchTo);
    }

    return result;
}

module.exports.filter = filter;
