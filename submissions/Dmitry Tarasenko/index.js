/**
 * Created by tdv on 16.12.15.
 */

const PART_TYPE_ANY=1;
const PART_TYPE_SYMBOL=2;
const PART_TYPE_STR=3;

var preparedRule=[];

function allOk() {
	return true;
}

function allNo() {
	return false;
}

function filter0(sample, rule) {
	return sample==rule.parts[0];
}

//без *
function filter1(sample, rule) {
	var samplePos=0, l=sample.length, nextPos;
	if (l!=rule.minLength) return false;
	for (var i=0; i<rule.parts.length; i++) {
		if (rule.partsType[i]==PART_TYPE_SYMBOL) {
			if (samplePos==l) return false;
			samplePos++;
		}
		else {
			if (samplePos==l) return false;
			nextPos=sample.indexOf(rule.parts[i], samplePos);
			if (nextPos!=samplePos) return false;
			samplePos=nextPos+rule.parts[i].length;
		}
	}
	return samplePos==l;
}

// * в конце
function filter2(sample, rule) {
	var nextPart=1, samplePos=0, l=sample.length, nextPos;
	if (l<rule.minLength) return false;
	for (var i=0; i<rule.parts.length; i++) {
		if (rule.partsType[i]==PART_TYPE_ANY) {
			nextPart=2;
			continue;
		}
		if (rule.partsType[i]==PART_TYPE_SYMBOL) {
			if (samplePos==l) return false;
			samplePos++;
			nextPart=1;
		}
		else {
			if (samplePos==l) return false;
			nextPos=sample.indexOf(rule.parts[i], samplePos);
			if (nextPos==-1) return false;
			if (nextPart==1) {
				if (nextPos!=samplePos) return false;
			}
			nextPart=1;
			samplePos=nextPos+rule.parts[i].length;
		}
	}
	return true;
}

// * не в конце
function filter3(sample, rule) {
	var nextPart=1, l=sample.length, samplePos=l-1, nextPos, starPos, i;
	if (l<rule.minLength) return false;
	for (i=rule.parts.length-1; i>rule.lastStar; i--) {
		if (rule.partsType[i]==PART_TYPE_SYMBOL) {
			samplePos--;
			nextPart=1;
		}
		else {
			nextPos=sample.lastIndexOf(rule.parts[i], samplePos);
			if (nextPos==-1) return false;
			if (nextPart==1) {
				if (nextPos!=samplePos-rule.parts[i].length+1) return false;
			}
			nextPart=1;
			samplePos=nextPos-1;
		}
	}
	l=samplePos+1;
	samplePos=0;
	for (i=0; i<rule.lastStar; i++) {
		if (rule.partsType[i]==1) {
			nextPart=2;
			continue;
		}
		if (rule.partsType[i]==PART_TYPE_SYMBOL) {
			if (samplePos>=l) return false;
			samplePos++;
			nextPart=1;
		}
		else {
			if (samplePos>=l) return false;
			nextPos=sample.indexOf(rule.parts[i], samplePos);
			if (nextPos==-1) return false;
			if (nextPart==1) {
				if (nextPos!=samplePos) return false;
			}
			nextPart=1;
			samplePos=nextPos+rule.parts[i].length;
		}
	}
	return true;
}

function prepareTemplate(t) {
	var res={
		partsType: [],
		parts: [],
		minLength: 0,
		lastStar: 0
	}, partPos=-1, l=t.length, nStar=0, lastStarPos=-1, nV=0;
	if (l==0) {
		res.f=allNo;
		return res;
	}
	if (l==1 && t=='*') {
		res.f=allOk;
		return res;
	}
	for (var i=0; i<l; i++) {
		if (t[i]=='*') {
			nStar++;
			lastStarPos=i;
			if (partPos>=0) {
				res.partsType.push(PART_TYPE_STR);
				res.parts.push(t.substring(partPos, i));
			}
			partPos=-1;
			res.partsType.push(PART_TYPE_ANY);
			res.parts.push('*');
			res.lastStar=res.parts.length-1;
		}
		else if (t[i]=='?') {
			if (partPos>=0) {
				res.partsType.push(PART_TYPE_STR);
				res.parts.push(t.substring(partPos, i));
			}
			partPos=-1;
			res.partsType.push(PART_TYPE_SYMBOL);
			res.parts.push('?');
			nV++;
		}
		else {
			if (partPos==-1) partPos=i;
		}
	}
	if (partPos>=0) {
		res.partsType.push(PART_TYPE_STR);
		res.parts.push(t.substring(partPos));
	}
	res.minLength=l-nStar;
	if (nStar==0 && nV==0) res.f=filter0;
	else if (nStar==0) res.f=filter1;
	else if (lastStarPos==l-1) res.f=filter2;
	else res.f=filter3;
	return res;
}

function prepareRule(rule) {
	var o={
		from: {},
		to: {}
	};
	if (rule.from) {
		o.from=prepareTemplate(rule.from)
	}
	else o.from.f=allOk;
	if (rule.to) {
		o.to=prepareTemplate(rule.to)
	}
	else o.to.f=allOk;
	o.action=rule.action;
	preparedRule.push(o);
}

function filter(message, rules) {
	var i, msg, res={};
	preparedRule=[];
	for (i=0; i<rules.length; i++) prepareRule(rules[i]);
	for (msg in message) {
			res[msg] = [];
			for (i = 0; i < preparedRule.length; i++) {
				 if (preparedRule[i].to.f(message[msg].to, preparedRule[i].to)
					 && preparedRule[i].from.f(message[msg].from, preparedRule[i].from))

				res[msg].push(preparedRule[i].action);
			}
	}
	return res;
}

module.exports=filter;