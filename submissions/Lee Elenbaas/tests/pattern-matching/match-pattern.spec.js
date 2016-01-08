
describe('Pattern', () => {
	var testCases = require('./match-pattern-test-cases');
	var Pattern = require('./match-pattern');
	
	testCases.forEach(testCase => {
		it(testCase.name, () => {
			var pattern = new Pattern(testCase.pattern);
			
			var result = pattern.test(testCase.text);
			
			expect(result).toBe(testCase.expectedResult);
		});
	});
});
