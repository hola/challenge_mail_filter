
describe('validate mail-filter against large-test-cases:', () => {
	var caseTemplates = require('./large-test-cases');
	var repeatConfig = require('./large-test-cases-config');
	var mailFilter = require('../../mail-filter');
	var caseGenerator = require('../helpers/generate-large-case');

	caseTemplates.forEach(template => {
		it(template.name, () => {
			if (template.disabled){
			  suspend('Test disabled');
			  return;
			}

			var testCase = caseGenerator(template, repeatConfig);
			
			console.time(template.name);

			var result = mailFilter(testCase.messages, testCase.rules);

			console.timeEnd(template.name);

			expect(result).toEqual(testCase.expectedResult);
		});
	});
});
