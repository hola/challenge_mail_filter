// var request = require('sync-request');
// module.exports = function(m, r) {
//   var res = request('POST', 'http://hola.org/challenge_mail_filter/reference', {
//     headers : {
//       'Content-Type': 'application/json'
//     },
//     json: {
//       messages:m,
//       rules:r
//     }
//   });
//   return JSON.parse(res.getBody('utf8'));
// }

module.exports = function(m, r) {
  function transform_reg(s) {
    if (s == "")
      return ".*";
    var t = ['^'];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c == 42) { // *
        t.push('.*');
      } else if (c == 63) { // ?
        t.push('.{1}');
      } else {
        t.push('\\x');
        t.push(c.toString(16));
      }
    }
    t.push('$');
    return t.join('');
  };
  r.forEach(function(rule) {
    rule.from = new RegExp(transform_reg(rule.from || ""));
    rule.to   = new RegExp(transform_reg(rule.to   || ""));
  });
  var result = {};
  for (var msg_name in m) {
    var msg = m[msg_name];
    var res = [];
    r.forEach(function(rule) {
      if (rule.from.test(msg.from) && rule.to.test(msg.to))
        res.push(rule.action);
    });
    result[msg_name] = res;
  };
  return result;
}
