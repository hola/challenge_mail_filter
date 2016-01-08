function filter(messages, rules){
    var stack=[];    
    rules.forEach(function(element) {
        if(!(element.from === undefined)){
            element.from = element.from.replace(/\*/g,"(.)*");
            element.from = new RegExp(element.from.replace(/\?/g,"(.)?"));
        }
        if(!(element.to === undefined)){
            element.to = element.to.replace(/\*/g,"(.)*");
            element.to = new RegExp(element.to.replace(/\?/g,"(.)?"));
        }
    }, this);    
    for(var msg in messages){
       var result=[];
       var match=true;
       if(stack[messages[msg].from+messages[msg].to] === undefined){
            rules.forEach(function(element){
                    if(!(element.from === undefined))
                        if(messages[msg].from.match(element.from)==null)
                            match=false;
                    if(!(element.to === undefined)&&(match))
                        if(messages[msg].to.match(element.to)==null) 
                            match=false;          
                    (match) ? result.push(element.action):null;
                    match=true;
            }, this);       
            stack[messages[msg].from+messages[msg].to]=result;
       }else{
           result=stack[messages[msg].from+messages[msg].to];           
       }
       messages[msg] = result;
    }
    return messages;
}

exports.filter=filter;