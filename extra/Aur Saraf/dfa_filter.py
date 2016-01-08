def globs2nfa(patterns):
    nfa = [{'_free': []}]
    for match, pattern in patterns.iteritems():
        nfa[0]['_free'].append(len(nfa))
        while pattern:
            l = len(nfa)
            next, pattern = node(pattern, l)
            nfa.append(next)
        nfa.append({'match': [match]})
    for i in xrange(len(nfa) - 1, -1, -1):
        free = set([i])
        if '_free' in nfa[i]:
            for j in nfa[i].get('_free'):
                assert j > i
                free.update(nfa[j]['free'])
            del nfa[i]['_free']
        nfa[i]['free'] = list(free)
    return nfa

def node(pattern, length):
    c = pattern[0]
    pattern = pattern[1:]
    if c == '?':
        return {None: [length + 1]}, pattern
    elif c == '*':
        while pattern and pattern[0] == '*':
            pattern = pattern[1:]
        return {None: [length + 0], '_free': [length + 1]}, pattern
    else:
        return {c: [length + 1]}, pattern

def run_nfa(nfa, string):
    states = set([0])
    while string:
        c = string[0]
        string = string[1:]
        new_states = set()
        for i in states:
            for j in nfa[i]['free']:
                for k in nfa[j].get(c, []):
                    new_states.add(k)
                for k in nfa[j].get(None, []):
                    new_states.add(k)
        states = new_states
    matches = [match for s in states for f in nfa[s]['free'] for match in nfa[f].get('match', [])]
    return list(sorted(matches))

print globs2nfa({'1': 'a*b?', '2': '*c*', '3': '?b?'})

aaa = globs2nfa({'1': 'aaa'})
assert run_nfa(aaa, 'aaa') == ['1']
assert run_nfa(aaa, 'aa') == []
assert run_nfa(aaa, 'aaaa') == []
abc = globs2nfa({'2': 'abc'})
assert run_nfa(abc, 'abc') == ['2']
assert run_nfa(abc, 'aaa') == []
aqq = globs2nfa({'3': 'a??'})
assert run_nfa(aqq, 'aaa') == ['3']
assert run_nfa(aqq, 'abc') == ['3']
assert run_nfa(aqq, 'baa') == []
qqa = globs2nfa({'3': '??a'})
assert run_nfa(qqa, 'aaa') == ['3']
assert run_nfa(qqa, 'bca') == ['3']
assert run_nfa(qqa, 'aab') == []
sc = globs2nfa({'4': '*c'})
assert run_nfa(sc, 'c') == ['4']
assert run_nfa(sc, 'ac') == ['4']
assert run_nfa(sc, 'abc') == ['4']
assert run_nfa(sc, 'aaa') == []
assert run_nfa(sc, 'aca') == []
cs = globs2nfa({'4': 'c*'})
print cs
assert run_nfa(cs, 'c') == ['4']
assert run_nfa(cs, 'ca') == ['4']
assert run_nfa(cs, 'cab') == ['4']
assert run_nfa(cs, 'aaa') == []
assert run_nfa(cs, 'aca') == []
many = globs2nfa({'1': 'aaa', '2': 'abc', '3': 'a??', '4': '*c'})
print many
assert run_nfa(many, 'aaa') == ['1', '3']
assert run_nfa(many, 'ac') == ['4']
assert run_nfa(many, 'c') == ['4']
assert run_nfa(many, 'aca') == ['3']

def globs2dfa(patterns):
    nfa = globs2nfa(patterns)
    return nfa2dfa(nfa)
def nfa2dfa(nfa):
    dfa = []
    powerset_index = {}
    initial = tuple(sorted(nfa[0]['free']))
    add_dfa_state_recursive(dfa, nfa, powerset_index, initial)
    return dfa
def add_dfa_state_recursive(dfa, nfa, powerset_index, powerset):
    if powerset not in powerset_index:
        powerset_index[powerset] = len(dfa)
        dfa.append(None)

    dfa_state = {}
    match = []
    for state in powerset:
        for input, substates in nfa[state].iteritems():
            if input == 'free':
                continue
            if input == 'match':
                match += substates
                continue
            next = dfa_state.setdefault(input, set())
            for substate in substates:
                next.update(nfa[substate]['free'])

    if None in dfa_state:
        for input in dfa_state:
            if input is not None:
                dfa_state[input].update(dfa_state[None])

    our_index = powerset_index[powerset]
    dfa[our_index] = {}
    for input, states in dfa_state.iteritems():
        new_powerset = tuple(sorted(states))
        if new_powerset not in powerset_index:
            add_dfa_state_recursive(dfa, nfa, powerset_index, new_powerset)
        dfa[our_index][input] = powerset_index[new_powerset]
    dfa[our_index]['match'] = match
    return our_index

def run_dfa(dfa, string):
    state = 0
    for c in string:
        this_state = dfa[state]
        if c in this_state:
            state = this_state[c]
        elif None in this_state:
            state = this_state[None]
        else:
            return []
    return dfa[state]['match']
aaa = globs2dfa({'1': 'aaa'})
print aaa
assert run_dfa(aaa, 'aaa') == ['1']
assert run_dfa(aaa, 'aa') == []
assert run_dfa(aaa, 'aaaa') == []
abc = globs2dfa({'2': 'abc'})
assert run_dfa(abc, 'abc') == ['2']
assert run_dfa(abc, 'aaa') == []
aqq = globs2dfa({'3': 'a??'})
print aqq
assert run_dfa(aqq, 'aaa') == ['3']
assert run_dfa(aqq, 'abc') == ['3']
assert run_dfa(aqq, 'baa') == []
qqa = globs2dfa({'3': '??a'})
assert run_dfa(qqa, 'aaa') == ['3']
assert run_dfa(qqa, 'bca') == ['3']
assert run_dfa(qqa, 'aab') == []
sc = globs2dfa({'4': '*c'})
assert run_dfa(sc, 'c') == ['4']
assert run_dfa(sc, 'ac') == ['4']
assert run_dfa(sc, 'abc') == ['4']
assert run_dfa(sc, 'aaa') == []
assert run_dfa(sc, 'aca') == []
cs = globs2dfa({'4': 'c*'})
print cs
assert run_dfa(cs, 'c') == ['4']
assert run_dfa(cs, 'ca') == ['4']
assert run_dfa(cs, 'cab') == ['4']
assert run_dfa(cs, 'aaa') == []
assert run_dfa(cs, 'aca') == []
many = globs2dfa({'1': 'aaa', '2': 'abc', '3': 'a??', '4': '*c'})
print many
assert run_dfa(many, 'aaa') == ['1', '3']
assert run_dfa(many, 'ac') == ['4']
assert run_dfa(many, 'c') == ['4']
assert run_dfa(many, 'aca') == ['3']
patterns = [
    'aaa',
    'abc',
    '?',
    'a?',
    'a??',
    '?a', #5
    '??a',
    '?a?',
    '*',
    'a*',
    '*a',#10
    '*a*',
    'ab*',
    '*?',
    '?*',
    'a*?',#15
    'a?*',
    '*a?',
    '?a*',
    '*?a',
    '?*a',#20
    '*?a',
    '?*a',
    '**',
    '',
]
pattern_dict = dict(zip(patterns, patterns))
many = globs2dfa(pattern_dict)
print many
assert run_dfa(many, '') == ['', '*', '**']
assert run_dfa(many, 'a') == ['*a', '*', '*a*', '?', '*?', 'a*', '?*', '**']
assert run_dfa(many, 'ab') == ['*a?', '*', '*a*', 'a?*', '*?', 'a*', '?*', '**', 'a?', 'ab*', 'a*?']
assert run_dfa(many, 'abc') == ['abc', 'a??', '*', '*a*', 'a?*', '*?', 'a*', '?*', '**', 'ab*', 'a*?']
assert run_dfa(many, 'aa') == ['*a', '?a', '*a?', '?*a', '*', '*a*', 'a?*', '*?', 'a*', '?*', '**', 'a?', '*?a', 'a*?', '?a*']
assert run_dfa(many, 'aaa') == ['*a', '*a?', '??a', '?*a', 'a??', '*', '*a*', 'a?*', '*?', 'a*', '?*', '**', '*?a', 'aaa', '?a?', 'a*?', '?a*']
assert run_dfa(many, 'cab') == ['*a?', '*', '*a*', '*?', '?*', '**', '?a?', '?a*']

import re
ESCAPE_RE = re.compile(r'[.*+?^${}()|[\]\\]')
Q_RE = re.compile(r'\\\?')
S_RE = re.compile(r'\\\*')
def regexes(patterns):
    return [
        (
            re.compile(S_RE.sub('.*?', Q_RE.sub('.', ESCAPE_RE.sub(r'\\$&', p)))),
            m
        )
        for p, m in patterns.iteritems()]

strings = ['', 'a', 'ab', 'abc', 'aa', 'aaa', 'cab'] * 10
def run_nfa_strings(nfa):
    [run_nfa(nfa, string) for string in strings]

def run_dfa_strings(dfa):
    [run_dfa(dfa, string) for string in strings]

def run_regexes(res, string):
    return [m for r, m in res if r.match(string)]
def run_regexes_strings(res):
    [run_regexes(res, string) for string in strings]
