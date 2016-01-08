"use strict";

function updateObj(obj, func) {
  let keys = Object.getOwnPropertyNames(obj);

  for (let i = 0; i < keys.length; ++i) {
    obj[keys[i]] = func(obj[keys[i]]);
  }

  return obj;
}

function t() { return true; }

function fieldReg(field) {
  var reg = new RegExp("^" + field
                        .replace(/\?/g, '.')
                        .replace(/\*/g, '.*?') + "$");

  return function apply_reg(v) {
    return reg.test(v);
  }
}

function compileRule(rule) {
  var from = rule.from ? fieldReg(rule.from) : t;
  var to = rule.to ? fieldReg(rule.to) : t;
  var action = rule.action;

  return function apply_rule(message) {
    return from(message.from) && to(message.to) && action;
  };
}

function apply_rules(compiled, message) {
  var action;
  var actions = [];
  for (let i = 0; i < compiled.length; ++i) {
    if (action = compiled[i](message)) {
      actions.push(action);
    }
  }
}

function compileRules(rules) {
  var compiled = rules.map(compileRule);

  return function(m) {
    return apply_rules(compiled, m);
  };
}


module.exports = function(messages, rules) {
  let compiled = compileRules(rules);

  return updateObj(messages, compiled);
};
