exports.filter = function(messages, rules){
        var rulesString = [];
        var rulesReg = [];

        var checkRule = function(ruleString){
            return getRuleReg(ruleString);
        };

        var getRuleReg = function(ruleString){
            var ruleIndex = rulesString.indexOf(ruleString);
            return ruleIndex == -1 ? createRuleReg(ruleString) : rulesReg[ruleIndex];
        };

        var createRuleReg = function(ruleString){
          rulesString.push(ruleString);

          var newRule = new RegExp('^' + ruleString.replace(/(\?|\*)/g, '.$&').replace(/[\.\+\^\$]/g, '\\$&') + '$');
          rulesReg.push(newRule);
          return newRule;
        };

        var checkFilters = function(message){

          var a=[];
          for (var i=rules.length-1; i; i--){
            (rules[i].hasOwnProperty('from') ? rules[i].from.test(message.from) : true) && (rules[i].hasOwnProperty('to') ? rules[i].to.test(message.to) : true) && a.push(rules[i].action);
          }
          (rules[0].hasOwnProperty('from') ? rules[0].from.test(message.from) : true) && (rules[0].hasOwnProperty('to') ? rules[0].to.test(message.to) : true) && a.push(rules[0].action);
          return a;
        };


        rules.forEach(function(rule){
            rule.from && (rule.from = checkRule(rule.from));
            rule.to && (rule.to = checkRule(rule.to));
        });

        var filteredMessages = {};
        for (var key in messages){
            var action = checkFilters(messages[key]);
            if (action.length) {
                filteredMessages[key] = action;
            }
        }
        return filteredMessages;
    };