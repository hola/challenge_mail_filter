/**
 * Module for time-efficient check of e-mails array against number of rules with wildcard characters
 * Created by Andy5938 <andy5938ru@gmail.com> on December, 2015 for http://hola.org/challenge_mail_filter
 */

 /*
 * Variable naming conventions:
 *
 * - suffixes:
 *   all variable linked to field "From:" have suffix "-F"
 *   all variable linked to field "To:" have suffix "-T"
 *
 * - non-standard var prefixes:
 *   "h-" - hash (integer)
 *   "ab-" - array of boolean
 *   "ah-" - array of hash (integer)
 */


/**
 * Checks string for wildcard matching (time efficiently).
 * @param {string} sTame Analyzed string.
 * @param {string} sMask Mask for matching.
 * @return {boolean} "true" if matched
 */
function checkWild3Complete(sTame, sMask) {
    var iTameLPs = 0;
    var iMaskLPs = 0;
    // left determined part of Mask and Tame (LDET_PART)
    while (true) {
        if (sMask.length <= iMaskLPs) {
            // Mask has finished
            return (sTame.length <= iTameLPs);
        } else {
            // Mask has not finished
            if (sMask.charAt(iMaskLPs) == '*') break; // to RDET_PART (even if Tame has finished - to check if only "*" remained)
            if (sTame.length <= iTameLPs) {
                // Tame has finished (but Mask not and in Mask non-* symbol)
                return false;
            } else {
                // Tame & Mask both not finished, and Mask not *
                if ((sMask.charAt(iMaskLPs) == '?') || (sMask.charAt(iMaskLPs) == sTame.charAt(iTameLPs))) {
                    // symbols match - the only continue of DET_PART
                    ++iTameLPs;
                    ++iMaskLPs;
                } else {
                    // symbols not match
                    return false;
                }
            }
        }
    }
    var iTameRPs = sTame.length - 1;
    var iMaskRPs = sMask.length - 1;
    // right determined part of Mask and Tame (RDET_PART)
    // there is at least one '*' in Mask
    while (true) {
        // Mask cannot finish (there is at least one '*' in Mask)
        if (sMask.charAt(iMaskRPs) == '*') break; // to WILD_PART (even if Tame has finished - to check if only "*" remained)
        if (iTameRPs < iTameLPs) {
            // Tame has finished (but Mask not and in Mask non-* symbol) ('abcde' against 'abc*cde' iTameLPs->'d')
            return false;
        } else {
            // Tame & Mask both not finished, and Mask not *
            if ((sMask.charAt(iMaskRPs) == '?') || (sMask.charAt(iMaskRPs) == sTame.charAt(iTameRPs))) {
                // symbols match - the only continue of DET_PART
                --iTameRPs;
                --iMaskRPs;
            } else {
                // symbols not match
                return false;
            }
        }
    }
    var iTameBk; var iTameLen = iTameRPs + 1;
    var iMaskBk; var iMaskLen = iMaskRPs + 1;
    while (true) {
        // wildcard ('*') part of Mask (WILD_PART) - the first char of Mask is '*'
        while ((iMaskLPs < iMaskLen) && (sMask.charAt(iMaskLPs) == '*')) ++iMaskLPs;
        if (iMaskLen <= iMaskLPs) {
            // there were only '*' in Mask
            return true;
        }
        iTameBk = iTameLPs; // bookmarks more effective then (iTameLPs + iTameOffset)
        iMaskBk = iMaskLPs; // also they allow universality of variables with the first DET_PART
        while (true) {
            if (iMaskLen <= iMaskLPs) {
                // Mask has finished
                if (iTameLen <= iTameLPs) {
                    // Tame also has finished
                    return true;
                } else {
                    // Tame has not finished
                    if (iMaskBk == iMaskLPs) {
                        // Mask finishes with '*'
                        return true
                    } else {
                        // Mask finishes with '*x' but Tame has 'xy...' possibly 'xy..x'
                        ++iTameBk; iTameLPs = iTameBk; // moving forward point of search start in Tame
                        iMaskLPs = iMaskBk;
                        // really its a break of inner loop
                    }
                }
            } else {
                // Mask has not finished
                if (sMask.charAt(iMaskLPs) == '*') {
                    break; // to next wild block (break of outer loop)
                }
                if (iTameLen <= iTameLPs) {
                    // Tame has finished (but Mask not and in Mask non-* symbol)
                    return false;
                } else {
                    // Tame & Mask both not finished, and Mask not *
                    if ((sMask.charAt(iMaskLPs) == '?') || (sMask.charAt(iMaskLPs) == sTame.charAt(iTameLPs))) {
                        // symbols match
                        ++iTameLPs;
                        ++iMaskLPs;
                        // continue; the only continue of inner loop
                    } else {
                        // symbols not match
                        ++iTameBk; iTameLPs = iTameBk; // moving forward point of search start in Tame
                        iMaskLPs = iMaskBk;
                        // continue; really its a break of inner loop
                    }
                }
            }
        }
        // analyzing next wild block
    }
}


/** @const */ var HASH_CHAR_CNT = 4; // number of chars at mask's left-most position that are used for hash (3 or 4 recommended)
/** @const */ var COND_ABSENT = -2; // condition for "from" or "to" is absent (is equal to '*' or not exists)
/** @const */ var UNHASHABLE = -1; // condition for mask is unhashable (is shorter than HASH_CHAR_CNT symbols or contains wildchars in them)


/**
 * Represents first HASH_CHAR_CNT chars of mask as integer (if possible).
 * E.g. for (HASH_CHAR_CNT == 4) : h = (((((s[0] << 7) | s[1]) << 7) | s[2]) << 7) | s[3]
 * If length of mask is less than HASH_CHAR_CNT - function fails (return "UNHASHABLE")
 * If there is at least 1 wildcard in the first HASH_CHAR_CNT chars - function fails (return "UNHASHABLE")
 * @param {string} s Analyzed mask.
 * @return {int} Hashed value or "UNHASHABLE" if function fails
 */
function calcHashForMask(s){
    var h = UNHASHABLE;
    if (HASH_CHAR_CNT <= s.length){
        h = 0;
        var bGood = true;
        for (var iPs = 0; (iPs < HASH_CHAR_CNT) && bGood; iPs++){
            bGood &= (s.charAt(iPs) != '?') && (s.charAt(iPs) != '*');
            h = h * 128 + s.charCodeAt(iPs)
        }
        if (!bGood) h = UNHASHABLE;
    }
    return h
}


/**
 * Represents first HASH_CHAR_CNT chars of tame as integer (if possible).
 * E.g. for (HASH_CHAR_CNT == 4) : h = (((((s[0] << 7) | s[1]) << 7) | s[2]) << 7) | s[3]
 * If length of tame is less than HASH_CHAR_CNT - function fails (return "UNHASHABLE")
 * @param {string} s Analyzed tame.
 * @return {int} Hashed value or "UNHASHABLE" if function fails
 */
function calcHashForTame(s){
    var h = UNHASHABLE;
    if (HASH_CHAR_CNT <= s.length){
        h = 0;
        for (var iPs = 0; iPs < HASH_CHAR_CNT; iPs++){
            h = h * 128 + s.charCodeAt(iPs)
        }
    }
    return h
}


/** @const */ var CLAIM_CHAR_CNT = 4; // number of consecutive chars at mask that are used for hash-claims (3 or 4 recommended)
/** @const */ var CLAIM_MASK = 0x1fffff; // 2^((CLAIM_CHAR_CNT-1)*7)-1
/** @const */ var MAX_CLAIM_CNT = 3; // maximum number of claims (adding more claims is inefficient)
/** @const */ var CLAIM_BASE = 8803; // modulo for hash-claims calculation


/**
 * Generates array of maximum MAX_CLAIM_CNT hash values for occurences of CLAIM_CHAR_CNT consecutive chars of mask.
 * E.g. for (CLAIM_CHAR_CNT == 4) : h = ((((((s[i] << 7) | s[i+1]) << 7) | s[i+2]) << 7) | s[i+3]) % CLAIM_BASE
 * @param {string} s Analyzed mask.
 * @return {Array.<int>} Array of claim-hashes (possibly of zero length)
 */
function calcClaimsForMask(s){
    var ah = [];
    var iClaimCnt = 0;
    var iLastWCPos = -1;
    var h = 0;
    for (var iPs = 0; iPs < s.length; iPs++){
        if ((s.charAt(iPs) == '*') || (s.charAt(iPs) == '?'))
            iLastWCPos = iPs;
        h = ((h & CLAIM_MASK) << 7) | s.charCodeAt(iPs);
        if ((iLastWCPos + CLAIM_CHAR_CNT <= iPs) && (iClaimCnt < MAX_CLAIM_CNT*2)){
            if ((iClaimCnt % 2) == 0) ah.push(h % CLAIM_BASE);
            ++iClaimCnt;
        }
    }
    return ah
}


/** @const */ var CYCLIC_LRU_SIZE = 0x800; // size of cyclic Last-Recently-Used array

/**
 * Main filtering function.
 * @param {Object} msgIn Messages.
 * @param {Array.<Object>} ruleIn Rules.
 * @return {Object} Actions.
 */
function filter(msgIn, ruleIn) {

    var result = {};

    // preprocessing rules
    for (var iPreRule = 0; iPreRule < ruleIn.length; iPreRule++){
        var rulePre = ruleIn[iPreRule]; // link to fast access
        // deduplicating asterisks
        var iPrePs;
        rulePre.hFirstF = COND_ABSENT; // no "rulePre.from"
        //if (rulePre.hasOwnProperty('from')){              // ! uncomment if INHERITED properties are possible
        if (typeof rulePre.from !== 'undefined'){           // ! comment if INHERITED properties are possible
            iPrePs = 1;
            while (iPrePs < rulePre.from.length){
                if ((rulePre.from.charAt(iPrePs-1) == '*') && (rulePre.from.charAt(iPrePs) == '*')){
                    // if we found two consecutive '*' - shrink the second one
                    rulePre.from = rulePre.from.substr(0, iPrePs) + rulePre.from.substr(iPrePs+1);
                } else {
                    ++iPrePs
                }
            }
            if (rulePre.from == '*'){
                // if after deduplication field is a single '*' - mark this fact as special hash value
                rulePre.hFirstF = COND_ABSENT;
            } else {
                // trying to calc hash for first chars
                rulePre.hFirstF = calcHashForMask(rulePre.from);
                // trying to calc hash-claims for complete mask
                rulePre.ahClaimsF = calcClaimsForMask(rulePre.from);
            }
        }
        rulePre.hFirstT = COND_ABSENT; // no "rulePre.to"
        //if (rulePre.hasOwnProperty('to')){                // ! uncomment if INHERITED properties are possible
        if (typeof rulePre.to !== 'undefined'){             // ! comment if INHERITED properties are possible
            iPrePs = 1;
            while (iPrePs < rulePre.to.length){
                if ((rulePre.to.charAt(iPrePs-1) == '*') && (rulePre.to.charAt(iPrePs) == '*')){
                    // if we found two consecutive '*' - shrink the second one
                    rulePre.to = rulePre.to.substr(0, iPrePs) + rulePre.to.substr(iPrePs+1);
                } else {
                    ++iPrePs
                }
            }
            if (rulePre.to == '*'){
                // if after deduplication field is a single '*' - mark this fact as special hash value
                rulePre.hFirstT = COND_ABSENT;
            } else {
                // trying to calc hash for first chars
                rulePre.hFirstT = calcHashForMask(rulePre.to);
                // trying to calc hash-claims for complete mask
                rulePre.ahClaimsT = calcClaimsForMask(rulePre.to);
            }
        }
    }

    /* Cache management structures :
     * - cache : hash-table '{string} key (email) -> {int} position in LRU'
     * - lru : Last-Recently-Used fixed size (CYCLIC_LRU_SIZE) array of objects with properties:
     *     - sKey {string} : key (email)
     *     - iNewestPos {int} : link to newest position in LRU for this key
     *     - abMatched {Array.<boolean>} : cache of rule testing results
     */
    var cacheF = {}; // hash-table 'email -> lruPos' for "From:"
    var lruF = new Array(CYCLIC_LRU_SIZE); // LRU array for "From:"
    var cacheT = {}; // hash-table 'email -> lruPos' for "To:"
    var lruT = new Array(CYCLIC_LRU_SIZE); // LRU array for "To:"
    var iLRUPos = 0; // position in LRUs (cyclic modulo CYCLIC_LRU_SIZE)
    var bLRUCycled = false; // false on first cycle of LRU (in order to initialize arrays) and true later

    /* Claim-hashes management structures :
     * - claims {Array.<int>} : fixed size (CLAIM_BASE) array, containing iClaimMsgId at position iPos
     *   if field of this message contains this claim-hash in chars.
     *   So, for any claim included in rule's array ahClaims message must contain this claim in this array
     *   in order to match rule. The absence of any of claims - is hint for the fact that field doesn't match
     */
    var iClaimMsgId = 1;
    var claimsF = new Array(CLAIM_BASE).fill(0); // that's why large CLAIM_BASE value is inappropriate
    var claimsT = new Array(CLAIM_BASE).fill(0); // that's why large CLAIM_BASE value is inappropriate

    // main cycle
    for (var msgId in msgIn) {
        //if (msgIn.hasOwnProperty(msgId))                  // ! uncomment if INHERITED properties are possible
        {
            var resultMsg = [];

            // search in cache for "From:"
            var sFrom = msgIn[msgId].from; // link to fast access
            if (!bLRUCycled){
                // initializing LRU object and array "abMatched"
                lruF[iLRUPos] = {};
                lruF[iLRUPos].abMatched = new Array(ruleIn.length);
            }
            if ((bLRUCycled)&&(lruF[iLRUPos].iNewestPos == iLRUPos)){
                // there was only one occurence in LRU so delete link in "cacheF"
                delete cacheF[lruF[iLRUPos].sKey]
            }
            // at this moment lruF[iLRUPos].abMatched became orphaned if there was only one occurence in LRU
            var abMatchedF;
            var bFCached = (typeof cacheF[sFrom] !== 'undefined');
            if (bFCached){
                lruF[cacheF[sFrom]].iNewestPos = iLRUPos; // to mark that previous record in LRU is not the last and can be orphaned
                // swap arrays "abMatched" in order to not creating/destroying large memory objects
                var abTempF = lruF[iLRUPos].abMatched;
                lruF[iLRUPos].abMatched = lruF[cacheF[sFrom]].abMatched;
                lruF[cacheF[sFrom]].abMatched = abTempF;
                // since this moment previous LRU record [cacheF[sFrom]] is absolutely unconcerned to us
            }
            // write values to the new LRU object
            lruF[iLRUPos].iNewestPos = iLRUPos; // to mark that this record is the last now
            lruF[iLRUPos].sKey = sFrom;
            // extract (link to) cached "abMatched"
            abMatchedF = lruF[iLRUPos].abMatched;
            cacheF[sFrom] = iLRUPos; // cacheF now links to the newest LRU record
            // calculating hash and claims
            var hFirstF = calcHashForTame(sFrom);
            var hClaimF = 0;
            for (var iClaimFPs = 0; iClaimFPs < sFrom.length; iClaimFPs++){
                hClaimF = ((hClaimF & CLAIM_MASK) << 7) | sFrom.charCodeAt(iClaimFPs);
                if (CLAIM_CHAR_CNT - 1 <= iClaimFPs) claimsF[hClaimF % CLAIM_BASE] = iClaimMsgId;
            }

            // search in cache for "To:"
            var sTo = msgIn[msgId].to; // link to fast access
            if (!bLRUCycled){
                // initializing LRU object and array "abMatched"
                lruT[iLRUPos] = {};
                lruT[iLRUPos].abMatched = new Array(ruleIn.length);
            }
            if ((bLRUCycled)&&(lruT[iLRUPos].iNewestPos == iLRUPos)){
                // there was only one occurence in LRU so delete link in "cacheT"
                delete cacheT[lruT[iLRUPos].sKey]
            }
            // at this moment lruT[iLRUPos].abMatched became orphaned if there was only one occurence in LRU
            var abMatchedT;
            var bTCached = (typeof cacheT[sTo] !== 'undefined');
            if (bTCached){
                lruT[cacheT[sTo]].iNewestPos = iLRUPos; // to mark that previous record in LRU is not the last and can be orphaned
                // swap arrays "abMatched" in order to not creating/destroying large memory objects
                var abTempT = lruT[iLRUPos].abMatched;
                lruT[iLRUPos].abMatched = lruT[cacheT[sTo]].abMatched;
                lruT[cacheT[sTo]].abMatched = abTempT;
                // since this moment previous LRU record (cacheT[sTo]) is absolutely unconcerned to us
            }
            // write values to the new LRU object
            lruT[iLRUPos].iNewestPos = iLRUPos; // to mark that this record is the last now
            lruT[iLRUPos].sKey = sTo;
            // extract (link to) cached "abMatched"
            abMatchedT = lruT[iLRUPos].abMatched;
            cacheT[sTo] = iLRUPos; // cacheT now links to the newest LRU record
            // calculating hash and claims
            var hFirstT = calcHashForTame(sTo);
            var hClaimT = 0;
            for (var iClaimTPs = 0; iClaimTPs < sTo.length; iClaimTPs++){
                hClaimT = ((hClaimT & CLAIM_MASK) << 7) | sTo.charCodeAt(iClaimTPs);
                if (CLAIM_CHAR_CNT - 1 <= iClaimTPs) claimsT[hClaimT % CLAIM_BASE] = iClaimMsgId;
            }

            // processing
            for (var iRule = 0; iRule < ruleIn.length; iRule++) {
                var rule = ruleIn[iRule]; // link to fast access
                var bMatched = true;
                if (!bFCached){
                    // if cached array not found - check for matching
                    if (rule.hFirstF == COND_ABSENT){
                        // condition on field "From:" absent - match
                        abMatchedF[iRule] = true
                    } else {
                        if ((rule.hFirstF != UNHASHABLE) && (rule.hFirstF != hFirstF)){
                            // Mask has definite starting chars and they are not equal to Message field - matching failed
                            abMatchedF[iRule] = false;
                        } else {
                            var iRuleClaimFPs = 0;
                            var bClaimsCompliantF = true;
                            while ((iRuleClaimFPs < rule.ahClaimsF.length) && bClaimsCompliantF){
                                bClaimsCompliantF = (claimsF[rule.ahClaimsF[iRuleClaimFPs]] == iClaimMsgId);
                                ++iRuleClaimFPs;
                            }
                            if (!bClaimsCompliantF){
                                abMatchedF[iRule] = false;
                            } else {
                                // fast hints didn't succeed - do slow rigorous matching
                                abMatchedF[iRule] = checkWild3Complete(sFrom, rule.from);
                            }
                        }
                    }
                }
                bMatched &= abMatchedF[iRule]; // concern results (cached or checked) for "From:"
                if (!bTCached){
                    // if cached array not found - check for matching
                    if (rule.hFirstT == COND_ABSENT){
                        // condition on field "To:" absent - match
                        abMatchedT[iRule] = true
                    } else {
                        if ((rule.hFirstT != UNHASHABLE) && (rule.hFirstT != hFirstT)){
                            // Mask has definite starting chars and they are not equal to Message field - matching failed
                            abMatchedT[iRule] = false;
                        } else {
                            var iRuleClaimTPs = 0;
                            var bClaimsCompliantT = true;
                            while ((iRuleClaimTPs < rule.ahClaimsT.length) && bClaimsCompliantT){
                                bClaimsCompliantT = (claimsT[rule.ahClaimsT[iRuleClaimTPs]] == iClaimMsgId);
                                ++iRuleClaimTPs;
                            }
                            if (!bClaimsCompliantT){
                                abMatchedT[iRule] = false;
                            } else {
                                // fast hints didn't succeed - do slow rigorous matching
                                abMatchedT[iRule] = checkWild3Complete(sTo, rule.to);
                            }
                        }
                    }
                }
                bMatched &= abMatchedT[iRule]; // concern results (cached or checked) for "From:"
                if (bMatched){
                    resultMsg.push(rule.action);
                }
            }
            result[msgId] = resultMsg;
            ++iLRUPos;
            if (CYCLIC_LRU_SIZE == iLRUPos){
                iLRUPos = 0;
                bLRUCycled = true
            }
            iClaimMsgId = (iClaimMsgId + 1) % 0x7fffffff; // in order not to exceed int31
        }
    }
    return result
}

module.exports = filter;
