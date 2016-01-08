module.exports = {
  perform: function(messages, rules) {
    var result = {};
    for(var msg in messages) {
      result[msg] = [];
      for(var rindex = 0; rindex < rules.length; rindex++) {
        var isMatched = true;
        if (rules[rindex].from) {
          isMatched = isMatched && this.match(messages[msg].from, rules[rindex].from);
        }
        if (rules[rindex].to) {
          isMatched = isMatched && this.match(messages[msg].to, rules[rindex].to);
        }
        if (isMatched) {
          result[msg].push(rules[rindex].action);
        }
      }
    }
    return result;
  },

  match: function(source, template) {
    if (!template.indexOf('?') && !template.indexOf('*')) { return source === template; }

    var tIndex = 0, sIndex = 0;

    var isMatched = true;
    for(var index = 0; index < template.length; index++) {
      if (source.charAt(tIndex) == template.charAt(sIndex) || template.charAt(sIndex) === '?' || template.charAt(sIndex) === '*' ) {
        tIndex++;
        sIndex++;
      } else if (sIndex > 0 && template.charAt(sIndex - 1) === '*') {
        tIndex++;
      } else {
        isMatched = false;
        break;
      }
    }
    return isMatched;
  }
};


/*

const filter = require('./modules/filter');

res = filter.perform({
    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
    msg3: {from: 'boss@work.com', to: 'jack@example.com'}
}, [
    {from: 'boss*@work.com', action: 'tag work'},
    {from: '*@spam.com', action: 'tag spam'},
    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
]);
*/
