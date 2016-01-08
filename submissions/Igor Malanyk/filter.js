var filter = function ( messages, rules ) {
  var filters = [];
  var result = {};

  filtersToStandart( rules, filters );
  calculate( messages, Object.keys(messages), filters, result);

  return result;
}

filtersToStandart = function ( filters, output ) {
  if(!filters.length) return;
  var el = filters.pop();
  filtersToStandart( filters, output );

  var frm = (el.from) ? (el.from).split("@") : ["*", "*"];
  var to  = (el.to) ? (el.to).split("@") : ["*", "*"];
  output.push([
    ((frm[0] == "*") ? "[A-z-.*]*" : frm[0]) + "@" +
    ((frm[1] == "*") ? "[A-z-.*]*" : frm[1]) + ", " +
    ((to[0] == "*") ? "[A-z-.*]*" : to[0]) + "@" +
    ((to[1] == "*") ? "[A-z-.*]*" : to[1]),
    el.action
  ]);
}

calculate = function ( message, keys, filters, result ) {
  if(!filters.length) return;
  var el = filters.pop();
  var reg = new RegExp( el[0] );

  for(var i=0; i<keys.length; i++){
    result[ keys[i] ] = result[ keys[i] ] || [];
    if( reg.test( message[ keys[i] ].from + ", " + message[ keys[i] ].to ) ){
      result[ keys[i] ].push( el[1] );
    }
  }

  calculate( message, keys, filters, result );
}

module.exports = filter;
