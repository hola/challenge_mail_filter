exports.filter = function (objMsg,arRules) {
    var resObj={};

    function defineArActions(curMsg, arRules) {
        var arActions=[];

        function checkRule(msg, rul) {
            if(rul==undefined){
                return 1;
            } else {
                var posRul = 0;
                var posMsg = 0;

                while (posRul < rul.length) {

                    if (rul[posRul] == "*") {
                        if (posRul == (rul.length - 1)) { // if star is last symbol
                            return 1;
                        }
                        posRul++;

                        var posNextStar=rul.length;
                        for(var i=posRul;i<posNextStar;i++){
                            if(rul[i]=="*") {
                                posNextStar=i;
                                break;
                            }
                        }

                        var lastCheckingPos=msg.length-posNextStar+posRul+1;
                        var flagOk;
                        for(var i=posMsg;i<lastCheckingPos;i++){
                            flagOk=1;
                            var shiftPosMsg=i-posRul;
                            for(var j=posRul;j<posNextStar;j++){
                                if(rul[j]=="?"){
                                    continue;
                                }
                                if(msg[shiftPosMsg+j]!=rul[j]){
                                    flagOk=0;
                                    break;
                                }
                            }
                            if(flagOk==1){
                                posMsg=shiftPosMsg+posNextStar;
                                posRul=posNextStar;
                                break;
                            }
                        }
                        if(flagOk==0){
                            return 0; // no such mask found
                        }
                    } else {
                        if (rul[posRul] != "?") {
                            if (rul[posRul] != msg[posMsg]) {
                                return 0;
                            }
                        } else {
                            if(msg[posMsg]==undefined)
                                return 0;
                        }
                        posRul++;
                        posMsg++;
                    }
                }
                if((msg[posMsg]!=undefined)&&(posNextStar==undefined)) {
                    return 0;
                }
            }
            return 1 ;
        }

        for (var i = 0; i < arRules.length; i++) {
            if(checkRule(curMsg.from, arRules[i].from)==0){
                continue;
            }
            if ((checkRule(curMsg.to, arRules[i].to))==1){
                arActions.push(arRules[i].action);
            }
        }
        return arActions;
    }

    for(var key in objMsg){
        resObj[key]=defineArActions(objMsg[key],arRules);
    }
    return resObj;
}
