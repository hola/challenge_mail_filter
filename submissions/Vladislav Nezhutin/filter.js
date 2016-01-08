module.exports = function (messagesDict, rules) {

    // http://habrahabr.ru/company/hola/blog/270847/#comment_8654401
    // KingOfNothing 14 ноября 2015 в 18:11# А можно изменять входящие объекты?
    // feldgendler 14 ноября 2015 в 18:13# Можно.
    var result = messagesDict;

    var messagesArr = [];

    // console.time('make message array');
    for (var messageId in messagesDict) {
        var msg = messagesDict[messageId];
        msg.actions = result[messageId] = [];
        messagesArr.push(msg);
    }
    // console.timeEnd('make message array');

    var messageCollection = new Collection(messagesArr);

    // console.time('collect statistics');
    var usefulIndexesDescrs = getUsefulIndexesDescriptionsForRules(
        rules,
        Math.log(messagesArr.length) * 18, // minPrefixIndexDemand
        Math.log(messagesArr.length) * 36 // minSuffixIndexDemand
    );
    // console.timeEnd('collect statistics');

    usefulIndexesDescrs.forEach(function (indexDescr) {
        messageCollection.buildIndex.apply(
            messageCollection,
            indexDescr
        );
    });

    for (var iRule = 0, rulesCount = rules.length; iRule < rulesCount; iRule++) {
        var rule = rules[iRule];
        var range = messageCollection.query(rule);


        // var scanTimerName = 'scan ' + (range.endExclusive - range.start) +
        //                     ' messages for rule ' + JSON.stringify(rule) +
        //                     ' using ' + range.indexName;
        // console.time(scanTimerName);

        var iMessage = range.start;
        if (!(iMessage < 0)) {
            var rangeEndExclusive = range.endExclusive;
            var rangeArray = range.array;
            var action = rule.action;
            var testFrom = compileMask(rule.from);
            var testTo = compileMask(rule.to);
            while (iMessage < rangeEndExclusive) {
                var message = rangeArray[iMessage++];
                if (testFrom(message.from) && testTo(message.to)) {
                    message.actions.push(action);
                }
            }
        }

        // console.timeEnd(scanTimerName);
    }

    return result;
}

function Collection(tuples) {
    this.tuples = tuples;
    this.indexes = [];
    this.fullRange = {
        start: 0,
        endExclusive: tuples.length,
        array: tuples,
        indexName: 'no index'
    };
}

Collection.prototype.query = function (queryObj) {
    return this.indexes
        .map(function (index) { return index.query(queryObj); })
        .filter(Boolean)
        .reduce(getShortestRange, this.fullRange);

    function getShortestRange(a, b) {
        return (a.endExclusive - a.start) < (b.endExclusive - b.start) ? a : b;
    }
};

Collection.prototype.buildIndex = function (prop, affixType, affixOffset) {
    this.indexes.push(new Index(
        this.tuples,
        prop,
        affixType,
        affixOffset
    ));
};

function Index(tuples, prop, affixType, affixOffset) {
    this.name = affixType + '(' + affixOffset + ') index on `' + prop + '`';

    // var indexBuildTimerName = 'building ' + this.name;
    // console.time(indexBuildTimerName);

    // sort works 3 times faster with following hint
    prop = prop == 'from' ? 'from' :
           prop == 'to' ? 'to' :
           prop;

    this.comparer = this.comparersByAffixType[affixType];
    this.prop = prop;
    this.affixOffset = affixOffset;

    var compare = this.comparer.compare;
    this.sortedTuples = tuples.slice().sort(function (a, b) {
        return compare(affixOffset, a[prop], b[prop]);
    });

    // console.timeEnd(indexBuildTimerName);
}

Index.prototype.query = function (queryObj) {
    var comparer = this.comparer;
    var prop = this.prop;
    var affixOffset = this.affixOffset;
    var mask = queryObj[prop];
    var maskAffix = mask && comparer.getMaskAffix(mask);

    if (maskAffix && affixOffset == maskAffix.offset) {

        var rangeStart = findPosInSortedArray(
            this.sortedTuples,
            compareSearchingValueToElem,
            false // first pos
        );

        var rangeEnd = rangeStart < 0 || findPosInSortedArray(
            this.sortedTuples,
            compareSearchingValueToElem,
            true // last pos
        );

        return {
            start: rangeStart,
            endExclusive: rangeStart < 0 ? rangeStart : rangeEnd + 1,
            array: this.sortedTuples,
            indexName: this.name
        };
    }

    function compareSearchingValueToElem(tuple) {
        return comparer.compare(
            affixOffset,
            comparer.getElemAffix(tuple[prop], maskAffix.value.length, affixOffset),
            maskAffix.value
        );
    }
};

Index.prototype.comparersByAffixType = {
    'prefix': {
        compare: function (offset, a, b) {
            for (var i = offset, len = Math.min(a.length, b.length); i < len; ++i) {
                var codeDiff = a.charCodeAt(i) - b.charCodeAt(i);
                if (codeDiff !== 0) return codeDiff;
            }
            return a.length - b.length;
        },
        getMaskAffix: function (mask) {
            if (mask) {
                var captures = mask.match(/^(\?*)([^\*\?]*)(.*)$/);
                var offset = captures[1].length;
                var prefix = captures[2];
                // var tail = captures[3];
                return prefix && {
                    value: prefix,
                    offset: offset
                    // ,needRecheck: tail && tail != '*'
                };
            }
        },
        getElemAffix: function (elem, length, offset) {
            return elem.substr(offset, length);
        }
    },
    'suffix': {
        compare: function (offset, a, b) {
            var ai = a.length - offset;
            var bi = b.length - offset;
            while (ai > 0 && bi > 0) {
                var codeDiff = a.charCodeAt(--ai) - b.charCodeAt(--bi);
                if (codeDiff !== 0) return codeDiff;
            }
            return a.length - b.length;
        },
        getMaskAffix: function (mask) {
            if (mask) {
                var captures = mask.match(/^(.*?)([^\*\?]*)(\?*)$/);
                var head = captures[1];
                var suffix = captures[2];
                var offset = captures[3].length;
                return suffix && head && {
                    value: suffix,
                    offset: offset
                    // ,needRecheck: head != '*'
                };
            }
        },
        getElemAffix: function (elem, length, offset) {
            return elem.substr(-length - offset, length);
        }
    }
};

function getUsefulIndexesDescriptionsForRules(rules,
                                              minPrefixIndexDemand,
                                              minSuffixIndexDemand)
{
    var statistics = {};
    var props = { 'from': true, 'to': true };
    var comparersByAffixType = Index.prototype.comparersByAffixType;

    for (var iRule = 0, rulesCount = rules.length; iRule < rulesCount; iRule++) {
        var rule = rules[iRule];

        for (var prop in props) {
            for (var affixType in comparersByAffixType) {
                var comparer = comparersByAffixType[affixType];
                var maskAffix = comparer.getMaskAffix(rule[prop]);
                if (maskAffix) {
                    var indexDescr = [prop, affixType, maskAffix.offset];
                    var indexDescrStr = JSON.stringify(indexDescr);
                    var stat = statistics[indexDescrStr] || (statistics[indexDescrStr] = {
                        indexDescr: indexDescr,
                        affixType: affixType,
                        demand: 0
                    });

                    stat.demand++;
                }
            }
        }
    }

    var usefulIndexesDescrs = [];
    for (var indexDescrStr_ in statistics) {
        var stat_ = statistics[indexDescrStr_];
        if ((stat_.affixType == 'prefix' && stat_.demand >= minPrefixIndexDemand) ||
            (stat_.affixType == 'suffix' && stat_.demand >= minSuffixIndexDemand)) {
            usefulIndexesDescrs.push(stat_.indexDescr);
        }
    }


    // require('console.table');
    // (console.table || console.log)(
    //     Object.keys(statistics)
    //           .map(it => statistics[it])
    //           .sort((a, b) => b.demand - a.demand)
    //           .map(it => ({
    //             prop: it.indexDescr[0],
    //             affixtyp: it.indexDescr[1],
    //             offset: it.indexDescr[2],
    //             demand: it.demand
    //           }))
    // );

    // var exactIndexesDescrs = process.env.INDEXES;
    // if (exactIndexesDescrs) {
    //     return exactIndexesDescrs.split(',')
    //             .map(it => it.split('_'))
    //             .map(it => [
    //                 it[0],
    //                 { p: 'prefix', s: 'suffix' }[it[1][0]],
    //                 Number(it[1].substr(1))
    //             ]);
    // }

    return usefulIndexesDescrs;
}

function findPosInSortedArray(array, compareFn, findLast) {
    var low = 0;
    var high = array.length - 1;
    var resultPos = -1;
    while (low <= high) {
        var mid = Math.floor((high - low) / 2) + low;
        var compareResult = compareFn(array[mid]);
        if (compareResult > 0) {
            high = mid - 1;
        } else if (compareResult < 0) {
            low = mid + 1;
        } else {
            resultPos = mid;
            if (findLast) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }
    return resultPos;
}

function compileMask(mask) {
    if (!mask || mask == '*') {
        return function allpass() {
            return true;
        };
    }

    var pattern = '';
    for (var i = 0; i < mask.length; i++) {
        var char = mask[i];
        pattern += char == '*' ? '.*?' :
                   char == '?' ? '.' :
                   '\\^$+.()|{}[]'.indexOf(char) >= 0 ? '\\' + char :
                   char;
    }
    var regexp = new RegExp('^' + pattern + '$');
    return function (testingStr) {
        return regexp.test(testingStr);
    };
}
