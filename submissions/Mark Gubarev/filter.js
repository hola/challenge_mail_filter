'use strict';

/**
 * @author Mark Gubarev <konstruilo@gmail.com>
 */

// Compiled regexps
let objCompiledRule = {};

// Regexp for escaping not specified patterns
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
    reHasRegExpChar = RegExp(reRegExpChar.source);

/**
 * Returns filtered messages by mask
 * @param {Object} objMessage
 * @param {Array} aryRule
 * @returns {Object}
 */
exports.filter = function (objMessage, aryRule)
 {
  let objResult    = {},
      aryCondition = [];

  // Transform rule patterns to regex
  for (let objRule of aryRule)
   {
    // Field `from`
    if (objRule.from && !(objRule.from in objCompiledRule))
     {
      objCompiledRule[objRule.from] = '';

      for (let intIndex = 0, strTemp = '', intTemp = 0, intRuleLen = objRule.from.length; intIndex < intRuleLen; intIndex++)
       {
        if (objRule.from[intIndex] === '*')
         {
          while (intIndex < intRuleLen && objRule.from[intIndex + 1] === '*')
           {
            intIndex++;
           }
          objCompiledRule[objRule.from] += '.*';
         }
        else if (objRule.from[intIndex] === '?')
         {
          intTemp = 1;
          while (intIndex < intRuleLen && objRule.from[intIndex + 1] === '?')
           {
            intTemp += 1;
            intIndex += 1;
           }
          objCompiledRule[objRule.from] += `.{${ intTemp }}`;
         }
        else
         {
          strTemp = objRule.from[intIndex];
          while (intIndex < intRuleLen - 1 && objRule.from[intIndex + 1] !== '*' && objRule.from[intIndex + 1] !== '?')
           {
            strTemp += objRule.from[++intIndex];
           }

          if (reHasRegExpChar.test(strTemp))
           {
            strTemp = strTemp.replace(reRegExpChar, '\\$&');
           }

          objCompiledRule[objRule.from] += strTemp;
         }
       }

      objCompiledRule[objRule.from] = new RegExp(objCompiledRule[objRule.from]);
     }

     // Field `to`
     if (objRule.to && !(objRule.to in objCompiledRule))
      {
       objCompiledRule[objRule.to] = '';

       for (let intIndex = 0, strTemp = '', intTemp = 0, intRuleLen = objRule.to.length; intIndex < intRuleLen; intIndex++)
        {
         if (objRule.to[intIndex] === '*')
          {
           while (intIndex < intRuleLen && objRule.to[intIndex + 1] === '*')
            {
             intIndex++;
            }
           objCompiledRule[objRule.to] += '.*';
          }
         else if (objRule.to[intIndex] === '?')
          {
           intTemp = 1;
           while (intIndex < intRuleLen && objRule.to[intIndex + 1] === '?')
            {
             intTemp += 1;
             intIndex += 1;
            }
           objCompiledRule[objRule.to] += `.{${ intTemp }}`;
          }
         else
          {
           strTemp = objRule.to[intIndex];
           while (intIndex < intRuleLen - 1 && objRule.to[intIndex + 1] !== '*' && objRule.to[intIndex + 1] !== '?')
            {
             strTemp += objRule.to[++intIndex];
            }

           if (reHasRegExpChar.test(strTemp))
            {
             strTemp = strTemp.replace(reRegExpChar, '\\$&');
            }

           objCompiledRule[objRule.to] += strTemp;
          }
        }

       objCompiledRule[objRule.to] = new RegExp(objCompiledRule[objRule.to]);
      }

    // Push to aryCondition all current filters(compiled) with actions
    aryCondition.push
     (
       {
        action: objRule.action,
        compiled:
         {
          to: objCompiledRule[objRule.to],
          from: objCompiledRule[objRule.from]
         }
       }
     );
   }

  // Iterate through all messages by message object name
  for (let strMessage_Name in objMessage)
   {
    // Set default result
    objResult[strMessage_Name] = objResult[strMessage_Name] || [];

    // Iterate through all conditions
    for (let objCondition of aryCondition)
     {
      let blnMatches = true;

      if (objCondition.compiled.from)
       {
        blnMatches = objCondition.compiled.from.test(objMessage[strMessage_Name].from);
       }

      if (blnMatches && objCondition.compiled.to)
       {
        blnMatches = objCondition.compiled.to.test(objMessage[strMessage_Name].to);
       }

      if (blnMatches)
       {
        objResult[strMessage_Name].push(objCondition.action);
       }
     }
   }

  return objResult;
 };
