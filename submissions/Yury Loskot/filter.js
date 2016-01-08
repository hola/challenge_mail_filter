var symbolsHashes = getSymbolsHashes();

function getSymbolsHashes(){
  var symbols = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789_";
  var symbolsHashes = {};
  var hash = 1;
  for (var i = 0; i < symbols.length; i++){
    symbolsHashes[symbols[i]] = hash;
    hash *= 2;
  }
  return symbolsHashes;
}

function getStringHashes(messages, filters){
  var hashes = {};
  for (var i = 0; i < filters.length; i++){
    if (filters[i].from && !hashes[filters[i].from]){
      hashes[filters[i].from] = getStringHash(filters[i].from);
    }
    if (filters[i].to && !hashes[filters[i].to]){
      hashes[filters[i].to] = getStringHash(filters[i].to);
    }
  }
  var keys = Object.getOwnPropertyNames(messages);
  for (var i = 0; i < keys.length; i++){
    var key = keys[i];
    if (messages[key].from && !hashes[messages[key].from]){
      hashes[messages[key].from] = getStringHash(messages[key].from);
    }
    if (messages[key].to && !hashes[messages[key].to]){
      hashes[messages[key].to] = getStringHash(messages[key].to);
    }
  }
  return hashes;
}

function getStringHash(str){
  var result = 0;
  for (var i = 0; i < str.length; i++){
    var symbolHash = symbolsHashes[str[i]];
    if (symbolHash){
      result = result | symbolHash;
    }
  }
  return result;
}

exports.filter = function(messages, filters){
  var expressions = getExpressions(filters);
  var stringHashes = getStringHashes(messages, filters);
  var filterBuckets = getFilterBuckets(filters);
  var result = {};
  var keys = Object.getOwnPropertyNames(messages);
  for (var j = 0; j < keys.length; j++){
    var key = keys[j];
    result[key] = [];
    var bucket = filters; 
    if (messages[key].from && messages[key].to){
      bucket = filterBuckets[messages[key].from[0]][messages[key].to[0]];
    }
    for (var i = 0; i < bucket.length; i++){
      var match = true;
      if (bucket[i].from && bucket[i].from !== '*'){
        var templateHash = stringHashes[bucket[i].from];
        var strHash = stringHashes[messages[key].from];
        if ((templateHash & strHash) !== templateHash){
          match = false;
        } else {
          var regex = expressions[bucket[i].from];
          match = regex.test(messages[key].from);
        }
      }
      if (match && bucket[i].to && bucket[i].to !== '*'){
        templateHash = stringHashes[bucket[i].to];
        strHash = stringHashes[messages[key].to];
        if ((templateHash & strHash) !== templateHash){
          match = false;
        } else {
          regex = expressions[bucket[i].to];
          match = regex.test(messages[key].to);
        }
      }
      if (match){
        result[key].push(bucket[i].action);
      }
    }
  }
  return result;
};

function getExpressions(filters){
  var expressions = {};
  for (var i = 0; i < filters.length; i++){
    if (filters[i].from && !expressions[filters[i].from]){
      expressions[filters[i].from] = wildcardToRegExp(filters[i].from);
    }
    if (filters[i].to && !expressions[filters[i].to]){
      expressions[filters[i].to] = wildcardToRegExp(filters[i].to);
    }
  }
  return expressions;
}

function getFilterBuckets(filters){
  var buckets = {};
  for (var i = 0x20; i <= 0x7f; i++){
    buckets[String.fromCharCode(i)] = [];
  }
  function addToAll(filter){
    for (var i = 0x20; i <= 0x7f; i++){
      buckets[String.fromCharCode(i)].push(filter);
    }
  }
  for (i = 0; i < filters.length; i++){
    if (!filters[i].from || filters[i].from[0] === '*' || filters[i].from[0] === '?'){
      addToAll(filters[i]);
    } else{
      buckets[filters[i].from[0]].push(filters[i]);
    }
  }
  for (var i = 0x20; i <= 0x7f; i++){
    buckets[String.fromCharCode(i)] = getFilterBucketsTo(buckets[String.fromCharCode(i)]);
  }
  return buckets;
}

function getFilterBucketsTo(filters){
  var buckets = {};
  for (var i = 0x20; i <= 0x7f; i++){
    buckets[String.fromCharCode(i)] = [];
  }
  function addToAll(filter){
    for (var i = 0x20; i <= 0x7f; i++){
      buckets[String.fromCharCode(i)].push(filter);
    }
  }
  for (i = 0; i < filters.length; i++){
    if (!filters[i].to || filters[i].to[0] === '*' || filters[i].to[0] === '?'){
      addToAll(filters[i]);
    } else{
      buckets[filters[i].to[0]].push(filters[i]);
    }
  }
  return buckets;
}

function wildcardToRegExp(wildcard){
  return RegExp('^' + wildcard.replace(/\*/g, '.*').replace(/\?/g, '.{1}') + '$');
}