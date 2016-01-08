
describe('time array-map methods:', () => {
	var methods = require('./methods');
	var config = require('./config');
	
	var iterationValues;
	
	beforeEach(() => {
		iterationValues = {
			array: [],
			action: () => {}
		};
		
		for(var i = 1; i <= config.numberOfValues; ++i)
			iterationValues.array.push(config.valuePrefix + i);
			
		spyOn(iterationValues, 'action');
	});
	
	for(var method in methods)
		createIterationTest(method);

	function createIterationTest(iterationMethod) {
		it(iterationMethod, () => {
			var timeLabel = 'array-map using ' + iterationMethod;
			var iterationFunction = methods[iterationMethod];
			
			console.time(timeLabel);
			
			for (var i = 0; i < config.iterationRepeats; ++i)
				iterationFunction(iterationValues.array, iterationValues.action);
			
			console.timeEnd(timeLabel);
			
			expect(iterationValues.action.calls.count()).toBe(config.numberOfValues * config.iterationRepeats);
		});
	}
});
