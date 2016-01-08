(function(){
var assert = require('assert');
var module = require("../app")

describe('Email Filter', function() {
  describe('#filter(message, rules)', function () {
    it('test - full character set', function () {

    	var specialStr = "";
    	for(var i=0x20 ; i<=0x7F; i++){
    		specialStr += String.fromCharCode(i);
    	}
		// specialStr = "boss";
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": specialStr + "@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "" + specialStr + "@work.com", "action": "tag work"},
			    {"from": "*@spam.com", "action": "tag spam"},
			    {"from": "jack@example.com", "to": "jill@example.org", "action": "folder jack"},
			    {"to": "jill@example.org", "action": "forward to jill@elsewhere.com"}
			]
		}

		var result = {
		    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
		    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
		    msg3: ['tag work']
		}

		assert.equal(JSON.stringify(module.filter(input.messages, input.rules)), JSON.stringify(result));
		
    });
	it('test - special characters ? and *', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "b?s*@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "????@work.com", "action": "tag work"},
			    {"from": "b?s?@work.com", "action": "tag work2"},
			    {"from": "*@spam.com", "action": "tag spam"},
			    {"from": "jac?@example.c*m", "to": "jill@example.org", "action": "folder jack"},
			    {"to": "jill@example.or?", "action": "forward to jill@elsewhere.com"}
			]
		}

		var result = {
		    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
		    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
		    msg3: ['tag work', 'tag work2']
		}

		assert.equal(JSON.stringify(module.filter(input.messages, input.rules)), JSON.stringify(result));
		
    });
  })
});
})();