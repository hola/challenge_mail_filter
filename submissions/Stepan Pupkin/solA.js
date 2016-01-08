function filter(messages, rules)
{
	var fromMatch = [], toMatch = [], filterActions =[];
	for (var i = 0; i < rules.length; i++)
	{
		var filter = rules[i];
		if (filter.from)
		{
			var parts = filter.from.split('*');
			fromMatch.push(parts);
		}
		else
		{
			fromMatch.push(null);
		}
		if (filter.to)
		{
			parts = filter.to.split('*');
			toMatch.push(parts);
		}
		else
		{
			toMatch.push(null);
		}
		filterActions.push(filter.action);
	}

	// main loop
	var result = {};
	var keys = Object.keys(messages);
	for (var m = 0, keysLen = keys.length; m < keysLen; m++)
	{
		var id = keys[m];
		var email = messages[id];
		var actions = [];
		// go through filters
		var rulesLen = rules.length;
		for (i = 0; i < rulesLen; i++)
		{
			if (fromMatch[i] && !match(email.from, fromMatch[i]))
			{
				continue;
			}
			if (toMatch[i] && !match(email.to, toMatch[i]))
			{
				continue;
			}
			actions.push(filterActions[i]);
		}
		result[id] = actions;
	}
	return result;
}

// tests if an email match a pattern
function match(email, charPieces)
{
	var mask = charPieces[0];
	var maskLen = mask.length;

	if (email.length <= maskLen)
	{
		return false;
	}

	if (charPieces.length == 1 && email.length != maskLen)
	{
		return false;
	}

	for (var i = 0; i < maskLen; i++)	// check first part
	{
		var code = mask.charCodeAt(i);
		if (code != 63 && email.charCodeAt(i) != code)
		{
			return false;
		}
	}

	if (charPieces.length == 1)
	{
		return email.length == maskLen;
	}

	var pieceIdx = 1;
	var index = maskLen;
	mask = charPieces[1];
	maskLen = mask.length;
	var maxIndex = email.length - maskLen;

	if (charPieces.length == 2)	// last piece
	{
		if (index <= maxIndex)
		{
			index = maxIndex;
		}
	}

main:
	while (index <= maxIndex)
	{
		for (i = 0; i < maskLen; i++)
		{
			code = mask.charCodeAt(i);
			if (code != 63 && email.charCodeAt(index + i) != code)
			{
				index++;
				continue main;
			}
		}
		index += mask.length;
		pieceIdx++;
		if (pieceIdx == charPieces.length)
		{
			return true;
		}
		mask = charPieces[pieceIdx];
		maskLen = mask.length;
		maxIndex = email.length - maskLen;
		if (pieceIdx == charPieces.length - 1)	// last piece
		{
			if (index <= maxIndex)
			{
				index = maxIndex;
			}
		}
	}
	return false;
}

if (exports)
{
	exports.filter = filter;
}
