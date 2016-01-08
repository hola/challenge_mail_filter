// ewgenius <ewgeniux@gmail.com>

function mask2regexp(mask) {
  var regString = mask.replace(/\*/g, '(.*)').replace(/\?/g, '(.)');
  return new RegExp(regString + '$');
}

function validate(email, mask) {
  return mask.test(email);
}

function applyRule(rule, message) {
  var validFrom = true;
  var validTo = true;
  if (rule.from)
    validFrom = validate(message.from, mask2regexp(rule.from));
  if (rule.to)
    validTo = validate(message.to, mask2regexp(rule.to));
  if (validTo && validFrom)
    return rule.action;
  else
    return null;
}

function getEmptyRules(rules) {
  return rules.map(function(rule) {
    return rule.from || rule.to ? rule : undefined;
  });
}

function filter(messages, rules) {
  var result = {};
  Object.keys(messages).map(function(name) {
    var message = messages[name];
    result[name] = [];
    rules.forEach(function(rule) {
      var action = applyRule(rule, message);
      if (action)
        result[name].push(action);
    });
  });
  return result;
}
module.exports = filter;
