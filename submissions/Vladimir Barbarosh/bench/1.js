var input = require('./1.json'),
    filter = require('../src/filter'),
    tmp, a, i;

a = new Date().getTime();
for (i = 0; i < 100000; ++i) {
    tmp = filter(input.messages, input.rules);
}
a = new Date().getTime() - a;
console.log(tmp);
console.log(a);
