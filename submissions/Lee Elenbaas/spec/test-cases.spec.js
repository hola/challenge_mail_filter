
describe('validate test-cases against reference implementation:', () => {
	//pending('only validate the test-cases when they are updated, makes testing faster, and avoids rate limit from the reference implementation');

	var cases = require('./test-cases');
	var referenceImplementation = require('./helpers/reference-implementation');

	cases.forEach(testCase => {
		it(testCase.name, (done) => {
			if (testCase.validated) {
				pending('already validated');
				return;
			}

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
