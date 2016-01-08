;(function() {

    // Where to export the API
    var namespace;

    if (typeof module !== 'undefined') {
        // CommonJS / Node module
        namespace = module.exports = filter;
    } else {
        // Browsers and other environments
        namespace = (function() {
            // Get the global object.
            // Works in ES3, ES5, and ES5 strict mode.
            return this || (1, eval)('this');
        }());
    }

    namespace.filter = filter;

    function filter (messages, rules) {
        var len = rules.length,
            idx = len,
            rul,
            key,
            arr,
            msg;

        while (idx--) {
            rul = rules[idx];
            rul.from = normalize(rul.from);
            rul.to = normalize(rul.to);
        }

        for (key in messages) { // messages are keyed by id

            msg = messages[key]; // one message at a time
            arr = messages[key] = []; // store output in the original object to save memory

            for (idx = 0; idx < len; idx++) {

                rul = rules[idx]; // one rule at a time

                if (match(msg.from, rul.from, 0, 0) && match(msg.to, rul.to, 0, 0)) {
                    arr[arr.length] = rul.action; // success! include the action
                }
            }
        }

        return messages; // map of message ids => list of applicable actions
    }

    function normalize (mask) {
        return (mask || '*').replace(/\*+/g, '*');
    }

    function match (text, mask, pos, idx) {
        var all = '*', // matches 0+ arbitrary chars
            one = '?', // matches 1 arbitrary char
            sym, // mask symbol
            chr; // text char

        if (mask === all) {
            return true; // leaving so soon?
        }

        while (true) { // start iterating

            chr = text[pos++]; // current text character
            sym = mask[idx++]; // current mask symbol

            if (sym === all) { // match any character 0+ times

                sym = mask[idx++]; // get the next mask symbol

                if (sym !== one) { // match a specific character
                    while (chr && chr !== sym) { // try to find the exact match
                        chr = text[pos++];
                    }
                }

                if (chr) { // got matching character
                    if (match(text, mask, pos, idx - 2)) { // greedy check of the remainder
                        break; // the rest of the text matches the rest of the mask (including current symbol)
                    }
                } else if (sym) {
                    return false; // text EOL, but still got some mask symbols left
                } else {
                    break; // match!
                }

            } else if (sym === one) { // match any character once
                if (!chr) { // text EOL
                    return false;
                }
            } else { // try exact match
                if (chr !== sym) {
                    return false; // no match
                } else if (!sym) { // mask EOL
                    break; // match!
                }
            }
        }

        return true;
    }

}());
