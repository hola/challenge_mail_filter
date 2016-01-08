function filter(m, r){
  var m1=[];
  for(var i in m) m1.push(i);
  m2=Object.keys(m).map(key => m[key]);
  m3=[];
  i=0;
  do{
    tmp=[];
    fromM=m2[i].from;
    a=0;
    do{
      if(r[a].to && r[a].from && r[a].to==m2[i].to && r[a].from==m2[i].from) tmp.push(r[a].action);
      else if(r[a].from && !r[a].to){
        fromR=r[a].from.split("@");
        if(fromR[0]=="*") fromR=fromR[1];
        else fromR=r[a].from;
        if(fromR==fromM.split("@")[1] || fromR==fromM) tmp.push(r[a].action);
      }
      else if(!r[a].from && r[a].to && r[a].to==m2[i].to) tmp.push(r[a].action);
    }while(a++<= r.length-2);
    m3.push(tmp);
  }while(i++<= m2.length-2);
  a=0;
  for(var i in m) {m[i]=m3[a];a++;}
  return m;
}