var compare = function (what, expr) {
    var result = true;
    if (expr === '*' || !expr) {
        return result;
    }

    var stopper;
    var gap = 0;
    for (var i = 0, l = what.length; i < l; i++) {
        if (stopper) {

            if (what[i] === stopper) {
                stopper = undefined;
            } else {
                gap++;
            }

            continue;
        }

        if (expr[i - gap] === '*') {
            stopper = expr[i - gap + 1];
            
            if (stopper === undefined) {
                break;
            }
            continue;
        }

        if (expr[i - gap] === '?') {
            continue;
        }

        if (what[i] !== expr[i - gap]) {
            result = false;
            break;
        }
    };

    return result;
}


module.exports = function (messages, filters) {
    var result = {};
    var message;
    var filter;
    var resultItem;

    for (var name in messages) { 
        resultItem = result[name];
        if (!resultItem) {
            resultItem = result[name] = [];
        }
        
        message = messages[name];

        for (var i = 0, l = filters.length; i < l; i++) {
            filter = filters[i];
            if (
                compare(message.from, filter.from) &&
                compare(message.to, filter.to)
            ) {
                resultItem.push(filter.action);
            }
        }
    }

    return result;
};