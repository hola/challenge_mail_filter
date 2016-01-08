/**
 * 
 * @param {string} haysack the string to search in
 * @param {string} needle the item we are searching for
 * @returns {int} -1 if there is no match or the start index of the match
 */
var search = function(haysack, needle){
    
    //O(nm) string matching algorithm
    
    var n = haysack.length;
    var m = needle.length;
    if(n < m)   return -1;
    else{
        
        for(var i=0;i<=n-m;i++){
           var bad = false;
            for(var j = i;j<=i+m-1;j++){
                //console.log(j+" "+haysack.charAt(j)+" "+needle.charAt(j-i));
                if(needle.charAt(j-i) === '?')    continue;
                if(haysack.charAt(j) !== needle.charAt(j-i)){
                    bad = true;
                    break;
                }
            }
            
            if(bad) continue;
            else{
                return i;
            }
        }
        return -1;
    }
}
/**
 * 
 * @param {type} firstString A rule
 * @param {type} secondString A string
 * @returns {boolean} returns true if both strings match and false otherwise
 * 
 * Some tests
 * simpleMatch("a*bc?d", "fdkdkfhe")
 */
var simpleMatch = function(S, T) {
    /**
     * 
     * state
     * 0 basic
     * 1 aesterisk
     * 2 error
     * 4 done
     */
    //TODO: Implement this
    /**
     * 
     * x is the first un-processed index of T
     * y is the last processed index of S
     * 
     */
    var x = 0;
    var y = -1;
    var state = 0; //basic state
    var n = T.length; //x
    var m = S.length; //y
    var out = "";
    
    //O(n+m)
    //S.charAt(y+1)
    while(true) {
        //console.log(S.charAt(y+1)+" "+T.charAt(x)+" "+state);
        if(state===0){
            //console.log(S.charAt(y+1)+" "+T.charAt(x));
            if(S.charAt(y+1) !== '*'){
                //must match a character
                if(S.charAt(y+1) === '?'){
                    
                    x+=1;
                    y+=1;
                    state=0; //state is still basic
                }else{
                    var t = S.charAt(y+1);
                    if(x < n && t === T.charAt(x)){
                        //console.log(t+" "+T.charAt(x));
                        x+=1;
                        y+=1;
                        state=0;
                    }else{
                        state = 2;
                    }
                }
            }
            else{
                //change of state to state==1
                state = 1;
                y+=1;
                out = "";
            }
        }
        else if(state===1){
            
            if(S.charAt(y+1) !== '*'){
                
                out += S.charAt(y+1);
                y+=1;
                
            }
            else{
                if(out.length > 0){
                    //take T[x..n-1]
                    var toMatch = T.substring(x, T.length);
                    
                    var id = search(toMatch, out);
//                    console.log(toMatch+" "+id+" "+out);
//                    return;
                    if(id === -1){
                        state = 2;
                    }else{
                        y+=1;
                        x+=(id+out.length);
                        //console.log(x)
                        state = 1;
                        out = "";
                    }
                }
                //consecutive asterisks
                else{
                    y+=1;
                    state=1;
                }
            }
        }
        
        
        //post- processing
        if(state === 2){
            break;
        }
        
        if(y < m-1 && x <=n-1){
           // console.log("continur work");
            continue;
        }
        else if(y < m-1 && x >=n){
            
            if(state===0){
                continue;
            }
            else if(state === 1){
                if(out.length===0){
                    continue;
                }else{
                    state=2;
                    break;
                }
            }
        }
        else if(y==m-1 && x<=n-1){
            if(state === 0){
                state = 2;
                break;
            }else if(state === 1){
                if(out.length===0){
                    state = 3;
                    break;
                }else{
                    
                    if(n-out.length >= x){
                        var toMatch = T.substring(n-out.length, n);
                        //console.log(toMatch);
                        if(out === toMatch){
                            state = 3;
                            
                        }else{
                            state = 2;
                        }
                    }
                    else{
                        state = 2;
                    }
                    
                    break;
                }
            }
        }
        else if(y==m-1 && x>=n){
            
            if(state === 0){
                state = 3;
                break;
            }
            else if(state === 1){
                if(out.length == 0){
                    state = 3;
                    break;
                }else{
                    state = 2;
                    break;
                }
            }
        }
    }
    
    if(state === 2) return false;
    else if(state ==3)  return true;
    
}
var filter = function(messages, rules){
    
    /**
     * FIRST SOLUTION
     * Brute Force Style
     * 
     * @param messages: mapping of ids to objects with two properties. from and to
     * @param {Array} rules An array of objects with properties of from(optional), to(optional), action(mandatory)
     * 
     * @return {object} Mapping of ids to arrays of actions to be performed on them
     */
    //TODO: Implement this
//    var pattern = 'a*b*fabc';
//    var text = 'abfabc';
//    console.log(simpleMatch(pattern, text));

    var result = {};
    
    for(var key in messages){
        if(messages.hasOwnProperty(key)){
            //console.log(key);
            result[key] = [];
        }
    }
    
    for(var i=0; i<rules.length; i++){
        
        var rule = rules[i];
        //console.log(rule.from+" "+rule.to);
        for(var key in messages){
            
            var message = messages[key];
            
            //case 1
            if(!('from' in rule) && !('to' in rule)){
                
                result[key].push(rule.action);
            }
            
            //case 2
            else if(!('from' in rule)  && ('to' in rule) && simpleMatch(rule.to, message['to'])){
                //console.log(rule.to+" "+message['to']+" "+rule.action);
                result[key].push(rule.action);
            }
            else if(!('to' in rule) && ('from' in rule) && simpleMatch(rule.from, message['from'])){
                
                result[key].push(rule.action);
            }
            else if(('from' in rule) && ('to' in rule) && simpleMatch(rule.from, message['from']) && simpleMatch(rule.to, message['to'])){
//                console.log("hey" +JSON.stringify(rule));
                result[key].push(rule.action);
            }
        }
    }
    
    return result;

};

exports.filter=filter;