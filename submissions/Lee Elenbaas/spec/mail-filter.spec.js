
describe('validate mail-filter against test-cases:', () => {
	var cases = require('./test-cases');
	var mailFilter = require('../mail-filter');

	cases.forEach(testCase => {
    if (testCase.disabled){
      xit(testCase.name);
    }
    else {
	    it(testCase.name, () => {
				console.time(testCase.name);

        var result = mailFilter(testCase.messages, testCase.rules);

				console.timeEnd(testCase.name);

        expect(result).toEqual(testCase.expectedResult);
      });
    }
	});
});
