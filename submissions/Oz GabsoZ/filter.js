
(function () {
    function filter(messages, rules) {
        var retObj = {};
        Object.getOwnPropertyNames(messages).forEach(function (index) {
            retObj[index] = rules.reduce(function (previousValue, currentValue, currentIndex, array) {
                if (checkMatch(messages[index], currentValue)) {
                    previousValue.push(currentValue.action);
                }
                return previousValue;
            }, []);
        });
        return retObj;
    }

    function checkMatch(message, rule) {
        return ((!rule.from || compare(message.from, rule.from)) && (!rule.to || compare(message.to, rule.to)));
    }

    function compare(msgStr, rulStr) {
        return compareReq(msgStr.split(''), 0, rulStr.split(''), 0);
    }

    function compareReq(msgArr, msgIdx, rulArr, rulIdx) {
        if (!msgArr[msgIdx] && !rulArr[rulIdx]) {
            return true;
        }
        if (rulArr[rulIdx] === '*') {
            if (!rulArr[rulIdx + 1]) {
                return true;
            }
            var nextIdx = msgIdx - 1;
            while (true) {
                nextIdx = msgArr.indexOf(rulArr[rulIdx + 1], nextIdx + 1);
                if (nextIdx === -1) {
                    if (rulArr[rulIdx + 1] === '?') {
                        return markMode(msgArr, msgIdx, rulArr, rulIdx + 1, 0)
                    }
                    return false;
                }
                if (compareReq(msgArr, nextIdx, rulArr, rulIdx + 1)) {
                    return true;
                }
            }
        }
        if (msgArr[msgIdx] == rulArr[rulIdx] || (rulArr[rulIdx] === '?' && msgArr[msgIdx])) {
            return compareReq(msgArr, msgIdx + 1, rulArr, rulIdx + 1);
        }
        return false;
    }

    function markMode(msgArr, msgIdx, rulArr, rulIdx, count) {
        if (rulArr[rulIdx + 1] === '?') {
            return markMode(msgArr, msgIdx, rulArr, rulIdx + 1, count + 1);
        }
        if (!rulArr[rulIdx + 1]) {
            return (msgArr.length - msgIdx) > count;
        }
        var nextIndex = msgIdx - 1;
        while (true) {
            nextIndex = msgArr.indexOf(rulArr[rulIdx + 1], nextIndex + 1);
            if (nextIndex === -1) {
                if (rulArr[rulIdx + 1] === '*') {
                    return compareReq(msgArr, msgIdx + count + 1, rulArr, rulIdx + 1);
                }
                return false;
            }
            if ((nextIndex - msgIdx) > count && compareReq(msgArr, nextIndex, rulArr, rulIdx + 1)) {
                return true;
            }
        }
    }
    module.exports = filter;
})();