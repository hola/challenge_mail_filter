ALL = 'ALL'

filter = (messages, rules) ->
  dfa = compileRulesDFA(rules)
  result = {}
  for id of messages
    result[id] = runRulesDFA(dfa, messages[id])
  result

SEPARATOR = '\u0000'
# I can use these as special chars because they will never
# be matched alone (only as part of '?' or '*') since there
# is no syntax for escaping in the rules.
# The reason I prefer them to characters that can't appear at
# all in valid messages like '\u0001' is that it's nice to be
# able to write object literals with them as keys. Also, faster.
# So beware: grepping for ANY will not find all usages of this.
ANY = '?'
MATCH = '*'
runRulesDFA = (dfa, message) ->
  runDFA dfa, message.from + SEPARATOR + message.to
runDFA = (dfa, input) ->
  state = 0
  for ch, i in input
    this_state = dfa[state]
    if not this_state
      return []
    state = this_state[ch]
    if not state? and ch != SEPARATOR
      state = this_state[ANY]
  this_state = dfa[state]
  if this_state? and this_state[MATCH]?
    return this_state[MATCH]
  []

compileRulesDFA = (rules) ->
  globs = (ruleToGlob rule for rule in rules)
  actions = (rule.action for rule in rules)
  compileGlobsDFA globs, actions
ruleToGlob = (rule) ->
  halfRuleToGlob(rule.from) + SEPARATOR + halfRuleToGlob(rule.to)
halfRuleToGlob = (half) ->
  if not half?
    return '*'
  return half

compileGlobsDFA = (globs, actions) ->
  if globs.length == 0
    return []
  nfa = compileGlobsNFA globs, [0 .. globs.length - 1]
  dfa = []
  statesIndex = {}
  initialStateSet = {}
  for state in nfa[0].free
    initialStateSet[state] = true
  addStatesSetToDFA nfa, dfa, actions, statesIndex, initialStateSet
  dfa

addStatesSetToDFA = (nfa, dfa, actions, statesIndex, statesSet) ->
  key = intSetToKey statesSet
  if statesIndex[key]?
    return statesIndex[key]
  ourIndex = statesIndex[key] = dfa.length
  node = {}
  dfa.push node

  [transition, actionsSet] = aggregateTransitions nfa, statesSet
  for input, newStatesSet of transition
    index = addStatesSetToDFA nfa, dfa, actions, statesIndex, newStatesSet
    node[input] = index
  node[MATCH] = actionsSetToActions(actionsSet, actions)
  ourIndex

intSetToKey = (statesSet) ->
  states = (match for match of statesSet)
  states.sort().join ','

actionsSetToActions = (actionsSet, actions) ->
  indexes = (index for index of actionsSet)
  (actions[i] for i in indexes.sort())

aggregateTransitions = (nfa, statesSet) ->
  transition = {}
  actionsSet = {}
  for state of statesSet
    for input, value of nfa[state]
      if input == 'free'
        continue
      if input == MATCH
        actionsSet[value] = true
        continue
      inputNextStatesSet = transition[input] ?= {}
      for reachableState in nfa[value].free
        inputNextStatesSet[reachableState] = true
  if transition[ANY]?
    for input, inputNextStatesSet of transition
      if input != ANY and input != SEPARATOR
        for reachableState of transition[ANY]
          inputNextStatesSet[reachableState] = true
  [transition, actionsSet]

compileGlobsNFA = (globs, actions) ->
  nfa = [{'_free': []}]
  for glob, globIndex in globs
    addGlob nfa, glob, actions[globIndex]
  calculateFree nfa
  nfa

addGlob = (nfa, glob, action) ->
  # connect beginning to here
  nfa[0]['_free'].push nfa.length

  i = 0
  len = glob.length
  while i < len
    ch = glob[i]
    if ch == '*'
        while i < len and glob[i + 1] == '*'
          i++
        nfa.push {'?': nfa.length, '_free': [nfa.length + 1]}
    # covered by the next case because of our choice of marker
    #else if ch == '?'
    #  nfa.push {'?': nfa.length + 1}
    else
      nfa.push {"#{ch}": nfa.length + 1}
    i++
  nfa.push {'*': action}

calculateFree = (nfa) ->
  for i in [nfa.length - 1..0] by -1
    freeSet = {}
    freeSet[i] = true
    _free = nfa[i]._free
    if _free?
      for connected in _free
        #assert connected > i
        for freeState in nfa[connected].free
          freeSet[freeState] = true
      delete nfa[i]._free
    nfa[i].free = (+state for state of freeSet)

module.exports = filter: filter
