/*
 * Written by Yuri Kilochek <yuri.kilochek@gmail.com>
 * for Hola's "JS challenge Winter 2015: Mail Filtering Engine"
 * at http://hola.org/challenge_mail_filter
 */

'use strict';

function normalizePattern(pattern) {
    return pattern.replace(/\*+(?:\?+\**)*/g, symbols => {
        let normalizedSymbols = '';
        for (let symbolIndex = symbols.indexOf('?'); symbolIndex !== -1; symbolIndex = symbols.indexOf('?', symbolIndex + 1)) {
            normalizedSymbols += '?';
        }

        return normalizedSymbols + '*';
    });
}

class NfaState {
    constructor(id, finish) {
        this.id = id;
        this.finish = finish;
        this.valve = null;
        this.target = null;
        this.otherTarget = null;
    }
}

class Nfa {
    constructor(finishs, extractPattern) {
        let stateCount = 0;
        let initialStates = [];
        for (let finishCount = finishs.length, finishIndex = 0; finishIndex < finishCount; ++finishIndex) {
            let finish = finishs[finishIndex];

            let pattern = extractPattern(finish);
            pattern = normalizePattern(pattern);

            stateCount += pattern.length + 1;
            let stateId = stateCount;

            let initialState = new NfaState(--stateId, finish);
            let otherInitialState = null;
            for (let symbolIndex = pattern.length - 1; symbolIndex >= 0; --symbolIndex) {
                let symbol = pattern[symbolIndex];

                let state = new NfaState(--stateId, null);
                if (symbol === '*') {
                    state.target = state;
                    state.otherTarget = initialState;
                    otherInitialState = initialState;
                } else {
                    if (symbol !== '?') {
                        state.valve = symbol;
                    }
                
                    state.target = initialState;
                    state.otherTarget = otherInitialState;
                    otherInitialState = null;
                }

                initialState = state;
            }

            initialStates.push(initialState);
            if (otherInitialState !== null) {
                initialStates.push(otherInitialState);
            }
        }

        this.stateCount = stateCount;
        this.initialStates = initialStates;
    }
}

class DfaState {
    constructor(nfaStates) {
        this.nfaStates = nfaStates;
        this.combinedFinish = null;
        this.transitions = Object.create(null);
    }

    exit(dfa) {
        let combinedFinish = this.combinedFinish;
        if (combinedFinish === null) {
            let nfaStates = this.nfaStates;
            
            let nfaStateSetBuffer = dfa.nfaStateSetBuffer, nfaStateSetSize = 0;
            for (let nfaStateCount = nfaStates.length, nfaStateIndex = 0; nfaStateIndex < nfaStateCount; ++nfaStateIndex) {
                let nfaState = nfaStates[nfaStateIndex];

                if (nfaState.finish !== null) {
                    nfaStateSetBuffer[nfaStateSetSize++] = nfaState;
                }
            }

            combinedFinish = this.combinedFinish = dfa.getCombinedFinish(nfaStateSetSize);
        }

        return combinedFinish;
    }

    step(dfa, symbol) {
        let transitions = this.transitions;

        let targetState = transitions[symbol];
        if (targetState === undefined) {
            let nfaStates = this.nfaStates;
           
            let nfaStateSetBuffer = dfa.nfaStateSetBuffer, nfaStateSetSize = 0;
            for (let nfaStateCount = nfaStates.length, nfaStateIndex = 0; nfaStateIndex < nfaStateCount; ++nfaStateIndex) {
                let nfaState = nfaStates[nfaStateIndex];

                let nfaStateValve = nfaState.valve;
                if (nfaStateValve === null || nfaStateValve === symbol) {
                    let nfaStateTarget = nfaState.target;
                    if (nfaStateTarget !== null) {
                        if (nfaStateSetSize < 2 || nfaStateSetBuffer[nfaStateSetSize - 2] !== nfaStateTarget) {
                            nfaStateSetBuffer[nfaStateSetSize++] = nfaStateTarget;
                        }
                        let nfaStateOtherTarget = nfaState.otherTarget;
                        if (nfaStateOtherTarget !== null) {
                            if (nfaStateSetSize < 1 || nfaStateSetBuffer[nfaStateSetSize - 1] !== nfaStateOtherTarget) {
                                nfaStateSetBuffer[nfaStateSetSize++] = nfaStateOtherTarget;
                            }
                        }
                    }
                }
            }

            targetState = transitions[symbol] = dfa.getState(nfaStateSetSize);
        }

        return targetState;
    }
}

class Dfa {
    constructor(finishs, extractPattern, combineFinishs) {
        let nfa = new Nfa(finishs, extractPattern);

        this.combineFinishs = combineFinishs;

        this.combinedFinishByKey = Object.create(null);
        this.stateByKey = Object.create(null);

        this.combinedFinishBySymbols = Object.create(null);

        this.nfaStateSetBuffer = new Array(nfa.stateCount);
        this.nfaStateSetKeyBuffer = new Buffer(nfa.stateCount << 2);

        for (let count = nfa.initialStates.length, index = 0; index < count; ++index) {
            this.nfaStateSetBuffer[index] = nfa.initialStates[index];
        }

        this.initialState = this.getState(nfa.initialStates.length);
    }

    getNfaStatesKey(stateCount) {
        let states = this.nfaStateSetBuffer;

        let statesKey = this.nfaStateSetKeyBuffer;
        for (let stateIndex = 0; stateIndex < stateCount; ++stateIndex) {
            statesKey.writeUInt32LE(states[stateIndex].id, stateIndex << 2, true);
        }

        return statesKey.toString('utf16le', 0, stateCount << 2);
    }

    getSortedNfaStateFinishs(stateCount) {
        let states = this.nfaStateSetBuffer;

        let stateFinishs = new Array(stateCount);
        for (let stateIndex = 0; stateIndex < stateCount; ++stateIndex) {
            stateFinishs[stateIndex] = states[stateIndex].finish;
        }

        return stateFinishs;
    }

    getCombinedFinish(nfaStateSetSize) {
        let combinedFinishByKey = this.combinedFinishByKey;

        let key = this.getNfaStatesKey(nfaStateSetSize);

        let combinedFinish = combinedFinishByKey[key];
        if (combinedFinish === undefined) {
            let nfaStateFinishs = this.getSortedNfaStateFinishs(nfaStateSetSize);
            combinedFinish = combinedFinishByKey[key] = this.combineFinishs(nfaStateFinishs);
        }

        return combinedFinish;
    }

    getSortedNfaStates(stateCount) {
        let states = this.nfaStateSetBuffer;
        return states.slice(0, stateCount);
    }

    getState(nfaStateSetSize) {
        let stateByKey = this.stateByKey;

        let key = this.getNfaStatesKey(nfaStateSetSize);

        let state = stateByKey[key];
        if (state === undefined) {
            let nfaStates = this.getSortedNfaStates(nfaStateSetSize);
            state = stateByKey[key] = new DfaState(nfaStates);
        }

        return state;
    }

    walk(symbols) {
        let combinedFinishBySymbols = this.combinedFinishBySymbols;

        let combinedFinish = combinedFinishBySymbols[symbols];
        if (combinedFinish === undefined) {
            let nfaStateSet = this.nfaStateSet;

            let state = this.initialState;
            for (let symbolCount = symbols.length, symbolIndex = 0; symbolIndex < symbolCount; ++symbolIndex) {
                let symbol = symbols[symbolIndex];
                state = state.step(this, symbol);
            }

            combinedFinish = combinedFinishBySymbols[symbols] = state.exit(this);
        }

        return combinedFinish;
    }
}

function filter(messages, rules) {
    let dfa = new Dfa(rules, (rule => rule.from || '*'), rules => {
        return new Dfa(rules, (rule => rule.to || '*'), rules => {
            return rules.map(rule => rule.action);
        });
    });

    for (let messageId in messages) {
        let message = messages[messageId];
        messages[messageId] = dfa.walk(message.from).walk(message.to);
    }

    return messages;
}

module.exports = filter.filter = filter;

