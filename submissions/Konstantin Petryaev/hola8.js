"use strict";
var EVERY_REGEXP = /.?/;
var ASTER_REGEXP = /\*/g;
var QUESTON_REGEXP = /\?/g;
var EMPTY_STRING = '';

function getRegExp (str){
    if (str[0] === '*'){
        if (str[str.length - 1] === '*') return new RegExp((str.substr(1,str.length-1)).replace(ASTER_REGEXP, '.*').replace(QUESTON_REGEXP,'.'));
        return new RegExp((str.substr(1)).replace(ASTER_REGEXP, '.*').replace(QUESTON_REGEXP,'.') + '$');
    }
    if (str[str.length - 1] === '*') return new RegExp('^' + (str.substr(0,str.length-1)).replace(ASTER_REGEXP, '.*').replace(QUESTON_REGEXP,'.'));
    return new RegExp('^'+str.replace(ASTER_REGEXP, '.*').replace(QUESTON_REGEXP,'.') + '$');
}

function simplifyRegExpString(str){
    return str
        .replace(/\*{1,}\?\*{1,}/g, '*?')
        .replace(/\*{2,}/g, '*');
}

function isEvery (str){
    if (!str) return true;
    if (str === '*') return true;
};

function Rule(action, from, to){
    this.everyFrom = isEvery(from);
    this.everyTo = isEvery(to);
    
    if (this.everyFrom) {
        this.from = EVERY_REGEXP;
    }
    else {
        this.from = getRegExp(simplifyRegExpString(from));
    }
    
    if (this.everyTo){
        this.to = EVERY_REGEXP;
    }
    else {
        this.to = getRegExp(simplifyRegExpString(to));
    }
    
    this.action = action;

    return this;
}

function ruleIsApplicable (rule, from, to){
    if (rule_testFrom(rule, from)){
        return rule_testTo(rule, to);
    }
    return false;
};

function rule_testFrom (rule, string){
    if (rule.everyFrom) {
        return true;
    }
    return rule.from.test(string);
};
    
function rule_testTo (rule, string){
    if (rule.everyTo) {
        return true;
    }
    return rule.to.test(string);
};




function Rules(){
    this.list = [];
    return this;
};

function rulesAddRule (rules, actionObject){
    rules.push(new Rule(actionObject.action, actionObject.from, actionObject.to));
};

function rulesGetActions (array, from, to){
    return array.reduce(function(res, act){
        if (ruleIsApplicable(act, from, to)){
            res.push(act.action);
        }
        return res;
    }, []);
};

function filter (mails, _rules){
    var rules = [];
    _rules.forEach(function(rule){
        rulesAddRule(rules, rule);
    });
    var result = {};
    Object.keys(mails).forEach(function(key){
        result[key] = rulesGetActions(rules, mails[key].from, mails[key].to);
    });
    return result;
};


module.exports = filter;

module.exports.filter = filter;

