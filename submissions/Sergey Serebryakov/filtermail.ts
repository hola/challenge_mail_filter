var findFirstIndex = function(haystack: string, needle: string): number {
  return haystack.indexOf(needle);
}

var contains = function(s: string, c: string) {
  return findFirstIndex(s, c) != -1;
}

// var reverse = function(s: string): string {
//   var o = "";
//   for (var i = s.length - 1; i >= 0; i--) o += s[i];
//   return o;
// }

var normalizePattern = function(s: string): string {
  var o = [];
  for (var i = 0; i < s.length; i++) {
    if (s[i] != '*' || s[i] == '*' && (i == 0 || i > 0 && s[i-1] != '*')) {
      o.push(s[i]);
    }
  }
  return o.join('');
}

var containsChar = function(s: string, c: string): boolean {
  for (var i = 0; i < s.length; i++) {
    if (s[i] == c) return true;
  }
  return false;
}

var matchUntil = function(s: string, p: string, maxlen: number): number {
  var matchedCount = 0;
  for (var i = 0; i < maxlen; i++) {
    if (s[i] != p[i] && p[i] != '?') return matchedCount;
    matchedCount++;
  }
  return matchedCount;
}

var matchUntilBack = function(s: string, p: string, n: number, m: number, maxlen: number): number {
  var matchedCount = 0;
  for (var i = 0; i < maxlen; i++) {
    if (s[n-i-1] != p[m-i-1] && p[m-i-1] != '?') return matchedCount;
    matchedCount++;
  }
  return matchedCount;
}

var quadMatch = function(s: string, p: string, n: number, m: number): boolean {
  console.log("Quad called", s, p);

  var dp1: boolean[] = [];
  var dp2: boolean[] = [];
  for (var j = 0; j <= m; j++) {
    dp1.push(false);
    dp2.push(false);
  }
  dp1[0] = true;

  for (var i = 1; i <= n; i++) {
    for (var j = 1; j <= m; j++) {
      if (p[j] == '*') {
        dp2[j] = dp2[j-1] || dp1[j];
      } else if (p[j] == '?') {
        dp2[j] = dp1[j-1];
      } else {
        dp2[j] = dp1[j-1] && s[i-1] == p[j-1];
      }
    }
    dp1 = dp2;
  }
  return dp2[m];
}

var matches = function(s: string, p: string, hasStar: boolean): boolean {
  var n = s.length;
  var m = p.length;

  if (hasStar) {
    var p1: number = matchUntil(s, p, n);
    if (p[p1] != '*') return false;
    if (p1 > 0) return matches(s.substring(p1, n), p.substring(p1, m), hasStar);

    var p2: number = matchUntilBack(s, p, n, m, n);
    if (p[m-p2-1] != '*') return false;
    if (p2 > 0) return matches(s.substr(0, n-p2), p.substr(0, m-p2), hasStar);

    if (p == "*") return true;

    // var pieces: string[] = p.split("*");
    // var pn = pieces.length;

    /*
      in *ab*, if str contains only one ab, then match
      if contains zero ab, not match
      repeat until ambiguity
      same from the end
      pattern is now *cd*ef*gh*, str is ..cd..gh..cd..gh..
      quadratic match
    */
    return quadMatch(s, p, n, m);
  } else {
    return n == m && matchUntil(s, p, n) == n;
  }
}

var filter = function(messages: any, rules: any) {
  var rulesCount = rules.length;
  for (var i = 0; i < rulesCount; i++) {
    var rule = rules[i];

    if ("from" in rule) {
      if (contains(rule.from, '*')) {
        rule.fromstar = true;
        if (contains(rule.from, '**')) rule.from = normalizePattern(rule.from);
      } else {
        rule.fromstar = false;
      }
    }

    if ("to" in rule) {
      if (contains(rule.to, '*')) {
        rule.tostar = true;
        if (contains(rule.to, '**')) rule.to = normalizePattern(rule.to);
      } else {
        rule.tostar = false;
      }
    }
  }

  var actions = {};

  for (var messageId in messages) {
    var message = messages[messageId];

    var result_actions = [];

    for (var i = 0; i < rulesCount; i++) {
      var rule = rules[i];

      if (!("from" in rule) || matches(message.from, rule.from, rule.fromstar)) {
        if (!("to" in rule) || matches(message.to, rule.to, rule.tostar)) {
          result_actions.push(rule.action);
        }
      }
    }

    actions[messageId] = result_actions;
  }

  return actions;
}

export = filter;

// var test = function() {
//   var testOne = function() {
//     var messages = {
//         "msg1": {from: 'jack@example.com', to: 'jill@example.org'},
//         "msg2": {from: 'noreply@spam.com', to: 'jill@example.org'},
//         "msg3": {from: 'boss@work.com', to: 'jack@example.com'}
//     };
//     var rules = [
//         {from: '*@work.com', action: 'tag work'},
//         {from: '*@spam.com', action: 'tag spam'},
//         {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
//         {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
//     ];
//     return filter(messages, rules);
//   }
//
//   var counter = 0;
//   // for (; counter < 100000; counter++) {
//   while (true) {
//     counter++;
//     if (counter % 10000 == 0) {
//       console.log(counter);
//     }
//     testOne();
//   }
//   // console.log('Done');
// }
//
// test();
