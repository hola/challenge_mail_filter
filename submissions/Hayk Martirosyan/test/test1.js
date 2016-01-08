(function(){
var assert = require('assert');
var module = require("../app")

describe('Email Filter', function() {
  describe('#filter(message, rules)', function () {
    it('test - initial sample', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "*@work.com", "action": "tag work"},
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
    it('test2', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "????@work.com", "action": "tag work"},
			    {"from": "boss@work.com", "action": "tag work2"},
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
    it('test**', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "**@work.com", "action": "tag work"},
			    {"from": "boss@work.com", "action": "tag work2"},
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
    it('test*?', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "*?@work.c*?", "action": "tag work"},
			    {"from": "boss@work.?*?", "action": "tag work2"},
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
    it('test*?*', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "*?@work.co*?*", "action": "tag work"},
			    {"from": "boss@work.*?*", "action": "tag work2"},
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
    it('test?*', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "?*@work.com", "action": "tag work"},
			    {"from": "boss@work.com", "action": "tag work2"},
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
    it('test?????', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss@work.com", "to": "jack@example.com"}
			}, 
			"rules":[
			    {"from": "?????@work.com", "action": "tag work"},
			    {"from": "boss@work.com", "action": "tag work2"},
			    {"from": "*@spam.com", "action": "tag spam"},
			    {"from": "jac?@example.c*m", "to": "jill@example.org", "action": "folder jack"},
			    {"to": "jill@example.or?", "action": "forward to jill@elsewhere.com"}
			]
		}

		var result = {
		    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
		    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
		    msg3: ['tag work2']
		}

		assert.equal(JSON.stringify(module.filter(input.messages, input.rules)), JSON.stringify(result));
		
    });
    it('test4', function () {
    	var input = {
			"messages":
			{
			    "msg1": {"from": "jack@example.com", "to": "jill@example.org"},
			    "msg2": {"from": "noreply@spam.com", "to": "jill@example.org"},
			    "msg3": {"from": "boss1@work.com", "to": "jack1@example.com"},
			    "msg4": {"from": "boss2@work.com", "to": "jack1@example.com"},
			    "msg5": {"from": "boss1@work.com", "to": "jack2@example.com"},
			    "msg6": {"from": "boss2@work.com", "to": "jack2@example.com"}
			}, 
			"rules":[
			    {"from": "*@example.com", "action": "a1"},
			    {"from": "*?*", "action": "a2"},
			    {"from": "*@work.com", "to":"?*.*?",  "action": "a3"},
			    {"action": "a4"},
			    {"from":"*1@*", "to": "????2@example.co?", "action": "a5"}
			]
		}

		var result = {
		    msg1: ['a1', 'a2', 'a4'],
		    msg2: ['a2', 'a4'],
		    msg3: ['a2', 'a3', 'a4'],
		    msg4: ['a2', 'a3', 'a4'],
		    msg5: ['a2', 'a3', 'a4', 'a5'],
		    msg6: ['a2', 'a3', 'a4']
		}

		

		assert.equal(JSON.stringify(module.filter(input.messages, input.rules)), JSON.stringify(result));
		
    });
  });
});
})();