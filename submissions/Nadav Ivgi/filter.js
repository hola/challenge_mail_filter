function filter(msgs, rules) {
  rules = rules.map(r => ({ action: r.action, from: compile(r.from), to: compile(r.to) }))
  var mids = Object.keys(msgs), j = mids.length, rulesl = rules.length, actions = {}
  while (j--) {
    var mid=mids[j], m = msgs[mid], a = actions[mid] = [], r
    for (var i=0; i<rulesl; i++) r = rules[i], grep(m, r) && a.push(r.action)
  }
  return actions
}

var grep = (m, r) => (!r.from || r.from.test(m.from)) && (!r.to || r.to.test(m.to))

var compile = pattern => pattern && new RegExp('^' + pattern
    .replace(/([.+=^!:${}()|[\]\/\\])/g, '\\$1')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  + '$')

module.exports = filter
