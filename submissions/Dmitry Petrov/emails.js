function r(names) {
  return function () {
    return names[~~(Math.random()*names.length)]
  }
}

var name = r(require('./names.json'));
var domain = r(require('./domains.json'));

var num = +process.argv[2] || 10000;
var emails = [];

while (num--) {
  emails.push(name() + Math.round(Math.random() * 1000) +
              '@' + domain());
}

console.log(JSON.stringify(emails));
