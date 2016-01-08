module.exports = function filter(messages, rules) {
  var result = {};
  var msgId, rule;

  var wildcards = {};

  function acceptByFilter(rule, msgFrom, msgTo) {
    return acceptByWildcard(msgFrom, rule.from) &&
      acceptByWildcard(msgTo, rule.to);
  }

  function acceptByWildcard(email, mask) {
    var wildcard;

    if(!mask) {
      return true;
    } else {
      wildcard =
        wildcards[mask] || (wildcards[mask] = new Wildcard(mask));

      return wildcard.accept(email);
    }
  }

  for(msgId in messages) {
    var msg = messages[msgId];
    var msgActions = result[msgId] = [];
    var msgFrom = msg.from;
    var msgTo = msg.to;

    for(var idx in rules) {
      var rule = rules[idx];

      if(acceptByFilter(rule, msgFrom, msgTo)) {
        msgActions.push(rule.action);
      }
    }
  }

  return result;
};

// --- Wildcard partition
//
var Partition = function Partition(mask) {
  var skips = calculateSkips(mask);
  this.mask = mask.substr(skips.maskIdx);
  this.unbound = skips.unbound;
  this.min = skips.min;
  this.length = skips.maskIdx + this.mask.length;
};

Partition.prototype.accept = function(string) {
  var idx = string.indexOf(this.mask);

  if(this.mask === "") {
    if(this.unbound) {
      return true;
    } else {
      return string.length === this.min;
    }
  } else {
    if(this.unbound) {
      return findIndices(string, this.mask, this.min);
    } else {
      return idx == this.min;
    }
  }
};

var findIndices = function(string, mask, fromPos) {
  var result = [];
  var pos = 0, len = mask.length;

  fromPos || (fromPos = 0);

  while(pos > -1) {
    pos = string.indexOf(mask, fromPos);
    if(pos > -1) {
      fromPos = pos + 1;
      result.push(pos + len);
    }
  }

  return (result.length > 0) ? result : false;
}

var calculateSkips = function(mask) {
  var unbound = false;
  var min = 0;
  var maskIdx = -1;

  for(var idx = 0; idx < mask.length && maskIdx < 0; ++idx) {
    switch(mask.substr(idx, 1)) {
      case "*": unbound = true; break;
      case "?": min += 1; break;
      default: maskIdx = idx;
    }
  }

  if(maskIdx == -1) {
    maskIdx = mask.length;
  }

  return {unbound: unbound, min: min, maskIdx: maskIdx};
}

// --- Wildcard
//
var Wildcard = function(mask) {
  this.partitions = scanIntoPartitions(mask);
};

Wildcard.prototype.accept = function(string) {
  return acceptFromPosition(string, 0, this.partitions);
};

var acceptFromPosition = function(tail, partIdx, partitions) {
  var partition, pos, res;

  if(partIdx >= partitions.length) {
    return true;
  }

  partition = partitions[partIdx];

  res = partition.accept(tail);

  if(!res) {
    return false;
  } else {
    if(partIdx == partitions.length - 1) {
      return true;
    }

    if(!partition.unbound) {
      pos = partition.length;
      return acceptFromPosition(
        tail.substr(pos), partIdx + 1, partitions);
    } else {
      for(var idx in res) {
        pos = res[idx];
        if(acceptFromPosition(
          tail.substr(pos), partIdx + 1, partitions)) {
          return true;
        }
      }

      return false;
    }
  }
};

var scanIntoPartitions = function(mask) {
  var result = [];
  var tail = mask, piece = "";
  var qIdx, aIdx, pos;

  while(tail !== "") {
    qIdx = tail.indexOf("?");
    aIdx = tail.indexOf("*");

    if((aIdx > 0 || qIdx > 0) && (aIdx != 0 && qIdx != 0)) {
      if(aIdx > -1 && (aIdx < qIdx || qIdx == -1)) {
        pos = aIdx;
      } else if(qIdx > -1 && (qIdx <= aIdx || aIdx == -1)) {
        pos = qIdx;
      }

      result.push(new Partition(piece + tail.substr(0, pos)));
      piece = "";
      tail = tail.substr(pos);
    } else {
      piece += tail.substr(0, 1);
      tail = tail.substr(1);
    }
  }

  if(piece !== "") {
    result.push(new Partition(piece));
  }

  return result;
};
