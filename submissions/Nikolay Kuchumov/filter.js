// "Все строковые значения во входных данных непустые 
//  и содержат только символы ASCII в диапазоне от 0x20 до 0x7F включительно"

// Смещение кода символов
var character_code_shift = 0x20

// Итоговое общее количество возможных символов: 
// 0x7F - 0x20 + 1 = 0x60 = 96 = 2 * 48
//
// Размерность целых чисел в Javascript'е - 48 бит, 
// поэтому можно использовать два числа в качестве битовых масок
// вместо массивов со значениями true/false.
// (потенциальная оптимизация, если останется на неё время)
// (времени не осталось, уже 25 декабря 2015, 23:53:00 UTC)

// Фильтрует сообщения messages соответственно набору правил rules
function filter(messages, rules)
{
	var i
	var j

	var bytes

	var message
	var message_id
	var rule
	var actions

	// Uint8Array - не быстрее обычного Array

	// http://habrahabr.ru/company/hola/blog/270847/#comment_8654399
	// "можно изменять входящие объекты"

	var question_mark = '?'.charCodeAt(0) - character_code_shift
	var asterisk      = '*'.charCodeAt(0) - character_code_shift

	var rule_from_asterisks = new Array(rules.length)
	var rule_to_asterisks   = new Array(rules.length)

	var character_code

	// convert rules from strings to bytes
	//
	// использование чисел вместо символов
	// быстрее примерно в полтора раза
	for (j = 0; j < rules.length; j++)
	{
		rule = rules[j]

		// преобразовать rule.from в числовой вид
		if (rule.from)
		{
			// [] и .push оказались быстрее массива
			// фиксированной длины в данном случае
			bytes = []
			// bytes = new Uint8Array(rule.from.length)
			for (i = 0; i < rule.from.length; i++)
			{
				character_code = rule.from.charCodeAt(i) - character_code_shift
				
				if (character_code === asterisk && rule_from_asterisks[j] === undefined)
				{
					rule_from_asterisks[j] = i
				}

				bytes.push(character_code)
				// bytes[i] = character_code
			}
			rule.from = bytes
		}

		// преобразовать rule.to в числовой вид
		if (rule.to)
		{
			// [] и .push оказались быстрее массива
			// фиксированной длины в данном случае
			bytes = []
			// bytes = new Uint8Array(rule.to.length)
			for (i = 0; i < rule.to.length; i++)
			{
				character_code = rule.to.charCodeAt(i) - character_code_shift
				
				if (character_code === asterisk && rule_to_asterisks[j] === undefined)
				{
					rule_to_asterisks[j] = i
				}

				bytes.push(character_code)
				// bytes[i] = character_code
			}
			rule.to = bytes
		}
	}

	// Допустим, задано R почтовых правил.
	//
	// Для того, чтобы не перебирать все правила для каждого сообщения,
	// можно предвычислить один раз все возможные правила для первых букв
	// полей from и to сообщения.
	//
	// Можно было бы вычислить для всех букв вообще, 
	// но не хватит оперативной памяти.
	//
	// Поскольку указатели в оперативной памяти 64-битные (= 2^3 байтов), 
	// а количество возможных символов - чуть меньше 128 (= 2^7 штук),
	// то для одной буквы потребуется хранить примерно 
	// N = 2^7 * 2^3 * R = 2^10 * R = R Килобайтов данных в оперативной памяти.
	//
	// При R = 1000 потребуется 1 Мегабайт оперативной памяти.
	//
	// Для двух букв: 2^7 * N = 128*R Килобайтов.
	//
	// При R = 1000 потребуется 128 Мегабайтов оперативной памяти.
	//
	// Для трёх букв: 2^7 * 2^7 * N = 16*R Мегабайтов.
	//
	// При R = 1000 потребуется 16 Гигабайтов оперативной памяти.
	//
	// Для четырёх букв: 2^7 * 2^7 * 2^7 * N = 2*R Гигабайта.
	//
	// При R = 1000 потребуется 2 Терабайта оперативной памяти.
	// (http://www.ebay.com/itm/181677941583)
	//
	// В данном случае можно остановиться на предвычислении для двух первых букв.
	// Вероятно, дальнейшее количество букв 
	// не дало бы ощутимого прироста скорости выполнения программы
	// (в данном случае, при количестве правил порядка 1000).

	var rule_from_index = []
	var rule_to_index   = []

	// составляет предвычисление подходящих правил для index'ного символа
	// (начиная с нуля)
	//
	// заполняет переданные массивы для rule.from и rule.to
	//
	function index_rules(index, from_rules_mask, to_rules_mask, rule_from_index, rule_to_index)
	{
		// списки потенциально подходящих правил
		// (для rule.from и rule.to)
		var array_from
		var array_to

		// для каждого возможного символа,
		// составить список потенциально подходящих правил
		for (k = 0; k < 0x60; k++)
		{
			// списки потенциально подходящих правил
			// для конкретного символа
			// (для rule.from и rule.to)
			array_from = new Array(rules.length)
			array_to   = new Array(rules.length)

			// проверить каждое правило на подхождение
			for (j = 0; j < rules.length; j++)
			{
				if (!from_rules_mask[j])
				{
					continue
				}

				// текущее правило
				rule = rules[j]

				// проверить, подходит ли к данному символу rule.from у данного правила
				if (rule.from)
				{
					if (rule.from.length <= index)
					{
						array_from[j] = true
					}
					else
					{
						// если в правиле есть звёздочка на этом символе,
						// или перед ним - правило потенциально подходящее.
						//
						// если в правиле на этом символе знак вопроса - подходит любой символ.
						//
						// если в правиле на этом символе такой же символ - оно подходит.
						//
						if ((rule_from_asterisks[j] >= 0 && rule_from_asterisks[j] <= index)
							|| rule.from[index] === question_mark 
							|| rule.from[index] === k)
						{
							array_from[j] = true
						}
						else
						{
							array_from[j] = false
						}
					}
				}
				else
				{
					array_from[j] = true
				}
			}

			// проверить каждое правило на подхождение
			for (j = 0; j < rules.length; j++)
			{
				if (!to_rules_mask[j])
				{
					continue
				}

				// текущее правило
				rule = rules[j]

				// проверить, подходит ли к данному символу rule.to у данного правила
				if (rule.to)
				{
					if (rule.to.length <= index)
					{
						array_to[j] = true
					}
					else
					{
						// если в правиле есть звёздочка на этом символе,
						// или перед ним - правило потенциально подходящее.
						//
						// если в правиле на этом символе знак вопроса - подходит любой символ.
						//
						// если в правиле на этом символе такой же символ - оно подходит.
						//
						if ((rule_to_asterisks[j] >= 0 && rule_to_asterisks[j] <= index)
							|| rule.to[index] === question_mark 
							|| rule.to[index] === k)
						{
							array_to[j] = true
						}
						else
						{
							array_to[j] = false
						}
					}
				}
				else
				{
					array_to[j] = true
				}
			}

			// карты для from и to составлены
			rule_from_index[k] = array_from
			rule_to_index[k]   = array_to
		}
	}

	// случай с предвычислением только для первого символа
	index_rules(0, rules, rules, rule_from_index, rule_to_index)

	// случай с предвычислением для двух первых символов - 
	// почему-то слишком долго выполнялось,
	// времени разбираться не осталось
	//
	// // для каждого возможного первого символа
	// for (var m = 0; m < 0x60; m++)
	// {
	// 	var filtered_rules_from_mask = []
	// 	var filtered_rules_to_mask   = []
	//
	// 	// предвычислить карту правил для первого символа
	// 	index_rules(0, rules, rules, filtered_rules_from_mask, filtered_rules_to_mask)
	//
	// 	var total_possible_rules_from = []
	// 	var total_possible_rules_to   = []
	//
	// 	// для каждого возможного второго символа
	// 	for (i = 0; i < 0x60; i++)
	// 	{
	// 		var possible_rules_from = []
	// 		var possible_rules_to   = []
	//
	// 		index_rules(0, filtered_rules_from_mask, filtered_rules_to_mask, possible_rules_from, possible_rules_to)
	//
	// 		total_possible_rules_from[i] = possible_rules_from
	// 		total_possible_rules_to[i]   = possible_rules_to
	// 	}
	//
	// 	rule_from_index[m] = total_possible_rules_from
	// 	rule_to_index[m]   = total_possible_rules_to
	// }

	// отфильтровать сообщения
	var message_ids = Object.keys(messages)
	for (i = 0; i < message_ids.length; i++)
	{
		actions = []

		message_id = message_ids[i]

		message = messages[message_id]

		messages[message_id] = actions

		// convert message.from string to bytes
		//
		// использование чисел вместо символов
		// быстрее примерно в полтора раза
		//
		// использование индекса вместо .push()
		// примерно на 5% быстрее
		bytes = new Array(message.from.length)
		for (j = 0; j < message.from.length; j++)
		{
			bytes[j] = message.from.charCodeAt(j) - character_code_shift
		}
		message.from = bytes

		// convert message.to string to bytes
		//
		// использование чисел вместо символов
		// быстрее примерно в полтора раза
		//
		// использование индекса вместо .push()
		// примерно на 5% быстрее
		bytes = new Array(message.to.length)
		for (j = 0; j < message.to.length; j++)
		{
			bytes[j] = message.to.charCodeAt(j) - character_code_shift
		}
		message.to = bytes

		// случай с предвычислением только для первого символа
		var rule_from_by_symbol = rule_from_index[message.from[0]]
		var rule_to_by_symbol   = rule_to_index  [message.to[0]]

		// случай с предвычислением для двух первых символов - 
		// почему-то слишком долго выполнялось,
		// времени разбираться не осталось
		//
		// // email address minimum length is 3
		// //
		// // http://stackoverflow.com/questions/1423195/what-is-the-proper-minimum-length-of-an-email-address-as-defined-by-the-ietf-or
		// //
		// if (message.from.length < 2 || message.to.length < 2)
		// {
		// 	throw new Error('Invalid email address for message', message_id, '(too short)')
		// }
		//
		// var rule_from_by_symbol = rule_from_index[message.from[0]][message.from[1]]
		// var rule_to_by_symbol   = rule_to_index  [message.to[0]]  [message.to[1]]

		for (k = 0; k < rules.length; k++)
		{
			if (rule_from_by_symbol[k] && rule_to_by_symbol[k])
			{
				rule = rules[k]

				if ( (rule.from === undefined || match(message.from, rule.from))
					&& (rule.to === undefined || match(message.to, rule.to)))
				{
					actions.push(rule.action)
				}
			}
		}
	}

	// сообщения отфильтрованы
	return messages
}

// глобальный массив даёт ускорение около 15%,
// по сравнению с локальным массивом в функции match()
const alternative_matching_paths = []

// проверяет, удовлетворяет ли строка value правилу rule
function match(value, rule)
{
	// эти константы, будучи локальными,
	// дают ускорение около 5%
	// по сравнению с такими же глобальными константами
	//
	// использование чисел вместо символов
	// быстрее примерно в полтора раза
	const question_mark = '?'.charCodeAt(0) - character_code_shift
	const asterisk      = '*'.charCodeAt(0) - character_code_shift

	// локальные i и j дают ускорение около 20%
	// по сравнению с глобальными i и j
	var i = 0
	var j = 0

	// "ручной" массив даёт ускорение около 25%,
	// по сравнению с локальным массивом [] и методами .push() и .pop()
	var alternative_matching_path_count = 0
	
	while (true)
	{
		// если правило кончилось
		if (j === rule.length)
		{
			// если и правило, и строка кончились одновременно,
			// то строка удовлетворяет правилу
			if (i === value.length)
			{
				return true
			}

			// если правило кончилось, а строка ещё не кончилась,
			// то строка не удовлетворяет правилу

			// попробовать другие варианты обхода
			// (копипаста)
			if (alternative_matching_path_count > 0)
			{
				j = alternative_matching_paths[--alternative_matching_path_count]
				i = alternative_matching_paths[--alternative_matching_path_count]
				continue
			}

			// строка не удовлетворяет правилу
			return false
		}

		// если строка кончилась, а правило ещё не кончилось
		if (i === value.length)
		{
			// если в правиле остались одни звёздочки, 
			// то строка удовлетворяет правилу

			while (j < rule.length)
			{
				if (rule[j] !== asterisk)
				{
					break
				}

				j++
			}

			// если в оставшейся части правила 
			// была найдена не звёздочка,
			// то строка не удовлетворяет правилу
			if (j < rule.length)
			{
				// попробовать другие варианты обхода
				// (копипаста)
				if (alternative_matching_path_count > 0)
				{
					j = alternative_matching_paths[--alternative_matching_path_count]
					i = alternative_matching_paths[--alternative_matching_path_count]
					continue
				}

				// строка не удовлетворяет правилу
				return false
			}

			// в оставшейся части правила 
			// остались одни звёздочки.
			// строка удовлетворяет правилу
			return true
		}

		// если символ правила - * (пустота или любое количество любых символов),
		// то этот случай расщепляется на три возможности:
		//
		// * сравнение правила после этого символа, и строки с текущим её символом
		// * сравнение правила с этим символом, и строки после текущего её символа
		// * сравнение правила без этого символа, и строки после текущего её символа
		//
		if (rule[j] === asterisk)
		{
			// в случае с одной звёздочкой можно попробовать пойти с конца.
			// если в случае с прохода с конца встретится ещё одна звёздочка,
			// то отменить этот проход с конца, и продолжить делать по общему алгоритму
			//
			// (даёт ускорение почти в три раза)

			var min_i = i
			var min_j = j

			i = value.length - 1
			j = rule.length - 1

			while (true)
			{
				// если правило почти кончилось
				// (дошли до изначальной звёздочки)
				if (j === min_j)
				{
					return true
				}

				// если строка кончилась, 
				// а правило ещё не почти кончилось
				// (ещё не дошли до изначальной звёздочки)
				if (i === min_i - 1)
				{
					// если в правиле остались ещё звёздочки, 
					// то вернуться к обычному алгоритму.
					//
					// если же в правиле остались незвёздочки,
					// то строка не удовлетворяет правилу.
					//
					if (rule[j] === asterisk)
					{
						// продолжить по общему алгоритму, оттуда, где остановились
						i = min_i
						j = min_j
						break
					}

					return false
				}

				// если символ правила - * (пустота или любое количество любых символов)
				if (rule[j] === asterisk)
				{
					// при проходе с конца встретилась вторая звёздочка -
					// отменить алгоритм прохода с конца, 
					// и продолжить по общему алгоритму, оттуда, где остановились

					i = min_i
					j = min_j
					break

					// return match(value, i, rule, j + 1) 
					// 	|| match(value, i + 1, rule, j)
					// 	|| match(value, i + 1, rule, j + 1)
				}
				
				// если символ правила - ? (один любой символ),
				// то продолжить рекурсивно.
				// 
				// если символ правила - не ?, но при этом
				// он равен символу строки, то тоже продолжить рекурсивно
				//
				if (rule[j] === value[i] || rule[j] === question_mark)
				{
					i--
					j--
					continue

					// return match(value, i + 1, rule, j + 1)
				}

				return false
			}

			// в правиле встретилась вторая звёздочка - 
			// отменить алгоритм прохода с конца, 
			// и продолжить по общему алгоритму, оттуда, где остановились

			// // запасной путь:
			// // звёздочка съедает один символ
			// //
			// // value перешагивает на следующий символ,
			// // rule перешагивает через звёздочку
			// alternative_matching_paths[alternative_matching_path_count++] = i + 1
			// alternative_matching_paths[alternative_matching_path_count++] = j + 1

			// запасной путь:
			// звёздочка съедает текущий символ, и на следующем шаге может продолжить есть
			//
			// value перешагивает на следующий символ,
			// rule остаётся на звёздочке
			alternative_matching_paths[alternative_matching_path_count++] = i + 1
			alternative_matching_paths[alternative_matching_path_count++] = j

			// выбранный путь:
			// звёздочка не съедает ничего
			//
			// value остаётся на том же символе,
			// rule перешагивает через звёздочку
			j++
			continue

			// return match(value, i, rule, j + 1) 
			// 	|| match(value, i + 1, rule, j)
			// 	|| match(value, i + 1, rule, j + 1)
		}

		// если символ правила - ? (один любой символ),
		// то продолжить рекурсивно.
		// 
		// если символ правила - не ?, но при этом
		// он равен символу строки, то тоже продолжить рекурсивно
		//
		if (rule[j] === value[i] || rule[j] === question_mark)
		{
			i++
			j++
			continue

			// return match(value, i + 1, rule, j + 1)
		}

		// попробовать другие варианты обхода
		// (копипаста)
		if (alternative_matching_path_count > 0)
		{
			j = alternative_matching_paths[--alternative_matching_path_count]
			i = alternative_matching_paths[--alternative_matching_path_count]
			continue
		}

		return false
	}
}

module.exports = filter

// kuchumovn@gmail.com
// github.com/halt-hammerzeit