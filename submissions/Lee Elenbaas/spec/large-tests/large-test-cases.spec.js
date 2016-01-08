
describe('validate large-test-cases against reference implementation:', () => {
	//pending('only validate the test-cases when they are updated, makes testing faster, and avoids rate limit from the reference implementation');

	var caseTemplates = require('./large-test-cases');
	var caseGenerator = require('../helpers/generate-large-case');
	var referenceImplementation = require('../helpers/reference-implementation');

	caseTemplates.forEach(template => {
		it(template.name, (done) => {
			if (template.validated) {
				pending('already validated');
				return;
			}
			
			var testCase = caseGenerator(
				template, 
				{
					indexFrom: 0,
					indexTo: 1,
					indexStep: 1
				}
			);
			
			referenceImplementation(testCase.messages, testCase.rules)
				.then(res => {
					expect(testCase.expectedResult).toEqual(res);
					done();
				})
				.catch((res) => {
					console.log('test failed');
					console.log(res);
					done.fail(res);
				});
		})
	});
});
