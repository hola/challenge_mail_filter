'use strict';
/*
 Постановка задачи

 Вы разрабатываете систему применения фильтров для почтовой системы.
 Вам нужно написать модуль для Node.js, экспортирующий одну функцию:

 filter(messages, rules)

 messages — это объект, ставящий в соответствие уникальным идентификаторам
 сообщений объекты с двумя свойствами: from и to. Каждый такой объект описывает одно электронное письмо.
 rules — это массив объектов с тремя свойствами: from (необязательно),
 to (необязательно) и action (обязательно). Каждый из этих объектов описывает одно правило фильтрования.

 Все строковые значения во входных данных непустые и содержат только символы ASCII
 в диапазоне от 0x20 до 0x7F включительно.

 Считается, что письмо удовлетворяет правилу фильтрования, если оба его свойства
 from и to удовлетворяют маскам, заданным в соответствующих свойствах правила.
 Маски регистрозависимые; символу * в маске удовлетворяет любое число (0 или более)
 любых символов, а символу ? — один любой символ. Если свойства from или to
 отсутствуют в правиле фильтрования, то в качестве значения по умолчанию используется *.
 Как следствие, если в правиле отсутствуют оба свойства from и to, то ему удовлетворяют все письма.

 К каждому письму необходимо применить все правила, которым оно удовлетворяет,
 в правильном порядке. Функция filter должна вернуть объект,
 ставящий в соответствие идентификаторам сообщений массивы действий.
 Для каждого письма такой массив должен содержать значения свойств action всех
 правил, которым это письмо удовлетворяет, в порядке перечисления правил в массиве rules.
 Если письмо не удовлетворяет ни одному из правил, пустой массив для этого
 письма всё равно должен присутствовать в результате.

 Пример

 Ниже приведён типичный пример корректного вызова функции filter:

 filter({
 msg1: {from: 'jack@example.com', to: 'jill@example.org'},
 msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
 msg3: {from: 'boss@work.com', to: 'jack@example.com'}
 }, [
 {from: '*@work.com', action: 'tag work'},
 {from: '*@spam.com', action: 'tag spam'},
 {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
 {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
 ])


 Правильная реализация filter в этом случае вернёт следующее:

 {
 msg1: ['folder jack', 'forward to jill@elsewhere.com'],
 msg2: ['tag spam', 'forward to jill@elsewhere.com'],
 msg3: ['tag work']
 }
 */

var TERMINATOR = String.fromCharCode(0x003),
    DELIMITER = String.fromCharCode(0x19);

exports.filter = function (mails, rules) {

    var index = {}, results = {};

    for (var i = 0; i < rules.length; i++) {
        index = put(index, buildPattern(rules[i]), rules[i].action, i);
    }

    var mailKeys = Object.keys(mails), id, matchedRule;
    for (i = 0; i < mailKeys.length; i++) {
        id = mailKeys[i];
        if (!results[id]) {
            results[id] = [];
        }
        matchedRule = get(index, prepareWord(buildMail(mails[id]))).filter(onlyUnique);
        matchedRule.sort(function (a, b) {
            return a.index - b.index;
        });
        for (var k = 0; k < matchedRule.length; k++) {
            results[id].push(matchedRule[k].value); // do not use concat
        }

    }
    return results;
};

function put(trie, name, value, index) {
    var node = trie,
        realName = (name + TERMINATOR).replace(/\*+/g, '*'),
        nameLength = realName.length,
        currentChar, starNode,
        nodeSet = false, kNode;

    for (var i = 0; i < nameLength; i++) {
        currentChar = realName[i];
        if (currentChar === '*' || currentChar === '?') {
            if (currentChar === '*') {
                if (!starNode) {
                    starNode = newNode('*', 0);
                } else {
                    delete starNode.max;
                }
            }
            if (currentChar === '?') {
                if (!starNode) {
                    starNode = newNode('*', 1, 1);
                } else {
                    starNode.min++;
                }
            }
        } else {
            if (starNode) {
                if (node.stars) {
                    for (var k = 0; k < node.stars.length; k++) {
                        kNode = node.stars[k];
                        if (kNode.min === starNode.min && kNode.max === starNode.max) {
                            node = kNode;
                            nodeSet = true;
                            break;
                        }
                    }
                } else {
                    node.stars = [];
                }
                if (!nodeSet) {
                    node.stars.push(starNode);
                    node = node.stars[node.stars.length - 1];
                }
                starNode = null;
                nodeSet = false;
            }

            var nodeAdded = false;
            if (node.stars && (currentChar !== '*' || currentChar !== '?')) {
                for (k = 0; k < node.stars.length; k++) {
                    kNode = node.stars[k];
                    if (isCaptureAll(kNode) && kNode[currentChar]) {
                        node = kNode[currentChar];
                        nodeAdded = true;
                        break;
                    }
                }
            }
            if (!nodeAdded) {
                if (!node[currentChar]) {
                    node[currentChar] = newNode(currentChar);
                    node = node[currentChar];
                } else {
                    node = node[currentChar];
                }
            }
        }
    }

    if (node.value) {
        node.value.push({
            value: value,
            index: index
        })
    } else {
        node.value = [{
            value: value,
            index: index
        }];
    }

    node.name = realName;
    return trie;
}


function get(node, name) {
    var nameLength = name.length, currentChar,
        results = [],
        child, newName, index, starNode, length, keys, oneIndex, indices;
    for (var i = 0; i < nameLength; i++) {
        currentChar = name[i];
        if (node.stars) {
            var indexOfDelimeter = indexOf(name, DELIMITER, i);
            if (indexOfDelimeter !== -1) {
                length = indexOfDelimeter;
            } else {
                length = nameLength;
            }
            for (var starsIndex = 0; starsIndex < node.stars.length; starsIndex++) {
                starNode = node.stars[starsIndex];
                keys = Object.keys(starNode);
                for (var childIndex = 0; childIndex < keys.length; childIndex++) {
                    child = keys[childIndex];
                    if (child === 'value' || child === 'min' || child === 'max') {
                        continue;
                    }
                    newName = null;
                    if (isCaptureAll(starNode)) {
                        indices = positionsInString(name, child, i);
                        for (oneIndex = indices.length - 1; oneIndex >= 0; oneIndex--) {
                            index = indices[oneIndex];
                            if (index > length) {
                                continue;
                            }
                            newName = substring(name, index + 1, nameLength);
                            addResultForSubstring(results, newName, starNode[child]);

                        }
                    } else if (starNode.min && !starNode.max) {
                        if (i + starNode.min <= length) {
                            indices = positionsInString(name, child, i);
                            for (oneIndex = indices.length - 1; oneIndex >= 0; oneIndex--) {
                                index = indices[oneIndex];
                                if (index < starNode.min) {
                                    continue;
                                }
                                newName = substring(name, index + 1, nameLength);
                                addResultForSubstring(results, newName, starNode[child]);
                            }
                        }
                    } else if (starNode.min && starNode.max) {
                        if (name[i + starNode.min] === child) {
                            newName = substring(name, i + starNode.min + 1, nameLength);
                            addResultForSubstring(results, newName, starNode[child]);
                        }
                    }
                }
            }
        }
        if (node[currentChar]) {
            if (node[currentChar].value) {
                addToResult(results, node[currentChar].value);
            }
            else {
                node = node[currentChar];
            }
        } else {
            return results;
        }
    }
    return results;
}
function addResultForSubstring(results, newName, node) {
    if (!newName.length) {
        addToResult(results, node.value);
    }
    else {
        addToResult(results, get(node, newName));
    }
}

function addToResult(results, newResults) {
    for (var i = 0; i < newResults.length; i++) {
        results.push(newResults[i]);
    }
}

function onlyUnique(value, index, self) {
    return resultsIndexOf(self, value) === index;
}

function resultsIndexOf(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].index === obj.index && arr[i].value === obj.value) {
            return i;
        }
    }
    return -1;
}

function indexOf(str, char, offset) {
    offset = offset || 0;
    var code = char.charCodeAt(0);
    for (var i = offset; i < str.length; i++) {
        if (str.charCodeAt(i) === code) {
            return i;
        }
    }
    return -1;
}

function newNode(key, min, max) {
    var node = {
        value: undefined,
        min: undefined,
        max: undefined
    };
    if (key === '*' || key === '?') {
        node.min = min || 0;
        node.max = max || 0;
    }
    return node;
}

function isCaptureAll(node) {
    return !node.min && !node.max;
}

function buildMail(mail) {
    return [mail.from || '', mail.to || ''].join(DELIMITER);
}

function buildPattern(rule) {
    return [rule.from || '*', rule.to || '*'].join(DELIMITER);
}

function prepareWord(word) {
    if (substring(word, word.length - 1, word.length) !== TERMINATOR) {
        return word + TERMINATOR;
    }
    return word;
}

function positionsInString(str, char, offset) {
    var indices = [], code = char.charCodeAt(0);
    for (var i = offset; i < str.length; i++) {
        if (str.charCodeAt(i) === code) {
            indices.push(i);
        }
    }
    return indices;
}

function substring(str, from, to) {
    return str.slice(from, to);
}