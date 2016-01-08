"use strict";
module.exports.filter = function(mails,rules) {
    var ruleCount = rules.length,rule,
        mail,mailLine,
        i,str,j,
        mailFrom,mailFromLength,mailTo,mailToLength,add,
        ret=[];
    //from 
    function testQuestionFrom(){
        if(mailFromLength!==rule.fromLength){
            return false;
        }
        for(var fi=0;fi<rule.fromLength;fi++){
            if(rule.from[fi] !== mailFrom[fi]&&rule.from[fi]!=="?"){
                return false;
            }
        }
        return true;
    }
    function testOnlyFirstFrom(){
        if(mailFrom[0]!==rule.actionFromParam[0]){
            return false;
        }
        return mailFrom.indexOf(rule.actionFromParam)===0;
    }
    function testOnlyLastFrom(){
        var first=mailFromLength-rule.actionFromParam.length;
        if(mailFrom[first]!==rule.actionFromParam[0]){
            return false;
        }
        return mailFrom.indexOf(rule.actionFromParam,first)===first;
    }
    function testAllFrom(){
        var cur=0,fi,ti,cp,pos;
        var param=rule.actionFromParam;
        for(fi=0;fi<param.length;fi++){
            cp=param[fi];
            if(cp===""){
                continue;
            }
            if(mailFromLength-1<cur){
                return false;
            }
            if(mailFromLength-cur<cp.length){
                return false;
            }
            pos=0;
            if(fi<param.length-1){
                for(ti=cur;ti<=mailFromLength;ti++){
                    if(cp[pos]!==mailFrom[ti]&&cp[pos]!=="?"){
                        if(fi===0) return false;
                        cur++;
                        ti=cur-1;
                        pos=0;
                        if(mailFromLength-cur<cp.legtn){
                            return false;
                        }
                        continue;
                    }

                    pos++;
                    if(pos===cp.length){
                        break;
                    }
                }
                if(pos!==cp.length){
                    return false;
                }
                cur=ti+1;
            }else{
                for(ti=mailFromLength-cp.length;ti<mailFromLength;ti++){
                    if(cp[pos]!==mailFrom[ti]&&cp[pos]!=="?"){
                        return false;
                    }
                    pos++;
                }
            }            
        }
        return true;
    }    
    function testQuestionTo(){
        if(mailToLength!==rule.toLength){
            return false;
        }
        for(var fi=0;fi<rule.toLength;fi++){
            if(rule.to[fi] !== mailTo[fi]&&rule.to[fi]!=="?"){
                return false;
            }
        }
        return true;
    }
    function testOnlyFirstTo(){
        if(mailTo[0]!==rule.actionToParam[0]){
            return false;
        }
        return mailTo.indexOf(rule.actionToParam)===0;
    }
    function testOnlyLastTo(){
        var first=mailToLength-rule.actionToParam.length;
        if(mailTo[first]!==rule.actionToParam[0]){
            return false;
        }
        return mailTo.indexOf(rule.actionToParam,first)===first;    
    }
    function testAllTo(){
        var cur=0,fi,ti,cp,pos;
        var param=rule.actionToParam;
        for(fi=0;fi<param.length;fi++){
            cp=param[fi];
            if(cp===""){
                continue;
            }
            if(mailToLength-1<cur){
                return false;
            }
            if(mailToLength-cur<cp.length){
                return false;
            }
            pos=0;
            if(fi<param.length-1){
                for(ti=cur;ti<=mailToLength;ti++){
                    if(cp[pos]!==mailTo[ti]&&cp[pos]!=="?"){
                        if(fi===0) return false;
                        cur++;
                        ti=cur-1;
                        pos=0;
                        if(mailToLength-cur<cp.legtn){
                            return false;
                        }
                        continue;
                    }

                    pos++;
                    if(pos===cp.length){
                        break;
                    }
                }
                if(pos!==cp.length){
                    return false;
                }
                cur=ti+1;
            }else{
                for(ti=mailToLength-cp.length;ti<mailToLength;ti++){
                    if(cp[pos]!==mailTo[ti]&&cp[pos]!=="?"){
                        return false;
                    }
                    pos++;
                }
            }            
        }
        return true;
    }     
    for(i=0;i<ruleCount;i++){
        rule = rules[i];
        if(!rule.from || rule.from==="" || rule.from==="*"){
            rule.actionFrom=1;
        }else if(rule.from.indexOf("*")===-1){
            if(rule.from.indexOf("?")===-1){
                rule.actionFrom=2;
            }else{
                rule.actionFrom=3;
                rule.fromLength=rule.from.length;
            }
        }else{
            rule.actionFromParam=[];
            rule.fromLength=rule.from.length;
            str="";
            for(j=0;j<rule.fromLength;j++){
                if(rule.from[j]==="*"){
                    if(str)
                        rule.actionFromParam.push(str);
                    rule.actionFromParam.push("");
                    str="";
                }else{
                    str+=rule.from[j];
                }
            }
            if(str)
                rule.actionFromParam.push(str);
            rule.actionFrom=4;
            
            if(rule.actionFromParam.length===2){
                if(rule.actionFromParam[0]===''&&rule.actionFromParam[1]===''){
                    rule.actionFrom=1;
                }else if(rule.actionFromParam[0]!==''){
                    if(rule.actionFromParam[0].indexOf('?')===-1){
                        rule.actionFromParam=rule.actionFromParam[0];
                        rule.actionFrom=5;
                    }
                } else if(rule.actionFromParam[1]!==''){
                    if(rule.actionFromParam[1].indexOf('?')===-1){
                        rule.actionFromParam=rule.actionFromParam[1];
                        rule.actionFrom=6;
                    }
                }
            }
        }
        
        if(!rule.to || rule.to==="" || rule.to==="*"){
            rule.actionTo=1;
        }else if(rule.to.indexOf("*")===-1){
            if(rule.to.indexOf("?")===-1){
                rule.actionTo=2;
            }else{
                rule.actionTo=3;
                rule.toLength=rule.to.length;
            }
        }else{
            rule.actionToParam=[];
            rule.toLength=rule.to.length;
            str="";
            for(j=0;j<rule.toLength;j++){
                if(rule.to[j]==="*"){
                    if(str){
                        rule.actionToParam.push(str);
                    }
                    rule.actionToParam.push("");
                    str="";
                }else{
                    str+=rule.to[j];
                }
            }
            if(str)
                rule.actionToParam.push(str);
            rule.actionTo=4;
            if(rule.actionToParam.length===2){
                if(rule.actionToParam[0]===''&&rule.actionToParam[1]===''){
                    rule.actionTo=1;
                }else if(rule.actionToParam[0]!==''){
                    if(rule.actionToParam[0].indexOf('?')===-1){
                        rule.actionToParam=rule.actionToParam[0];
                        rule.actionTo=5;
                    }
                } else if(rule.actionToParam[1]!==''){
                    if(rule.actionToParam[1].indexOf('?')===-1){
                        rule.actionToParam=rule.actionToParam[1];
                        rule.actionTo=6;
                    }
                }
            }
        }
    }
    for(mail in mails){
        ret[mail]=[];
        mailLine=mails[mail];
        mailFrom=mailLine.from;
        mailFromLength=mailFrom.length;
        mailTo=mailLine.to;
        mailToLength=mailTo.length;
        for(i=0;i<ruleCount;i++){
            rule = rules[i];
            add=true;
            switch(rule.actionFrom){
                case 2: 
                    add = mailFrom===rule.from;
                    break
                case 3:
                    add = testQuestionFrom();
                    break;
                case 4:
                    add = testAllFrom();
                    break;
                case 5:
                    add = testOnlyFirstFrom();
                    break;
                case 6:
                    add = testOnlyLastFrom();
                    break;
            }
            if(!add) continue;
            switch(rule.actionTo){
                case 2: 
                    add = mailTo===rule.to;
                    break
                case 3:
                    add = testQuestionTo();
                    break;
                case 4:
                    add = testAllTo();
                    break;
                case 5:
                    add = testOnlyFirstTo();
                    break;
                case 6:
                    add = testOnlyLastTo();
                    break;
            }
            if(!add) continue;
            
            ret[mail].push(rule.action);
            
        }
    }
    return ret;
};


