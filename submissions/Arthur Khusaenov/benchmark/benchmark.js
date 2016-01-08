var Benchmark = require('benchmark');
var filter = require('./../filter');
var suite = new Benchmark.Suite;

suite.add('benchmark', function() {
    filter({
        msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
        msg3: {from: 'boss@work.com', to: 'jack@example.com'}
    }, [
        {from: '*@work.com', action: 'tag work'},
        {from: '*@spam.com', action: 'tag spam'},
        {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
        {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
    ]);
})
// add listeners
.on('cycle', function(event) {
    console.log(String(event.target));
})
//.on('complete', function() {
//    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
//})
// run async
.run({'async': true});
