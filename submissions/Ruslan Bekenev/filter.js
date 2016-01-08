module.exports = {
		filter: function(messages, rules) {
				var filter = new Filter(messages, rules);
				return filter.run();
		}
};

var Filter = function(messages, rules) {
		this.messages = messages;
		this.rules = this.prepare_rules(rules);

		this.output_object = {};
};

Filter.prototype.prepare_rules = function(rules) {
		var self = this;
		return rules.map(function(rule){
				return self.prepare_rule(rule);
		})
}

Filter.prototype.prepare_rule = function(rule) {

		var self = this;
		// in case there is no "from" property
		// let's create it with default value
		if(!rule.hasOwnProperty('from')) {
				rule.from = '.*?'
		} else {
				// if "from"" is exist
				// then let's convert to it regexp
				rule.from = self.mask_to_regexp(rule.from);
		}

		// same operations for "to" property
		if(!rule.hasOwnProperty('to')) {
				rule.to = '.*?'
		} else {
				rule.to = self.mask_to_regexp(rule.to);
		}
		
		return rule;
};

// convert * and ? to regex style
// * == .*?
// ? == .{1}
Filter.prototype.mask_to_regexp = function(str) {
		//return str.replace('.', '\.').replace('?', '.{1}').replace('*', '.*?');
		return str.replace('.', '\\.').replace('?', '.{1}').replace('*', '.*?');
};

Filter.prototype.run = function() {
		var self = this;
		var keys = Object.keys(self.messages);

		// loop through messages
		for (var i = 0, len = keys.length; i < len; i++) {
				var message_id = keys[i];
				var message_info = self.messages[message_id];

				// loop through rules
				for (var j = 0, len2 = self.rules.length; j < len2; j++) {
						var rule = self.rules[j];
						var to_regex = new RegExp(rule.to);
						var from_regex = new RegExp(rule.from);
						
						// if both rules are true
						// then let's add action to the output object
						if(to_regex.test(message_info.to) && from_regex.test(message_info.from)) {
								if(!self.output_object.hasOwnProperty(message_id)) {
										self.output_object[message_id] = [rule.action];
								} else {
										self.output_object[message_id].push(rule.action);
								}
						} 
				}

				if(!self.output_object.hasOwnProperty(message_id)) {
						self.output_object[message_id] = [];
				}
		}

		return self.output_object;
};
