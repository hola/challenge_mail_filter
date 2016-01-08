/* 
 * Copyright (C) 2015 lee.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */


   function regexpMachine(prog,s) {
        var ip = 0, lPos = 0, rPos = s.length, onFailure = -1, newPos, go = true;
        while ( go ) {
            switch (prog[ip]) {
                // EQ
                case 0:
                    ip++;
                    if ( prog[ip] === s.substr(lPos,prog[ip].length)) {
                        lPos += prog[ip].length;
                        ip++;
                    } else {
                        if ( onFailure !== -1 ) {
                            ip = onFailure;
                            lPos = newPos;
                        } else {
                            return false;
                        }
                    }
                    break;
                // SRCH
                case 1:
                    ip++;
                    newPos = s.indexOf(prog[ip], lPos );
                    if ( newPos !== -1 ) {
                        lPos = newPos + prog[ip].length;
                        newPos++;
                        ip++;
                    } else {
                        return false;
                    }
                    break;
                // ANY '?' - skip N characters
                case 2:
                    ip++;
                    lPos += prog[ip];
                    ip++;
                    break;
                // SET onFailure
                case 3:
                    ip++;
                    onFailure = prog[ip];
                    ip++;
                    break;
                // restore lPos rPos
                case 5:
                    ip++;
                    if ( lPos !== s.length ) {
                        return false;
                    }
                    rPos = s.length - prog[ip];
                    lPos = 0;
                    ip++;
                    break;
                // POS set lPos
                case 4:
                    ip++;
                    lPos = s.length - prog[ip];
                    ip++;
                    break;
                // STOP machine
                case 6:
                    go = false;
                    break;
            }
            if ( lPos > rPos )
                return false;
        }
        return true;
    }

    function compileArray(prog,a) {
        for ( var i = 0; i < a.length; i++ ) {
            if ( a[i] !== '' ) {
                prog.push(0,a[i]);
            } 
            if ( ( i > 0 ) && prog[ prog.length - 2 ] === 2 ) {
                prog[ prog.length - 1 ]++;
            } else {
                prog.push(2,1);
            }
        }
        if ( prog[ prog.length - 1 ] > 1 ) {
                prog[ prog.length - 1 ]--;
        } else {
            prog.pop();
            prog.pop();
        }
    }

    function compileArray2(prog,a) {
        var i;
        for ( i = 0; i < a.length && a[i] === '' ; i++ );
        if ( i > 0 )
            prog.push(2,i);
        if ( i >= a.length ) {
            prog[prog.length - 1]--;
            return;
        }
        prog.push(3,prog.length + 2);
        prog.push(1,a[i++]);
        for ( ; i < a.length; i++ ) {
            if ( ( i > 0 ) && prog[ prog.length - 2 ] === 2 ) {
                prog[ prog.length - 1 ]++;
            } else {
                prog.push(2,1);
            }
            if ( a[i] !== '' ) {
                prog.push(0,a[i]);
            }
        }
    }

    function compileRegexp(r) {
        var rStruct, prog = new Array(0);
        rStruct = r ? r.replace(/\*+/g,'*').split('*').map(function(p){ return p.split('?'); }) : [];
        if (rStruct.length === 1 ) {
            compileArray(prog,rStruct[0]);
            prog.push(5,0);
        } else if (rStruct.length > 1 ) {
            RLen = rStruct[rStruct.length - 1].reduce(function(sum, current) { return sum + current.length + 1; }, 0) - 1;
            if ( RLen > 0 ) {
                prog.push(4,RLen);
                compileArray(prog,rStruct[rStruct.length - 1]);
                prog.push(5,RLen);
            }
            if ( rStruct[0].length > 1 || rStruct[0][0].length > 0 ) {
                compileArray(prog,rStruct[0]);
            }
            for ( var i = 1; i < rStruct.length - 1; i++) {
                compileArray2(prog,rStruct[i]);
            }
            
        }
        prog.push(6,0);
        return prog;
    }

    function smartfilterY(msgs, acts) {
        var res = {}, a, matchCacheFrom = {} , matchCacheTo = {} , tmpfrom, tmpto, progf = [], progt = [],
                arrLen = (acts.length>>5) + 1, tmpmapto, tmpmapfrom;
        for (var e = 0; e < acts.length; e++) {
            progf[e] = compileRegexp (acts[e].from);
            progt[e] = compileRegexp (acts[e].to);
        }
        for (var m in msgs) {
            tmpfrom = msgs[m].from;
            tmpto   = msgs[m].to;
            tmpmapfrom = matchCacheFrom[tmpfrom];
            tmpmapto   = matchCacheTo  [tmpto];
            a = [];
            if ( ( ! tmpmapfrom ) && ( ! tmpmapto ) ) {
                tmpmapto   = new Array( arrLen );
                tmpmapto.fill(0);
                for (var i = 0; i < acts.length; i++) {
                    if ( regexpMachine(progt[i], tmpto) ) {
                        tmpmapto[ i>>5 ] |= 1 << ( i&31 );
                        if ( regexpMachine(progf[i], tmpfrom) )
                            a[a.length] = acts[i].action;
                    }
                }
                matchCacheTo  [tmpto]   = tmpmapto;
            } else if ( ! tmpmapto ) {
                tmpmapto = new Array( arrLen );
                tmpmapto.fill(0);
                for (var i = 0; i < acts.length; i++) {
                    if ( regexpMachine(progt[i], tmpto) ) {
                        tmpmapto[ i>>5 ] |= 1 << ( i&31 );
                        if ( tmpmapfrom[ i>>5 ] & ( 1 << ( i&31 )) )
                            a[a.length] = acts[i].action;
                    }
                }
                matchCacheTo[tmpto] = tmpmapto;
            } else if ( ( ! tmpmapfrom ) ) {
                tmpmapfrom = new Array( arrLen );
                tmpmapfrom.fill(0);
                for (var i = 0; i < acts.length; i++) {
                    if ( regexpMachine(progf[i], tmpfrom) ) {
                        tmpmapfrom[ i>>5 ] |= 1 << ( i&31 );
                        if ( tmpmapto[ i>>5 ] & ( 1 << ( i&31 )) )
                            a[a.length] = acts[i].action;
                        }
                }
                matchCacheFrom[tmpfrom] = tmpmapfrom;
            } else {
                for (var i = 0; i < acts.length; i++) {
                    if (  tmpmapto[i>>5] & tmpmapfrom[i>>5] & ( 1 <<(i&31)) ) {
                        a[a.length] = acts[i].action;
                    }
                }
            }
            res[m] = a;
        }
        return res;
    }
    
    module.exports.filter = smartfilterY;

