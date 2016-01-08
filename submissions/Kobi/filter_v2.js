/* 
Author: kobi( kobi@napuzba.com )

Compile glob patterns to regular expressions and cache them.
*/

'use strict';
var _cache = {};
var _reReg = /[|\\{}()[\]^$+.]/g;
var _reOne = /[?]/g
var _reAny = /[*]/g
    
function _compilePattern( pattern ){
    var cPattern = _cache[pattern];
    if ( cPattern !== undefined) {
        return cPattern;
    }    
    if (pattern === undefined || (pattern.indexOf('?') === -1 && pattern.indexOf('*') === -1 ) ) {
        cPattern = { pattern: pattern }
    } else {
        cPattern = { pattern: pattern , re: new RegExp( '^' + pattern.replace(_reReg,'\\$&').replace(_reOne,'.').replace(_reAny,'.*?') + '$' )};
    }
    _cache[pattern] = cPattern;
    return cPattern;
}

function _compileRules(rules) {
    return rules.map( function(rule) {
        return { from : _compilePattern(rule.from) , to :  _compilePattern(rule.to) , action : rule.action }
    });
}

function _match(ss,pattern)  {
    return pattern.pattern === undefined || ( pattern.re ? pattern.re.test(ss) : pattern.pattern === ss );
}

exports.filter = function (messages, rules) {
    var cRules = _compileRules(rules);    
    var rr = {}
    for (var key in messages) {
        var message = messages[key];
        var actions = rr[key] = [];
        for ( var ii = 0; ii< cRules.length; ii++ ) {
            var cRule = cRules[ii];
            if ( _match(message.from, cRule.from) && _match(message.to, cRule.to) ) {
                actions.push( cRule.action );
            }
        }
    }
    return rr;
}
