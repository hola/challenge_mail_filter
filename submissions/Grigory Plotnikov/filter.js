var Rules = function Rules(arr) {
    function strToRegex(str) {
        //flatten string a bit, removing useless ** stuff and slow ^* stuff
        var prev = '^';
		var res = '^';
		for(var i = 0; i < str.length; i++)
		{
			var next = str[i + 1];
			var curr = str[i];
            if (curr == '*') {
				if (prev == '^') {
					res = '';
				}
				else if (prev != '*') {
                    prev = curr;
                    res += '.*';
                }
			}
			else {
				prev = curr;
				switch (curr) {
					case '.':
					res += '\\.';
					break;
					case '?':
					res += '.{1}';
					break;
					default:
					res += curr;
					break;
				}
			}
		}
		
		if (res == '')
            return null;
        
		return new RegExp(res + '$');
    }
	
	function toHex(str) {
		var hex = '';
		for(var i=0;i<str.length;i++) {
			hex += ''+str.charCodeAt(i).toString(16);
		}
		return hex;
	}
    
    this.r = arr.map(function (rule) {
        var nr = { action: rule.action, from: null, to: null, frommemo: {}, tomemo: {} };
        if (rule.hasOwnProperty('from')) {
            var regex = strToRegex(rule.from);
            if (regex != null)
                nr.from = regex;
        }
        if (rule.hasOwnProperty('to')) {
            var regex = strToRegex(rule.to);
            if (regex != null)
                nr.to = regex;
        }
        return nr;
    });
    
	this.memo = {}; //storeage for memoization
	
    this.getActions = function (message) {
		//var key = toHex([message.from, message.to].join());
		//if(this.memo[key])
			//return this.memo[key];
		
		var fromkey = toHex(message.from);
		var tokey = toHex(message.to);
		
		var actions = [];
		for (var i = 0; i < this.r.length; i++) //for faster than reduce 0_0
		{
            var tst = true;
            if (this.r[i].from != null) {
				if(!this.r[i].frommemo.hasOwnProperty(fromkey))
					this.r[i].frommemo[fromkey] = this.r[i].from.test(message.from);

				tst &= this.r[i].frommemo[fromkey];
            }
            if (tst && this.r[i].to != null) {
				if(!this.r[i].tomemo.hasOwnProperty(tokey))
					this.r[i].tomemo[tokey] = this.r[i].to.test(message.to);

                tst &= this.r[i].tomemo[tokey];
            }
            
            if (tst)
                actions.push(this.r[i].action);
		}
		
		//this.memo[key] = actions;
        return actions;
    }
}

var filter = function(messages, rules) {
    //revork rules
    var q = new Rules(rules);
    
    /*
    q.r.map(function (rule) {
        console.log('action:' + rule.action);
        if (rule.from!=null)
            console.log('from:' + rule.from);
        if (rule.to!=null)
            console.log('to:' + rule.to);
    });
    */

    return Object.keys(messages).reduce(function (filtered, msgkey) {
        filtered[msgkey] = q.getActions(messages[msgkey]);
        //fill the actions

        return filtered;
    }, {});
}

module.exports = filter;