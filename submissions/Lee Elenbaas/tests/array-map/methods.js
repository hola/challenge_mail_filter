module.exports = {
  'for..in': forInIteration,
  'for..of': forOfIteration,
  'map_arrow': map_arrow,
  'map_function': map_function,
  'for': ForIteration
};

function forInIteration(array, action) {
  var result = [];
  
  for(var index in array)
    result.push(action(array[index]));
    
  return result;
}

function forOfIteration(array, action) {
  var result = [];

  for(var value of array)
    result.push(action(value));
    
  return result;
}

function map_arrow(array, action) {
  return array.map(value => action(value));
}

function map_function(array, action) {
  return array.map(function(value) { action(value); });
}

function ForIteration(array, action) {
  var result = [];

  var len = array.length;
  for(var i = 0; i<len;++i)
    result.push(action(array[i]));
    
  return result;
}
