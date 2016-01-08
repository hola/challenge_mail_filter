'use strict';


//var BUFFER_SIZE = Math.ceil(1000000 / 2) * 2; // должен быть кратен 2 размеру одного блока
var BUFFER_SIZE = Math.ceil(1000 / 2) * 2; // должен быть кратен 2 размеру одного блока
var BUFFER_BOXSIZE = 10000;


function filter(messages, rules) {
    // входящие значения не проверяем по условию задачи

    var i;
    var j;
    var k;
    var mask;
    var elementIndex;
    var word;
    var ruleParsed;


    ////////////////////////////////////////////////////////////////////////////////
    // Подготовка сообщений

    var msgKeys = Object.keys(messages);
    var msgKey;
    var msg;
    var adrFromText;
    var adrToText;
    var adrKeys = Object.create(null);

    var adrList = new Array(msgKeys.length * 2);
    var wordsIndicesInAdrCache = new Array(msgKeys.length * 2);
    var addrOwners = new Array(msgKeys.length * 2);

    var jAddr;

    j = 0;
    for (i = 0; i < msgKeys.length; i++) {
        msgKey = msgKeys[i];
        msg = messages[msgKey];
        adrFromText = msg.from;
        adrToText = msg.to;

        //adrKeys[adrFromText] !== undefined || (adrList[j++] = adrFromText,  adrKeys[adrFromText] = true);
        //adrKeys[adrToText] !== undefined || (adrList[j++] = adrToText,  adrKeys[adrToText] = true);

        if ((jAddr = adrKeys[adrFromText]) === undefined) {
            adrList[j] = adrFromText;
            adrKeys[adrFromText] = j;
            addrOwners[j] = 0;
            //wordsIndicesInAdrCache[j++] = [];
            wordsIndicesInAdrCache[j++] = 0;
        } else {
            addrOwners[jAddr] = addrOwners[jAddr] === 0 ? 0 : 2;
        }

        if ((jAddr = adrKeys[adrToText]) === undefined) {
            adrList[j] = adrToText;
            adrKeys[adrToText] = j;
            addrOwners[j] = 1;
            //wordsIndicesInAdrCache[j++] = [];
            wordsIndicesInAdrCache[j++] = 0;
        } else {
            addrOwners[jAddr] = addrOwners[jAddr] === 1 ? 1 : 2;
        }
    }

    adrList.length = j;
    addrOwners.length = j;
    wordsIndicesInAdrCache.length = j;

    // Весь текст из уникальных адресов в котором будем искать слова
    var adrText = adrList.join('\n');



    ////////////////////////////////////////////////////////////////////////////////
    // Подготовка правил
    var rule;
    var size16bit = Math.ceil(rules.length / 16);

    // Количество уникальных правил (отдельно для from, отдельно для to)
    var jFrom = 0;
    var jTo = 0;

    // По тексту правила хранит объект ruleIndices
    var ruleIndicesCache = Object.create(null);

    // Хранит ссылку на распарсенное правило и индексы (отдельно для from и to), когда первый раз всретилось правило
    // Объект {indexFrom, indexTo, ruleParsed}
    var ruleIndices;

    // Распарсенное правило
    var ruleParsed;

    // Хранит соответствующий объект ruleData {maskBox, ruleParsed}
    // Маска размерности rules.length, определяющая позицию правила и ссылка на распарсенное правило, индекс задается в момоент, когда первый раз всретилось правило
    var ruleFromDataList = new Array(rules.length);
    var ruleToDataList = new Array(rules.length);

    // Объект Uint16Array, хранящий маску определяющую позицию правила для индекса
    var maskBoxFrom;
    var maskBoxTo;

    // Текст правила
    var ruleFromText;
    var ruleToText;


    var wordsHache = Object.create(null);
    var wordsEscHache = Object.create(null);
    var wordsList = []; // не знаем размер, после заполнения пересоздадим
    var wordsOwners = []; // не знаем размер, после заполнения пересоздадим


    for (j = 0; j < rules.length; j++) {
        rule = rules[j];
        ruleFromText = rule.from || '*';
        ruleToText = rule.to || '*';

        mask = 1 << j % 16;
        elementIndex = Math.floor(j / 16);


        // from
        if ((ruleIndices = ruleIndicesCache[ruleFromText]) === undefined) {
            ruleIndicesCache[ruleFromText] = {
                indexFrom: jFrom,
                indexTo: -1,
                ruleParsed: (ruleParsed = parseRule(ruleFromText, wordsList, wordsHache, wordsEscHache, wordsOwners, 0))
            };
            ruleFromDataList[jFrom++] = {
                maskBox: (maskBoxFrom = new Uint16Array(size16bit)),
                ruleParsed: ruleParsed
            };

        } else {
            if (ruleIndices.indexFrom === -1) {
                ruleIndices.indexFrom = jFrom;
                ruleFromDataList[jFrom++] = {
                    maskBox: new Uint16Array(size16bit),
                    ruleParsed: ruleIndices.ruleParsed
                };

                ruleParsed = ruleIndices.ruleParsed;
                for (i = 0; i < ruleParsed.length; i++) {
                    wordIndex = ruleParsed[i];
                    if (wordIndex !== -1 && wordIndex !== -2) {
                        wordsOwners[wordIndex] = wordsHache[wordIndex] === 0 ? 0 : 2;
                    }
                }
            }
            maskBoxFrom = ruleFromDataList[ruleIndices.indexFrom].maskBox;
        }
        maskBoxFrom[elementIndex] = maskBoxFrom[elementIndex] | mask;


        // to
        if ((ruleIndices = ruleIndicesCache[ruleToText]) === undefined) {
            ruleIndicesCache[ruleToText] = {
                indexFrom: -1,
                indexTo: jTo,
                ruleParsed: (ruleParsed = parseRule(ruleToText, wordsList, wordsHache, wordsEscHache, wordsOwners, 1))
            };
            ruleToDataList[jTo++] = {
                maskBox: (maskBoxTo = new Uint16Array(size16bit)),
                ruleParsed: ruleParsed
            };

        } else {
            if (ruleIndices.indexTo === -1) {
                ruleIndices.indexTo = jTo;
                ruleToDataList[jTo++] = {
                    maskBox: new Uint16Array(size16bit),
                    ruleParsed: ruleIndices.ruleParsed
                };

                ruleParsed = ruleIndices.ruleParsed;
                for (i = 0; i < ruleParsed.length; i++) {
                    wordIndex = ruleParsed[i];
                    if (wordIndex !== -1 && wordIndex !== -2) {
                        wordsOwners[wordIndex] = wordsOwners[wordIndex] === 1 ? 1 : 2;
                    }
                }

            }
            maskBoxTo = ruleToDataList[ruleIndices.indexTo].maskBox;
        }
        maskBoxTo[elementIndex] = maskBoxTo[elementIndex] | mask;

    }
    ruleFromDataList.length = jFrom;
    ruleToDataList.length = jTo;





    ////////////////////////////////////////////////////////////////////////////////
    // Подготовка слов
    var wordsEscList = Object.keys(wordsEscHache);

    // Пересоздадим wordsList
    var wordsListOld = wordsList;
    wordsList = new Array(wordsListOld.length);
    for (i = 0; i < wordsListOld.length; i++) {
        wordsList[i] = wordsListOld[i];
    }

    // Пересоздадим wordsOwners
    var wordsOwnersOld = wordsOwners;
    wordsOwners = new Uint8Array(wordsOwners.length);
    for (i = 0; i < wordsOwnersOld.length; i++) {
        wordsOwners[i] = wordsOwnersOld[i];
    }



    // Определение вхождений более коротких в более длинные
    wordsListOld.sort();
    var inWords = new Array(wordsListOld.length);
    var lowWord;
    var highWord;
    var wordIndexLow;
    var wordIndexHight;
    for (i = 0; i < wordsListOld.length - 1; i++) {
        lowWord = wordsListOld[i];
        wordIndexLow = wordsHache[lowWord];
        for (j = i + 1; j < wordsListOld.length; j++) {
            highWord = wordsListOld[j];
            if (highWord.length > lowWord.length && highWord.startsWith(lowWord)) {
                wordIndexHight = wordsHache[highWord];
                (inWords[wordIndexHight] || (inWords[wordIndexHight] = [])).push(wordIndexLow);
            } else {
                break;
            }
        }
    }



    ////////////////////////////////////////////////////////////////////////////////
    // Определение позиций слов правил в адресах сообщений
    // Правила состоящие из уникальных слов с экранированием спецсимволов
    wordsEscList.sort();
    wordsEscList.reverse();
    var wordEscText = '\n|' + wordsEscList.join('|');
    var wordEscReg = new RegExp(wordEscText, 'g');


    var findWord;
    var wordIndex;
    var positionsWordInAdr;
    var wordOwner;

    var adrOwner = addrOwners[0];
    //var wordsIndicesInAdrCache[0];
    var startRow = 0;
    var adrIndex = 0;

    //console.log('adr ' + adrList.length);
    //console.log('words ' + wordsList.length);

    // Микро менеджер памяти
    // x - значение кода слова
    // x - значение позиции
    // x - ...
    var memBuffer;
    var memBufferBox = new Array(BUFFER_BOXSIZE);

    var memBufferAddr = 0;
    var memBufferBoxIndex = 0;
    var memBufferPosition = 0;

    var wordsIndicesInAdr = wordsIndicesInAdrCache[0];
    var memBufferAdr = 0;

    mask = 1 << j % 16;
    elementIndex = Math.floor(j / 16);

    var lowWords;


    while ((findWord = wordEscReg.exec(adrText)) !== null) {
        wordEscReg.lastIndex = findWord.index + 1;
        word = findWord[0];
        if (word === '\n') {
            // каждый раз при нахождении \n переходим на поиск в следующем адресе
            adrIndex++;

            wordsIndicesInAdrCache[adrIndex] = memBufferAdr;

            adrOwner = addrOwners[adrIndex];
            startRow = findWord.index + 1;

        } else {
            wordIndex = wordsHache[word];
            wordOwner = wordsOwners[wordIndex];
            if (adrOwner + wordOwner !== 1) {

                memBufferBoxIndex = Math.floor(memBufferAdr / BUFFER_SIZE);
                memBufferPosition = memBufferAdr % BUFFER_SIZE;
                memBuffer = memBufferBox[memBufferBoxIndex] || (memBufferBox[memBufferBoxIndex] = new Uint32Array(BUFFER_SIZE));
                memBuffer[memBufferPosition] = wordIndex;
                memBuffer[memBufferPosition + 1] = findWord.index - startRow;
                memBufferAdr += 2;
            }

            if ((lowWords = inWords[wordIndex]) !== undefined) {
                for (i = 0; i < lowWords.length; i++) {
                    wordIndex = lowWords[i];
                    wordOwner = wordsOwners[wordIndex];
                    if (adrOwner + wordOwner !== 1) {

                        memBufferBoxIndex = Math.floor(memBufferAdr / BUFFER_SIZE);
                        memBufferPosition = memBufferAdr % BUFFER_SIZE;
                        memBuffer = memBufferBox[memBufferBoxIndex] || (memBufferBox[memBufferBoxIndex] = new Uint32Array(BUFFER_SIZE));
                        memBuffer[memBufferPosition] = wordIndex;
                        memBuffer[memBufferPosition + 1] = findWord.index - startRow;
                        memBufferAdr += 2;
                    }
                }
            }

        }
    }

    wordsIndicesInAdrCache[++adrIndex] = memBufferAdr;
    //console.log('bufersize = ' + (memBufferBoxIndex + 1));


    ////////////////////////////////////////////////////////////////////////////////
    // Применение правил к сообщениям

    var markerRuleFromCache = Object.create(null);
    var markerRuleToCache = Object.create(null);
    var markerBoxRuleFrom;
    var markerBoxRuleTo;

    var adrFromIndex;
    var adrToIndex;
    var ruleFromData;
    var ruleToData;

    var memBufferNext;

    var results = {};
    var result;

    for (i = 0; i < msgKeys.length; i++) {
        msgKey = msgKeys[i];

        msg = messages[msgKey];
        adrFromText = msg.from;
        adrToText = msg.to;
        adrFromIndex = adrKeys[adrFromText];
        adrToIndex = adrKeys[adrToText];

        markerBoxRuleFrom = markerRuleFromCache[adrFromIndex];
        if (markerBoxRuleFrom === undefined) {
            markerBoxRuleFrom = markerRuleFromCache[adrFromIndex] = new Uint16Array(size16bit);

            for (j = 0; j < jFrom; j++) {

                ruleFromData = ruleFromDataList[j];

                memBufferAdr = wordsIndicesInAdrCache[adrFromIndex];
                memBufferNext = wordsIndicesInAdrCache[adrFromIndex + 1];

                if (test(adrFromText.length, 0, memBufferBox, memBufferAdr, memBufferNext, ruleFromData.ruleParsed, 0, wordsList)) {
                    for (k = 0; k < size16bit; k++) {
                        markerBoxRuleFrom[k] = markerBoxRuleFrom[k] | ruleFromData.maskBox[k];
                    }
                }
            }
        }



        markerBoxRuleTo = markerRuleToCache[adrToIndex];
        if (markerBoxRuleTo === undefined) {
            markerBoxRuleTo = markerRuleToCache[adrToIndex] = new Uint16Array(size16bit);

            for (j = 0; j < jTo; j++) {

                ruleToData = ruleToDataList[j];

                memBufferAdr = wordsIndicesInAdrCache[adrToIndex];
                memBufferNext = wordsIndicesInAdrCache[adrToIndex + 1];

                if (test(adrToText.length, 0, memBufferBox, memBufferAdr, memBufferNext, ruleToData.ruleParsed, 0, wordsList)) {
                    for (k = 0; k < size16bit; k++) {
                        markerBoxRuleTo[k] = markerBoxRuleTo[k] | ruleToData.maskBox[k];
                    }

                }
            }
        }



        result = results[msgKey] = [];

        for (j = 0; j < rules.length; j++) {
            mask = 1 << j % 16;
            elementIndex = Math.floor(j / 16);
            if ((mask & markerBoxRuleFrom[elementIndex] & markerBoxRuleTo[elementIndex]) !== 0) {
                result.push(rules[j].action);
            }

        }

    }

    return results;

}

function parseRule(ruleText, wordsList, wordsHache, wordsEscHache, wordsOwners, owner) {

    var ruleParsed = [];
    //var ruleTextNorm = '';
    var sym;
    var isSpec = false;
    var isWord = false;
    var wasWord = false;
    var isStar = false;
    var word = '';
    var wordEsc = '';
    var slash = '';
    var j;
    var jWord;

    for (j = 0; j < ruleText.length; j++) {
        sym = ruleText[j];
        slash = '';
        switch (sym) {
            case '*':
                if (isWord) {
                    if ((jWord = wordsHache[word]) === undefined) {
                        wordsList.push(word);
                        wordsOwners.push(owner);
                        jWord = wordsHache[word] = wordsList.length - 1;
                        wordsEscHache[wordEsc] = true;
                    } else {
                        wordsOwners[jWord] = wordsOwners[jWord] === owner ? owner : 2;
                    }
                    ruleParsed.push(jWord);

                    //ruleTextNorm += word;
                    word = '';
                    wordEsc = '';
                    isWord = false;
                }
                isStar = true;
                break;
            case '?':
                if (isWord) {
                    if ((jWord = wordsHache[word]) === undefined) {
                        wordsList.push(word);
                        wordsOwners.push(owner);
                        jWord = wordsHache[word] = wordsList.length - 1;
                        wordsEscHache[wordEsc] = true;
                    } else {
                        wordsOwners[jWord] = wordsOwners[jWord] === owner ? owner : 2;
                    }
                    ruleParsed.push(jWord);
                    //ruleTextNorm += word;
                    word = '';
                    wordEsc = '';
                    isWord = false;
                }
                ruleParsed.push(sym === '*' ? -1 : -2);
                //ruleTextNorm += sym;
                break;
            case '|':
            case '\\':
            case '^':
            case '$':
            case '+':
            case '.':
            case '(':
            case ')':
            case '{':
            case '}':
            case '[':
            case ']':
                slash = '\\';
            default :
                if (isStar) {
                    ruleParsed.push(-1);
                    //ruleTextNorm += '*';
                    isStar = false;
                }
                isWord = wasWord = true;
                word += sym;
                wordEsc += slash + sym;
        }
    }
    if (isStar) {
        ruleParsed.push(-1);
        //ruleTextNorm += '*';
    }
    if (isWord) {
        if ((jWord = wordsHache[word]) === undefined) {
            wordsList.push(word);
            wordsOwners.push(owner);
            jWord = wordsHache[word] = wordsList.length - 1;
            wordsEscHache[wordEsc] = true;
        } else {
            wordsOwners[jWord] = wordsOwners[jWord] === owner ? owner : 2;
        }
        ruleParsed.push(jWord);
        //ruleTextNorm += word;
    }

    return ruleParsed;
}


function test(adrLen, adrPosition, memBufferBox, memBufferAdr, memBufferNext, ruleParsed, ruleInd, wordsList) {


    var memBufferBoxIndex;
    var memBufferPosition;
    var memBuffer;
    var memAdr;

    var i;
    var result;
    var wordLen;
    var wordIndex;
    var srchWordIndex;
    var srch = false;
    var srchAdrPosition;
    var word;

    for (i = ruleInd; i < ruleParsed.length; i++) {

        wordIndex = ruleParsed[i];


        switch (wordIndex) {
            case -1: //'*':
                srch = true;
                break;
            case -2: //'?':
                adrPosition++;
                break;
            default :

                wordLen = wordsList[wordIndex].length;

                if (srch) {

                    for (memAdr = memBufferAdr; memAdr < memBufferNext; memAdr += 2) {

                        memBufferBoxIndex = Math.floor(memAdr / BUFFER_SIZE);
                        memBufferPosition = memAdr % BUFFER_SIZE;
                        memBuffer = memBufferBox[memBufferBoxIndex];

                        srchWordIndex = memBuffer[memBufferPosition];
                        srchAdrPosition = memBuffer[memBufferPosition + 1];

                        if (srchWordIndex === wordIndex && srchAdrPosition >= adrPosition) {
                            result = test(adrLen, srchAdrPosition + wordLen, memBufferBox, memAdr + 2, memBufferNext, ruleParsed, i + 1, wordsList);
                            if (result) {
                                return result;
                            }
                        }
                    }

                    return false;

                } else {

                    for (memAdr = memBufferAdr; memAdr < memBufferNext; memAdr += 2) {

                        memBufferBoxIndex = Math.floor(memAdr / BUFFER_SIZE);
                        memBufferPosition = memAdr % BUFFER_SIZE;
                        memBuffer = memBufferBox[memBufferBoxIndex];

                        srchWordIndex = memBuffer[memBufferPosition];
                        srchAdrPosition = memBuffer[memBufferPosition + 1];

                        if (srchWordIndex === wordIndex && srchAdrPosition === adrPosition) {
                            result = test(adrLen, srchAdrPosition + wordLen, memBufferBox, memAdr + 2, memBufferNext, ruleParsed, i + 1, wordsList);
                            return result;
                        }
                        if (srchAdrPosition > adrPosition) {
                            return false;
                        }
                    }

                    return false;

                }
        }
    }

    return srch ? adrLen >= adrPosition : adrLen === adrPosition;
}



exports.filter = filter;
