function r(names) {
  return function () {
    return names[~~(Math.random()*names.length)]
  }
}

var from = r(require('./from.json'));
var to = r(require('./to.json'));

var num = +process.argv[2] || 10000;
var id = 1;
var messages = {};

while (num--) {
  messages['msg' + id++] = {
    from: from(),
    to: to()
  };
}

console.log(JSON.stringify(messages));
