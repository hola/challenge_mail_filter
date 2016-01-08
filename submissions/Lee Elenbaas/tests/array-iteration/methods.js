module.exports = {
  'for..in': forInIteration,
  'for..of': forOfIteration,
  'forEach_arrow': ForEach_arrow,
  'forEach_function': ForEach_function,
  'for': ForIteration
};

function forInIteration(array, action) {
  for(var index in array)
    action(array[index]);
}

function forOfIteration(array, action) {
  for(var value of array)
    action(value);
}

function ForEach_arrow(array, action) {
  array.forEach(value => action(value));
}

function ForEach_function(array, action) {
  array.forEach(function(value) { action(value); });
}

function ForIteration(array, action) {
  var len = array.length;
  for(var i = 0; i<len;++i)
    action(array[i]);
}
