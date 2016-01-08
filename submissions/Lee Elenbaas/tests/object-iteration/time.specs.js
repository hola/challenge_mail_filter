
describe('time object-iteration methods:', () => {
	var methods = require('./methods');
	var config = require('./config');
	
	var iterationValues;
	
	beforeEach(() => {
		iterationValues = {
			object: {},
			action: () => {}
		};
		
		for(var i = 1; i <= config.numberOfProperties; ++i)
			iterationValues.object[config.propertyNamePrefix + i]=config.propertyValuePrefix + i;
			
		spyOn(iterationValues, 'action');
	});
	
	for(var method in methods)
		createIterationTest(method);

	function createIterationTest(iterationMethod) {
		it(iterationMethod, () => {
			var timeLabel = 'object-iteration using ' + iterationMethod;
			var iterationFunction = methods[iterationMethod];
			
			console.time(timeLabel);
			
			for (var i = 0; i < config.iterationRepeats; ++i)
				iterationFunction(iterationValues.object, iterationValues.action);
			
			console.timeEnd(timeLabel);
			
			expect(iterationValues.action.calls.count()).toBe(config.numberOfProperties * config.iterationRepeats);
		});
	}
});
