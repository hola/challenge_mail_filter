var filter = require('./filter');

//messages are random
var messages = require('./messages.json');
//rules are arbitary but can also be made random
var rules = require('./rules.json');


//var profiler = require('v8-profiler');
//profiler.startProfiling('1', true);
console.time('filter');
var res = filter(messages, rules);
console.timeEnd('filter');
//var profile1 = profiler.stopProfiling();

//var fs = require('fs');
//profile1.export(function(error, result) {
    //fs.writeFileSync('profile1.cpuprofile', result);
    //profile1.delete();
//});


// uncomment for correctness check
//var test_uri = 'http://hola.org/challenge_mail_filter/reference';

//require('request')({
    //json: true,
    //uri: test_uri,
    //method: 'POST',
    //body: {
      //messages: messages,
      //rules: rules
    //}
  //}, function(err, response, body) {
    //if (JSON.stringify(body) === JSON.stringify(res)) {
      //console.log('remote matches local');
    //} else {
      //console.log('remote failed');
    //}
//});

//console.log('local result');
//console.log(res);
