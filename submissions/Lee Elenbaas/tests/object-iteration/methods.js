module.exports = {
  'for..in': forInIteration,
  'Object.keys.forEach_arrow': ObjectKeys_ForEach_arrow,
  'Object.keys.forEach_function': ObjectKeys_ForEach_function,
  'Object.keys.for': ObjectKeys_For
};

function forInIteration(object, action) {
  for(var propName in object)
    action(object[propName]);
}

function ObjectKeys_ForEach_arrow(object, action) {
  Object.keys(object).forEach(propName => action(object[propName]));
}

function ObjectKeys_ForEach_function(object, action) {
  Object.keys(object).forEach(function(propName) { action(object[propName]); });
}

function ObjectKeys_For(object, action) {
  var keys = Object.keys(object);
  var len = keys.length;
  for(var i = 0; i<len;++i)
    action(object[keys[i]]);
}
