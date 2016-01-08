###
# Created by Nickolay on 24.12.2015.
###
filter = (messages, rules) ->
  escapeRegExpExceptStarAndQuestion = /[\-\[\]\/\{\}\(\)\+\.\\\^\$\|]/g
  replaceStar = /\*/g
  replaceQuestion = /\?/g

  for rule in rules
    if rule.from?
      rule.from_regexp = new RegExp ( "^" + (rule.from).replace(escapeRegExpExceptStarAndQuestion, "\\$&").replace(replaceStar, '.*').replace(replaceQuestion, '.') + "$" )
    if rule.to?
      rule.to_regexp = new RegExp ( "^" + (rule.to).replace(escapeRegExpExceptStarAndQuestion, "\\$&").replace(replaceStar, '.*').replace(replaceQuestion, '.') + "$" )

  result = {}
  for key, message of messages
    result[key] = []
    for rule in rules
      if !rule.action? then continue

      from_match = if rule.from? then rule.from_regexp.test(message.from) else true
      if not from_match
        continue

      to_match = if rule.to? then rule.to_regexp.test(message.to) else true
      if not to_match
        continue

      result[key].push(rule.action)

  result


module.exports =
  filter: filter

