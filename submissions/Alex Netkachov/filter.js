'use strict';

function createFilter(filters) {
  let strToSrc = str => JSON.stringify(str);

  let checkToSrc = (name, check, done) => {
    // do not check if undefined
    if (check === undefined) {
      return done('');
    }

    // converts ?**?*?*??***?* to ??????*
    do {
      let updated = check.replace(/\*+/g, '*').replace(/\*\?/g, '?*');
      if (updated === check) {
        break;
      }
      check = updated;
    } while (true);

    // do not check if *
    if (check === '*') {
      return done('');
    }

    let st = true;

    let indent = '';

    let result = 'p = q = 0;\n';
    let tail = '';

    let tks = check.split(/(\?+|\*+)/).filter(i => i !== '');

    for (let i = 0; i < tks.length; i++) {
      let tk = tks[i];

      if (tk === '*') {
        if (i === tks.length - 1) {
          result += done(indent + ' ');
        } else {
          st = false;
        }
      } else if (tk[0] === '?') {
        result += indent + 'p += ' + tk.length + ';\n';
        if (i === tks.length - 1) {
          result += indent + 'if (p === ' + name + 'Len) {\n' +
            done(indent + ' ') +
            indent + '}\n';
        } else {
          result += indent + 'if (p <= ' + name + 'Len) {\n';
          tail += '}';
          indent += ' ';
        }
      } else {
        if (st) {
          if (tk.length === 1) {
            result += indent + 'if (' + name + '[p] === ' + strToSrc(tk) + ') {\n';
          } else if (tk.length === 2) {
            result += indent + 'if (' + name + '[p] === ' + strToSrc(tk[0]) + ' && ' +
              name + '[p+1] === ' + strToSrc(tk[1]) + ') {\n';
          } else {
            result += indent + 'if (' + name + '[p] === ' + strToSrc(tk[0]) + ' && ' +
              name + '.substr(p, ' + tk.length + ') === ' + strToSrc(tk) + ') {\n';
          }
          tail += '}';
          indent += ' ';
          result += indent + 'p += ' + tk.length + ';\n';
        } else {
          result += indent + 'q = ' + name + '.indexOf(' + strToSrc(tk) + ', p);\n';
          result += indent + 'if (-1 !== q) {\n';
          tail += '}';
          indent += ' ';
          result += indent + 'p = q + ' + tk.length + ';\n';
        }
        if (i === tks.length - 1) {
          result += indent + 'if (p === ' + name + 'Len) {\n' +
            done(indent + ' ') +
            indent + '}\n';
        }
        st = true;
      }
    }

    return result + tail + '\n';
  };

  let src = '\n' +
    'var a = [], f = msg.from, fLen = f.length,\n' +
    ' t = msg.to, tLen = t.length, p = 0, q = 0;\n' +
    filters.map(filter => {
      return checkToSrc('f', filter.from, indent =>
        indent + checkToSrc('t', filter.to, indent =>
          indent + 'a[a.length] = ' + strToSrc(filter.action) + ';\n')
          .replace(/\n/g, '\n' + indent).replace(/ +$/, ''));
    }).join('\n') + '\nreturn a;';
  return new Function('msg', src);
}

module.exports.filter = (messages, rules) => {
  let filter = createFilter(rules);
  Object.keys(messages).forEach(k => {
    messages[k] = filter(messages[k]);
  });
  return messages;
};