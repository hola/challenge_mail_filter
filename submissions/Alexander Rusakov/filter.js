var REGEXP = new RegExp('([\?\*]+)|([^\?\*]+)', 'g');
var REGEXP_QMARK = new RegExp('\\?', 'g');
// ^ $ + | () {} [] \ .
var REGEXP_SANITAZE = new RegExp('[\\^\\$\\+\\|\\(\\)\\{\\}\\[\\]\\\\\\.]', 'g');

function createRegExp(str) {
  return new RegExp('^' + str + '$', '');
}

function sanitaze(str) {
  return str.replace(REGEXP_SANITAZE, '\\$&');
}

function isSpecialPattern(str) {
  var charCode = str.charCodeAt(0);
  return charCode === 42 || charCode === 63;
}

function strCount(str) {
  var matches = str.match(REGEXP_QMARK);
  return matches ? matches.length : 0;
}

function createSingleRule(pattern) {
  if (isSpecialPattern(pattern)) { // * or ?
    var qCount = strCount(pattern);
    if (qCount) {
      return {
        data: qCount,
        type: qCount === pattern.length ? 1 : 2
      };
    }
    return null;
  }
  return {
    data: pattern,
    type: 3
  };
}

function createDoubleRule(pLeft, pRight) {
  var qCount, pattern, str, baseType;
  if (isSpecialPattern(pLeft)) {
    baseType = 8; // ends with
    pattern = pLeft;
    str = pRight;
  } else {
    baseType = 6; // starts with
    pattern = pRight;
    str = pLeft;
  }
  qCount = strCount(pattern);
  return {
    data: {
      len: str.length + qCount,
      val: str
    },
    type: qCount === pattern.length ? baseType : baseType + 1
  };
}

function createBigRule(patterns, lenAll) {
  var regStr = '';
  var minLen = 0;
  var specialIndex = isSpecialPattern(patterns[0]) ? 0 : 1;
  for (var i = 0, pattern, qCount; i < patterns.length; ++i) {
    pattern = patterns[i];
    if (i % 2 === specialIndex) {
      qCount = strCount(pattern);
      if (qCount) {
        minLen += qCount;
        regStr += '.{' + qCount + (qCount === pattern.length ? '' : ',') + '}';
      } else {
        regStr += '.*';
      }
    } else {
      minLen += pattern.length;
      regStr += sanitaze(pattern);
    }
  }
  return {
    data: {
      len: minLen,
      val: createRegExp(regStr)
    },
    type: minLen === lenAll ? 4 : 5
  };
}

function createRule(pattern) {
  // todo add regexp cache Map string -> RegExp
  var matches = pattern.match(REGEXP);
  switch (matches.length) {
  case 1:
    return createSingleRule(matches[0]);
  case 2:
    return createDoubleRule(matches[0], matches[1]);
  default:
    return createBigRule(matches, pattern.length);
  }
}

function prepareFilter(filter) {
  return {
    action: filter.action,
    from: filter.from ? createRule(filter.from) || 0 : 0,
    to: filter.to ? createRule(filter.to) || 0 : 0
  };
}

/*
Rule === null - any string
Rule.type:
1 - length
2 - min length
3 - string equal
4 - regexp + length
5 - regexp + min length
6 - starts with + length
7 - starts with + min length
8 - ends with + length
9 - ends with + min length
 */

function applyRule(rule, str) {
  switch (rule.type) {
  case 1:
    return rule.data === str.length;
  case 2:
    return rule.data <= str.length;
  case 3:
    return rule.data === str;
  case 4:
    return rule.data.len === str.length && rule.data.val.test(str);
  case 5:
    return rule.data.len <= str.length && rule.data.val.test(str);
  case 6:
    return rule.data.len === str.length && startsWith(str, rule.data.val);
  case 7:
    return rule.data.len <= str.length && startsWith(str, rule.data.val);
  case 8:
    return rule.data.len === str.length && endsWith(str, rule.data.val);
  case 9:
    return rule.data.len <= str.length && endsWith(str, rule.data.val);
  }
}

function startsWith(str, pattern) {
  var i = pattern.length;
  while (i--) {
    if (str.charCodeAt(i) !== pattern.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

function endsWith(str, pattern) {
  var i = pattern.length;
  var j = str.length;
  while (i--) {
    if (str.charCodeAt(--j) !== pattern.charCodeAt(i)) {
      return false;
    }
  }
  return true;
}

function applyFilters(msg, filters) {
  var result = [];
  for (var j = 0, f; j < filters.length; ++j) {
    f = filters[j];
    if (
      (!f.from || applyRule(f.from, msg.from)) &&
       (!f.to || applyRule(f.to, msg.to))
     ) {
      result.push(f.action);
    }
  }
  return result;
}

function filter(msgsObj, filters) {
  var i, key;

  var filtersOk = new Array(filters.length);
  for (i = 0; i < filters.length; ++i) {
    filtersOk[i] = prepareFilter(filters[i]);
  }

  var keys = Object.keys(msgsObj);
  for (i = 0; i < keys.length; ++i) {
    key = keys[i];
    msgsObj[key] = applyFilters(msgsObj[key], filtersOk);
  }
  return msgsObj;
}

module.exports = filter;
