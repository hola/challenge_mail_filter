'use strict';

module.exports = Pattern;

var PatternPart = require('./match-pattern-part');

function Pattern(pattern) {
	if (!pattern)
		pattern = '*';
	
	var patternParts = 	pattern.split('*');
	this.parts = [];
	var leaveEnoughSpaceAfter = 0;
	
	for(var i = patternParts.length; i-- > 0;) {
		var part = new PatternPart(patternParts[i], leaveEnoughSpaceAfter)
		
		leaveEnoughSpaceAfter += part.length;
		this.parts[i] = part;
	}
	
	this.minLength = leaveEnoughSpaceAfter;
	
	return this;
}

Pattern.prototype.test = function Pattern_test(text) {
	var part;
	var index;
	var lastPart;
	
	// first part
	part = this.parts[0];
	if (!part.matchAt(text, 0))
		return false;

	// only one part
	if (this.parts.length == 1)
		return text.length === part.length;

	// middle parts	
	lastPart = this.parts.length -1;
	index = part.length;
	
	for(var p = 1; p < lastPart; ++p) {
		part = this.parts[p];
				
		index = part.matchFrom(text, index);
		
		if (index === -1) // no match
			return false;
			
		index += part.length;
	}
	
	// last part
	part = this.parts[lastPart];
	return part.matchAt(text, text.length - part.length);
}
