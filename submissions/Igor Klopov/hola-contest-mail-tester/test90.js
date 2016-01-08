#!/usr/bin/env node

var solve = require("./solve-corasick-O3.js");

var test = {
  "messages": {
    "msg1": { "from": "jack@example.com", "to": "jill@example.org" },
    "msg2": { "to": "jill@example.org", "from": "noreply@spam.com" },
    "msg3": { "from": "boss@work.com", "to": "jack@example.com" }
  },
  "rules": [
    { "from": "*@work.com", "action": "tag work" },
    { "from": "*@spam.com", "action": "tag spam" },
    { "from": "jack@example.com", "to": "jill@example.org", "action": "folder jack" },
    { "to": "jill@example.org", "action": "forward to jill@elsewhere.com" }
  ]
};

console.log(solve(test.messages, test.rules));
