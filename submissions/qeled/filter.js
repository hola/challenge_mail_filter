// DISCLAIMER:
// 
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
// NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, PROFITS, OR EYESIGHT; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function stringToArray(s) {
  var sl = s.length;
  var r = [];
  for (var i = 0; i < sl; i++) {
    r.push(s.charCodeAt(i));
  }
  return r;
}

function testStartsWithPattern(s, p) {
  var sl = s.length;
  var pl = p.length;
  if (pl > sl) return false;
  for (var i = 0; i < pl; i++) {
    if (s[i] !== p[i] && p[i] !== 63) {
      return false;
    }
  }
  return true;
}
function testEndsWithPattern(s, p) {
  var sl = s.length;
  var pl = p.length;
  var n = sl - pl;
  if (n < 0) return false;
  for (var i = 0; i < pl; i++, n++) {
    if (s[n] !== p[i] && p[i] !== 63) {
      return false;
    }
  }
  return true;
}
function testContainsPattern(s, p) {
  var sl = s.length;
  var pl = p.length;
  if (sl < pl) return false;
  if (pl === 0) return true;
  for (var i = 0; i < sl - pl + 1; i++) {
    if (p[0] !== 63 && p[0] !== s[i]) continue;
    for (
      var si = i + 1, pi = 1;
      pi < pl && (p[pi] === 63 || p[pi] === s[si]);
      si++, pi++
    ) {}
    if (pi === pl) return true;
  }
  return false;
}
function testPattern(s, p) {
  var sl = s.length;
  var pl = p.length;
  var wildcard = 0;
  for (var i = 0; i < sl; i++) {
    if (p[i] === 42) {
      wildcard = 1;
      break;
    }
    if (p[i] !== s[i] && p[i] !== 63) {
      return false;
    }
  }

  if (wildcard === 0) {
    if (sl > pl) return false;
    if (sl === pl) return true;
  }

  var si_ = 0;
  var pi_ = 0;
  var si = i;
  var pi = i;

  bay:
  bae:
  do {
    if (si < sl && pi < pl) {
      if (p[pi] === s[si] || p[pi] === 63) {
        si++;
        pi++;
        continue bae;
      }
      if (p[pi] === 42) {
        si_ = si + 1;
        pi_ = pi++;
        continue bae;
      }
      si = si_;
      pi = pi_;
      continue bae;
    }
    break bay;
  } while ("bae > bay");

  while (pi < pl && p[pi] === 42) pi++;

  var p_last = p[pl - 1];
  return (pi_ > 0 || si_ > 0) &&
          p_last !== 42 &&
          p_last !== 63 &&
          p_last !== s[sl - 1] ?
            false :
            pi === pl;
}

function compileRules(rules) {
  function isStatic(p) {
    var pl = p.length;
    for (var i = 0; i < pl; i++) {
      if (p[i] === "?" || p[i] === "*") {
        return false;
      }
    }
    return true;
  }
  function isLengthPattern(p) {
    var pl = p.length;
    for (var i = 0; i < pl; i++) {
      if (p[i] !== "?") {
        return false;
      }
    }
    return true;
  }
  function isAnyPattern(p) {
    var pl = p.length;
    for (var i = 0; i < pl; i++) {
      if (p[i] !== "*") {
        return false;
      }
    }
    return true;
  }
  function isStartsWithPattern(p) {
    var pl = (p.length - 1);
    if (p[pl] !== "*") return false;
    for (var i = 0; i < pl; i++) {
      if (p[i] === "*") {
        return false;
      }
    }
    return true;
  }
  function isEndsWithPattern(p) {
    if (p[0] !== "*") return false;
    var pl = p.length;
    for (var i = 1; i < pl; i++) {
      if (p[i] === "*") {
        return false;
      }
    }
    return true;
  }
  function isContainsPattern(p) {
    if (p[0] !== "*") return false;
    var pl = (p.length - 1);
    if (p[pl] !== "*") return false;
    for (var i = 1; i < pl; i++) {
      if (p[i] === "*") {
        return false;
      }
    }
    return true;
  }

  function processField(rule, field, value, bitoffset) {
    if (!value || typeof value !== "string" || isAnyPattern(value)) return;
    var isStartsWith = isStartsWithPattern(value);
    var isEndsWith = isEndsWithPattern(value);
    var isContains = isContainsPattern(value);
    var type = 0;
    type |= isStatic(value) << 0;
    type |= isLengthPattern(value) << 1;
    type |= isStartsWith << 2;
    type |= isEndsWith << 3;
    type |= isContains << 4;
    if (isStartsWith) value = value.slice(0, -1);
    if (isEndsWith) value = value.slice(1);
    if (isContains) value = value.slice(1, -1);
    rule[field] = value;
    rule[field + "a"] = stringToArray(value);
    rule.type |= (type << bitoffset);
    return type;
  }

  var _rules = [];
  var rules_l = rules.length;
  for (var i = 0; i < rules_l; i++) {
    var rule = rules[i];
    if (!rule.action) continue;

    var rfrom = rule.from;
    var rto = rule.to;
    if (typeof rfrom !== "string" && typeof rto !== "string") continue;

    rule = {
      from: null, to: null,
      froma: null, toa: null,
      type: 0,
      action: rule.action
    };
    processField(rule, "from", rfrom, 0);
    processField(rule, "to", rto, 5);
    _rules.push(rule);
  }

  return _rules;
}

function processMessages(messages, rules, keys, keys_l) {
  var resultsCache = new Map;
  for (var i = 0; i < keys_l; i++) {
    var m = messages[keys[i]] || {};
    if (typeof m.from !== "string" || typeof m.to !== "string") continue;
    { var mfrom = m.from;
      var mto = m.to; }
    { var mhash = mfrom + "\1" + mto; }

    var cache = resultsCache.get(mhash);
    if (cache) {
      messages[keys[i]] = cache;
      continue;
    }
    var actions = (messages[keys[i]] = []);
    resultsCache.set(mhash, actions);

    applyRules(rules, actions, mfrom, mto);
  }
}

function applyRules(rules, actions, mfrom, mto) {
  var rules_l = rules.length;
  { var mfroma = stringToArray(mfrom);
    var mtoa = stringToArray(mto); }
  for (var ri = 0; ri < rules_l; ri++) {
    var rule = rules[ri];
    { var rfrom = rule.from;
      var rto = rule.to; }
    { var rfroma = rule.froma;
      var rtoa = rule.toa; }
    { var rtype = rule.type; }

    if
    (
      (rfrom === null ||
        ((rtype & 1) ?
          (mfrom === rfrom) :
          ((rtype & 2) ?
            (mfroma.length === rfroma.length) :
            ((rtype & 4) ?
              testStartsWithPattern(mfroma, rfroma) === true :
              ((rtype & 8) ?
                testEndsWithPattern(mfroma, rfroma) === true :
                ((rtype & 16) ?
                  testContainsPattern(mfroma, rfroma) === true :
                  testPattern(mfroma, rfroma) === true
                )
              )
            )
          )
        )
      )
    &&
      (rto === null ||
        ((rtype & 32) ?
          (mto === rto) :
          ((rtype & 64) ?
            (mtoa.length === rtoa.length) :
            ((rtype & 128) ?
              testStartsWithPattern(mtoa, rtoa) === true :
              ((rtype & 256) ?
                testEndsWithPattern(mtoa, rtoa) === true :
                ((rtype & 512) ?
                  testContainsPattern(mtoa, rtoa) === true :
                  testPattern(mtoa, rtoa) === true
                )
              )
            )
          )
        )
      )
    )
      actions.push(rule.action);
  }
}

function filter(messages, rules) {
  var keys = Object.keys(messages || {});
  var keys_l = keys.length;
  var rules_l = rules.length;

  if (!messages || !keys_l) return {};
  if (!rules || !rules_l) {
    for (var i = 0; i < keys_l; i++) {
      messages[keys[i]] = [];
    }
    return messages;
  }

  processMessages(
    messages,
    compileRules(rules),
    keys, keys_l
  );

  return messages;
}

module.exports = (filter.filter = filter);

// TGVhdmUgdGhlIGhvcnJvciBoZXJlLg0KRm9yZ2V0IHRoZSBob3Jyb3IgaGVyZS4NCkZvcmdldCB0
// aGUgaG9ycm9yIGhlcmUuDQpMZWF2ZSBpdCBhbGwgZG93biBoZXJlLg0KSXQncyBmdXR1cmUgcnVz
// dCBhbmQgaXQncyBmdXR1cmUgZHVzdC4NCkZvcmdldCB0aGUgaG9ycm9yIGhlcmUuDQpGb3JnZXQg
// dGhlIGhvcnJvciBoZXJlLg0KTGVhdmUgaXQgYWxsIGRvd24gaGVyZS4NCkl0J3MgZnV0dXJlIHJ1
// c3QgYW5kIGl0J3MgZnV0dXJlIGR1c3Qu
