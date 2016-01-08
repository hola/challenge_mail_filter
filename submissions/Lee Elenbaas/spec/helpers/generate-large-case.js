
module.exports = generateLargeCase;

var evalRegExp = /\{{([^{}]*)}}/;

function generateLargeCase(templates, repeatParameters) {
	var jsonTemplate = JSON.stringify(templates);
	
	var testCase = {
		rules: [],
		messages: {},
		expectedResult: {}
	};
	
	for (var index = repeatParameters.indexFrom; index < repeatParameters.indexTo; index += repeatParameters.indexStep) {
		var jsonInstance = jsonTemplate;
		
		for(var match = evalRegExp.exec(jsonInstance); match; match = evalRegExp.exec(jsonInstance)) {
			jsonInstance = jsonInstance.replace(evalRegExp, eval(match[1]));
		}
		
		var instance = JSON.parse(jsonInstance);
		
		for(ruleIndex in instance.rulesTemplates) {
			testCase.rules[ruleIndex] = instance.rulesTemplates[ruleIndex];
		}

		for(message in instance.messageTemplates) {
			testCase.messages[message] = {
				from: instance.messageTemplates[message].from,
				to: instance.messageTemplates[message].to
			};
			
			testCase.expectedResult[message] = instance.messageTemplates[message].expectedActions;
		}
	}
	
	return testCase;
}
