// Код модифицирует оба переданных массива - сообщений и правил
// Создание новых объектов требует дополнительных временных затрат

/**
 * Подготовка правил
 */

function escapeField(field) {
  if (field) {
    return new RegExp(field.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.'));
  }
  return field;
}

function escapeRules(rules) {
  for (let i = 0, n = rules.length; i < n; ++i) {
    let rule = rules[i];
    rule.from = escapeField(rule.from);
    rule.to = escapeField(rule.to);
  }
}

/**
 * Поиск подходящих писем
 */

function fieldsMatch(messageField, ruleField) {
  return !ruleField || messageField.match(ruleField);
}

function reduceRulesToActions(escapedRules, message) {
  let actions = [];
  for (let i = 0, n = escapedRules.length; i < n; ++i) {
    if (fieldsMatch(message.from, escapedRules[i].from) && fieldsMatch(message.to, escapedRules[i].to)) {
      actions.push(escapedRules[i].action);
    }
  }
  return actions;
}

/**
 * Присвоение actions объектам messages
 */

function setMessagesActions(messages, escapedRules) {
  let messagesKeys = Object.keys(messages);
  for (let i = 0, n = messagesKeys.length; i < n; ++i) {
    messages[messagesKeys[i]] = reduceRulesToActions(escapedRules, messages[messagesKeys[i]]);
  }
  return messages;
}

function filter(messages, rules) {
  escapeRules(rules);
  return setMessagesActions(messages, rules);
}

module.exports = filter;