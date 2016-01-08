var Benchmark = require("benchmark");
var suite = new Benchmark.Suite
var messages = require("./fixtures/messages");
var rules = require("./fixtures/rules");
var previous = require("../previous/");
var latest = require("../");

var msg = "*bk.ru";
var i;
var bench = suite
  .add("latest",function(){
    latest(messages, rules);
  })
  .add("original",function(){
    previous(messages, rules);
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    var slowest = this.filter("slowest");
    var fastest = this.filter("fastest");
    console.log("Fastest is " + this.filter("fastest").pluck("name") + " in " + fastest[0].hz / slowest[0].hz);
  })
  .run({ "async": true });
