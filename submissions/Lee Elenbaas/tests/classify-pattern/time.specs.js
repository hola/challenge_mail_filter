
describe('time classify-pattern methods:', () => {
	var methods = require('./methods');
	var config = require('./config');
	var testCases = require('./test-cases');

	var iterationValues;

	for(var method in methods)
		createClassificationTest(method);

	function createClassificationTest(classificationMethod) {
		describe(classificationMethod, ()=> {
			beforeAll(() => console.time(classificationMethod));
			afterAll(() => console.timeEnd(classificationMethod));
			
			testCases.forEach(testCase => {
				it(testCase.name, () => {
					var timeLabel = 'classify-pattern\tusing\t' + classificationMethod+'\t'+testCase.name;

					console.time(timeLabel);

					for (var i = 0; i < config.matchRepeats; ++i) {
						var patternType = methods[classificationMethod](testCase.pattern);

						expect(patternType).toBe(testCase.expectedType);
					}

					console.timeEnd(timeLabel);
				});
			});
		});
	}
});
