 
 

function cps(s1, s2) {
    if (s1 == "") return true;
    for (var l = s1.length; l >= 0; l--)
        if (s1[l] != "?" && s1[l] != s2[l]) return false;

    return true;
}

function grammarParse(grammar, str) {

    //длина грамматики
    var lenghg = grammar.length;
    var temp = '';
    var star = false;
    var
    //начало подстроки грамматики первого вхождения
        bGF,
        //конец подстроки грамматики первого вхождения
        eGF,
        //начало подстроки строки первого вхождения
        bSF,
        //конец подстроки строки первого вхождения
        eSF,
        //начало подстроки грамматики последнего вхождения
        bGL = lenghg - 1,
        //конец подстроки грамматики последнего вхождения
        eGL = bGL,
        //начало подстроки строки последнего вхождения
        bSL = str.length - 1,
        //конец подстроки строки последнего вхождения
        eSL = bSL;





    // первые вхождения
    for (eGF = 0; eGF < lenghg; eGF++) {
        if (grammar[eGF] == "*") {
            star = true;
            break;
        }
        else {
            if (eGF > bSL) return false;
            if (grammar[eGF] != str[eGF] && grammar[eGF] != "?")
                return false;
        }
    }



    if (eGF == lenghg) {
        if (star || lenghg == str.length) return true;
        else return false;
    }
    else {
        bGF = eGF + 1;
        bSF = eGF;
        eSF = bSF;
        // последнее вхождение
        while (grammar[bGL] != "*") bGL--;
        if (eGL - bGL > bSL - eSF + 1) return false;
        else {
            var sz = eGL - bGL;
            if (!cps(grammar.substring(bGL + 1, eGL + 1), str.substring(eSL - sz + 1, eSL + 1)))
            return false;
            
            bSL=eSL-sz;
            eSL=bSL;
            eGL=bGL;
            bGL--;
            eGF=bGF;
        }
        
        

    }
               
/////////// внутренние вхождения  


   while(eGF<bGL)
              {
              while(grammar[eGF]!="*") {eGF++; eSF++;}
                temp=grammar.substring(bGF,eGF);
                 while(!cps(temp,str.substring(bSF,eSF)))
                 {
                     if(eSF>bSL )  return false;
                      bSF++; eSF++;
                     
                  }  
                  
                
               if(eGF>=bGL) return true;
               else
               {
                  eGF++; bGF=eGF; 
                  bSF=eSF;
               while(grammar[bGL]!="*") {bGL--; bSL--;}
                temp=grammar.substring(bGL+1,eGL);
                 while(!cps(temp,str.substring(bSL+1,eSL+1)))
                    {
                     if(eSF>bSL )  return false;
                      bSL--; eSL--;
                     
                     }
                     eGL=bGL; bGL--;
                     
               }
    
              }




    return true;

}

function is_array (a) {
    return (is_object(a)) && (a instanceof Array);
}

function is_object(a) {
    return (typeof a == "object");
}

exports.filter = function (messages,rules)
{

 //   if(!is_object(messages)) return 'messages is not an object';
 //   if(!is_array(rules)) return 'rules is not an array';
    
    var result = [];
    var patternFrom;
    var patternTo;
    var defaultAction;
    var msgFrom;
    var msgTo;
    
   

    for(var msg in messages)
    {
        
        result[msg] = [];
        
       
            for(var rule in rules){
                patternFrom = "*";
                patternTo = "*";
                defaultAction = "";
                msgFrom = false;
                msgTo = false;
                
                if(rules[rule].action) defaultAction = rules[rule].action;
                if(rules[rule].from) patternFrom = rules[rule].from;
                if(rules[rule].to) patternTo = rules[rule].to;
                
                if(messages[msg].from) msgFrom = grammarParse(patternFrom,messages[msg].from);
                if(messages[msg].to) msgTo = grammarParse(patternTo,messages[msg].to);
                
                if( msgFrom===true && msgTo===true )
                        result[msg].push(defaultAction);
         }
         
         
         //console.log("\n\nPROCESSING["+msg+"]...time:"+(Date.now()-start)+"    "+result[msg].toString());
         //console.log("\n\nPROCESSING["+msg+"]...time:"+(Date.now()-start));
        
    }
    
    
    //console.log("FINISHED:"+(Date.now()-start));
    
    return result;
    
};




/*
console.log(filter({
    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
    msg3: {from: 'boss@work.com', to: 'jack@example.com'}
}, [
    {from: '*@work.com', action: 'tag work'},
    {from: '*@spam.com', action: 'tag spam'},
    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
]));*/
