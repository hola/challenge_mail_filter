function is_match(s, p, osi, opi) {
  var sI = osi, pI = opi;
  while(s[sI]) {
    if(!p[pI]) return false;
    if(p[pI] == '*') {
      while(p[pI] == '*') pI++;
      if(!p[pI]) return true;
      while(s[sI]) {
        if( is_match(s, p, sI++, pI) ) return true;
      }
      return false;
    }
    if( s[sI] != p[pI] && p[pI] != '?' ) return false;
    pI++;
    sI++;
  }
  while(p[pI] == '*') pI++;
  return !p[pI];
}

function filter(m, r) {
  var out = {};
  var mcache = new Map();
  var tm, key, fi;

  var fl = r.length;
  var mkeys = Object.keys(m);

  for(var mi = 0, ml = mkeys.length; mi < ml; mi++) {
    tm = m[mkeys[mi]];

    // cache addition
    key = tm.from+tm.to;
    if(mcache.has(key)) {
      out[mkeys[mi]] = out[ mkeys[mcache.get(key)] ];
      continue;
    }
    mcache.set(key, mi);
    ////

    var ta = [];

    for(fi = 0; fi < fl; fi++ ){
      if(
        ( !r[fi].from || is_match(tm.from, r[fi].from, 0, 0) ) &&
        ( !r[fi].to || is_match(tm.to, r[fi].to, 0, 0) )
      )
        ta.push(r[fi].action);
    }

    out[mkeys[mi]] = ta;
  }

  return out;
}

exports.filter = filter;
