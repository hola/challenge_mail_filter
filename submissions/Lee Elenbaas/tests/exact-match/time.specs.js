
describe('time exact-match methods:', () => {
	var methods = require('./methods');
	var config = require('./config');
	var testCases = require('./test-cases');

	var iterationValues;

	for(var method in methods)
		createIterationTest(method);

	function createIterationTest(iterationMethod) {
		describe(iterationMethod, ()=> {
			testCases.forEach(testCase => {
				it(testCase.name, () => {
					var timeLabel = 'exact-match using ' + iterationMethod+' '+testCase.name;
					var preparationLabel = timeLabel+' preparation';
					var executionLabel = timeLabel+' execution';

					var compareFunction = methods[iterationMethod];

					console.time(preparationLabel);

					var testObject;
					for (var i = 0; i < config.matchRepeats; ++i) {
						testObject = compareFunction(testCase.pattern);
					}

					console.timeEnd(preparationLabel);
					console.time(executionLabel);

					for (var i = 0; i < config.matchRepeats; ++i) {
						var result = testObject.test(testCase.text);

						expect(result).toBe(testCase.expected);
					}

					console.timeEnd(executionLabel);
				});
			});
		});
	}
});
