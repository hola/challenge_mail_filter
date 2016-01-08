(function(_export) {
	"use strict";
	
	function BackTrack(position, pLength) {
		this.Position = position;
		this.PatternLength = pLength;
	}
	
	function Pattern (pattern) {
		var patternLastIndex = pattern.length - 1;
		
		var pLength = 0;
		var backtrack = null;
		var pCharArray = new Array(pattern.length);
		var bTable = new Array(pattern.length);
		var reverse = pattern.length > 1 && pattern[0] == '*' && pattern[patternLastIndex] != '*';
		
		var length = 0;
		for(var i = 0; i <= patternLastIndex; i++) {
			var index = reverse? patternLastIndex - i: i;
			var character = pattern[index];
			
			if(character != '*' || backtrack == null || backtrack.Position != length - 1) {
				pCharArray[length] = character;
				bTable[length] = backtrack;
				
				if(character == '*') {
					backtrack = new BackTrack(length, pLength);
				}
				else {
					pLength++;
				}
				
				length++;
			}
		}
		bTable.length = length;
		
		this.OriginalString = pattern;
		this.PatternLength = pLength;
		this.PatternString = pCharArray.join('');
		this.BackTrackTable = bTable;
		this.IsReverse = reverse;
		this.MatchCache = [];
	}
	Pattern.prototype.Matches = function Matches(targetstring) {
		var tStrLastIndex = targetstring.length - 1;
		var pChecks = this.PatternLength;
		var pString = this.PatternString;
		var bTable = this.BackTrackTable;
		var reverse = this.IsReverse;
		var optimize = pString[pString.length - 1] == '*';
		var tcount, pcount, cachematch;
		var cache = this.MatchCache;
		var cachematch = cache[targetstring];
		
		for(tcount = pcount = 0;
			!cachematch && targetstring.length - tcount >= pChecks && tcount <= tStrLastIndex && (!optimize || pChecks > 0);
			tcount++) {
			var tCharacter = targetstring[reverse? tStrLastIndex - tcount: tcount];
			var pCharacter = pString[pcount];
			
			if(pCharacter == '*') {
				var nextpcount = pcount + 1;
				pCharacter = pString[nextpcount];
				
				if(pCharacter == '?' || pCharacter == tCharacter) {
					pcount = nextpcount + 1;
					pChecks--;
				}
			}
			else if(pCharacter == '?' || pCharacter == tCharacter) {
				pcount++;
				pChecks--;
			}
			else {
				var backtrack;
				if(bTable[pcount] != null && bTable[pcount] != undefined) backtrack = bTable[pcount];
				else if(pcount == bTable.length && bTable[pcount - 1] != null) backtrack = bTable[pcount - 1];
				else break;
				
				pcount = backtrack.Position;
				pChecks = this.PatternLength - backtrack.PatternLength;
				tcount--;
			}
		}
		
		cachematch = cachematch || (pChecks == 0 && (tcount == targetstring.length || pString[pcount] == '*'));
		if(cachematch) cache[targetstring] = cachematch;
		
		return cachematch;
	}
	Pattern.MatchCacheSize = 64;
	
	function MailFilter(raw) {
		var cache;
		var pCache = MailFilter.PatternCache;
		
		this.To = !raw.to? undefined: (cache = pCache[raw.to])? cache: new Pattern(raw.to);
		pCache[raw.to] = this.To;
		
		this.From = !raw.from? undefined: (cache = pCache[raw.from])? cache: new Pattern(raw.from);
		pCache[raw.from] = this.From;
		
		this.Action = raw.action;
		this.SubFilters = null;
	}
	MailFilter.prototype.Matches = function Matches(mail) {
		return (this.To == null || mail.to != null && this.To.Matches(mail.to)) &&
				(this.From == null || mail.from != null && this.From.Matches(mail.from));
	}
	MailFilter.prototype.AddSubFilter = function AddSubFilter(filter) {
		var success = (this.To == null || filter.To != null && this.To.Matches(filter.To.OriginalString)) &&
						(this.From == null || filter.From != null && this.From.Matches(filter.From.OriginalString));
			
			if(success) {
				var subfilters = this.SubFilters;
				if(subfilters == null) {
					subfilters = [];
					this.SubFilters = subfilters;
				}
				
				MailFilter.AddToList(this.SubFilters, filter);
			}
			
		return success;
	}
	MailFilter.PatternCache = []
	MailFilter.AddToList = function AddToList(list, filter) {
		var stored = false;
		var index, offset = 0;
		var listlength = list.length;
		
		for(index = 0; !stored && index < listlength; index++) {
			var cFilter = list[index + offset];
			
			if(offset == 0) stored = cFilter.AddSubFilter(filter);
			else list[index] = cFilter;
			
			if(!stored && filter.AddSubFilter(cFilter)) {
				index--;
				listlength--;
				offset++;
			}
		}
		
		if(!stored) {
			if(offset > 0) list.length = listlength;
			list.push(filter);
		}
	}
	MailFilter.FromRawList = function FromRawList(rawlist) {
		var filterlist = []
		var listlength = rawlist.length;
		
		for(var index = 0; index < listlength; index++) {
			MailFilter.AddToList(filterlist, new MailFilter(rawlist[index]));
		}
		
		return filterlist;
	}
	
	function FilterMail(message, filters, actions) {
		for(var index = 0; index < filters.length; index++) {
			var filter = filters[index];
			
			if(filter.Matches(message)) {
				actions.push(filter.Action);
				if(filter.SubFilters != null) {
					FilterMail(message, filter.SubFilters, actions);
				}
			}
		}
	}
	
	function filter(messages, rules) {
		var fMsg = {};
		var filters = MailFilter.FromRawList(rules);
		
		for(var mKey in messages) {
			var actions = [];
			FilterMail(messages[mKey], filters, actions);
			fMsg[mKey] = actions;
		}
		
		return fMsg;
	}
	
	_export.filter = filter;
})(this);