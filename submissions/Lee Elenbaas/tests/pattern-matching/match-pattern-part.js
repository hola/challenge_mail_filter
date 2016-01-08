'use strict';

module.exports = PatternPart;

function PatternPart(part, leaveSpaceAfter) {
	this.segments = part.split('?');
	this.leaveSpaceAfter = leaveSpaceAfter;
	this.length = part.length;
	
	return this;
}

PatternPart.prototype.matchAt = function PatternPart_matchAt(text, index) {
	if (index+this.length > text.length) // not enough space for this part
		return false;
		
	for(var i = 0, s = 0; s < this.segments.length; ++i, ++index) {
		var segment = this.segments[s];
		
		if (i >= segment.length) { // segment ended, skip character and return to start of next segment
			i = -1;
			++s;
			continue;
		}
			
		if (text.charAt(index) !== segment.charAt(i))
			return false;
	}
	
	return true;
}

PatternPart.prototype.matchFrom = function PatternPart_matchFrom(text, index) {
	for(var maxIndex = text.length - this.leaveSpaceAfter - this.length; index <= maxIndex; ++index)
		if (this.matchAt(text, index))
			return index;
			
	return -1;
}
