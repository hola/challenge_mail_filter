describe('PatternPart', () => {
	var PatternPart = require('./match-pattern-part');
	
	it('ctor', () => {
		var part = new PatternPart('sample', 5);
		
		expect(typeof part).toBe('object');
		expect(part instanceof PatternPart).toBe(true);
		expect(part.length).toBe(6);
		expect(part.leaveSpaceAfter).toBe(5);
		expect(typeof part.matchAt).toBe('function');
		expect(typeof part.matchFrom).toBe('function');
	});
	
	var testCases = require('./match-pattern-part-test-cases');
	
	function createMethodTests(method) {
		describe(method, ()=> {
			testCases[method].forEach(testCase => {
				it(testCase.name, () => {
					var part = new PatternPart(testCase.part, testCase.leaveSpaceAfter);
			
					var result = part[method](testCase.text, testCase.index);
			
					expect(result).toBe(testCase.expectedResult);
				});
			});
		});
	}
	
	for(var method in testCases)
		createMethodTests(method);
});
