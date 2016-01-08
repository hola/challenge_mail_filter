var internals = {};

internals.isMatch = function(input, pattern, singleWildcard, multipleWildcard)
{
    var inputPosStack = [],
        patternPosStack = [],
        stackPos = -1,
        pointTested = [],
        inputPos = 0,
        patternPos = 0;

    // Match beginning of the string until first multiple wildcard in pattern
    while (inputPos < input.length && patternPos < pattern.length && pattern[patternPos] != multipleWildcard && (input[inputPos] == pattern[patternPos] || pattern[patternPos] == singleWildcard))
    {
        inputPos++;
        patternPos++;
    }

    // Push this position to stack if it points to end of pattern or to a general wildcard
    if (patternPos == pattern.length || pattern[patternPos] == multipleWildcard)
    {
        pointTested[inputPos] = pointTested[inputPos] || [];
        pointTested[inputPos][patternPos] = true;
        inputPosStack[++stackPos] = inputPos;
        patternPosStack[stackPos] = patternPos;
    }
    var matched = false;
    // Repeat matching until either string is matched against the pattern or no more parts remain on stack to test
    while (stackPos >= 0 && !matched)
    {
        inputPos = inputPosStack[stackPos];         // Pop input and pattern positions from stack
        patternPos = patternPosStack[stackPos--];   // Matching will succeed if rest of the input string matches rest of the pattern
        if (inputPos == input.length && patternPos == pattern.length)
            matched = true;     // Reached end of both pattern and input string, hence matching is successful
        else
        {
            // First character in next pattern block is guaranteed to be multiple wildcard
            // So skip it and search for all matches in value string until next multiple wildcard character is reached in pattern
            for (var curInputStart = inputPos; curInputStart < input.length; curInputStart++)
            {
                var curInputPos = curInputStart;
                var curPatternPos = patternPos + 1;
                if (curPatternPos == pattern.length)
                {   // Pattern ends with multiple wildcard, hence rest of the input string is matched with that character
                    curInputPos = input.length;
                }
                else
                {
                    while (curInputPos < input.length && curPatternPos < pattern.length && pattern[curPatternPos] != multipleWildcard &&
                    (input[curInputPos] == pattern[curPatternPos] || pattern[curPatternPos] == singleWildcard))
                    {
                        curInputPos++;
                        curPatternPos++;
                    }
                }
                // If we have reached next multiple wildcard character in pattern without breaking the matching sequence, then we have another candidate for full match
                // This candidate should be pushed to stack for further processing
                // At the same time, pair (input position, pattern position) will be marked as tested, so that it will not be pushed to stack later again
                pointTested[curInputPos] = pointTested[curInputPos] || [];
                if (((curPatternPos == pattern.length && curInputPos == input.length) || (curPatternPos < pattern.length && pattern[curPatternPos] == multipleWildcard))
                    && !pointTested[curInputPos][curPatternPos])
                {
                    pointTested[curInputPos][curPatternPos] = true;
                    inputPosStack[++stackPos] = curInputPos;
                    patternPosStack[stackPos] = curPatternPos;
                }
            }
        }
    }
    return matched;
};

exports.filter = function(messages, rules){
    var out = {};
    var keys = Object.keys(messages);

    for(var i = 0; i < keys.length; i++){
        var currKey = keys[i];
        var currMessage = messages[currKey];
        var currOut = out[currKey] = [];

        for (var ri = 0; ri < rules.length; ri++) {
            var currRule = rules[ri];

            if ((!currRule.from || internals.isMatch(currMessage.from, currRule.from, '?', '*')) &&
                (!currRule.to || internals.isMatch(currMessage.to, currRule.to, '?', '*'))) {
                currOut.push(currRule.action);
            }
        }
    }

    return out;
};