/**
 * Метод для фильтрации почтовых сообщений.
 * Версия 4: Использование native методов объекта String для фильтрации сообщений по указанным правилам.
 *
 * @param {Object} messages Объект с письмами, обязательные ключи from, to
 * @param {Array} rules Массив с правилами-объектами, обязательный ключ action, необязательные ключи from, to
 * @returns {Object} Отфильтрованные письма, у каждого массив action-ов или пустой массив
 * @author Sunny
 */
exports.filter = function(messages, rules){
	// объект для возврата результатов
	var results = {}, ruleSet = [];

	// инициализируем временные переменные
	var ruleKey, value, msgKey, v, k, rulePart;

	// обработка правил
	var ruleKeys = ['from', 'to'];
	for(var rK in rules){
		// часть правила которое будет взаимодействовать с сообщениями
		rulePart = {action: rules[rK]['action']};

		// перебираем ключи которых может не существовать в правиле
		ruleKeys.forEach(function(v){
			// проверяем наличие ключа
			if(typeof rules[rK][v] == "undefined"){
				// любое значение
				rulePart[v] = ['any'];
			}else{
				// получаем значение из правила
				value = rules[rK][v];
				if(value.indexOf('**') !== -1){
					value = value.replace(/[*]{2,}/, '*');
				}

				// определяем логику
				if(value.indexOf('?') === -1 && value.indexOf('*') === 0 && value.indexOf('*', 1) === value.length - 1){
					// содержит значение, окруженное неизвестным
					rulePart[v] = ['contains', value.substr(1, value.length - 2)];
				}else if(value.indexOf('?') === -1 && value.indexOf('*') === 0 && value.indexOf('*', 1) === -1){
					// оканчивается на определенное значение
					rulePart[v] = ['end_with', value.substr(1)];
				}else if(value.indexOf('?') === -1 && value.indexOf('*') === value.length - 1){
					// начинается на определенное значение
					rulePart[v] = ['start_with', value.substr(0, value.length - 1)];
				}else if(value.indexOf('*') !== -1 || value.indexOf('?') !== -1){
					// экранирование спецсимволов
					value = value.replace(/(\^\$\|\+\.\(\)\[\]\\)/, '\\$1');

					// заменяем спецсимволы на аналоги regexp
					value = value.replace(/[*]+/, '.*').replace(/\?/, '.{1}');
					value = new RegExp(value);

					// регулярное выражение, слишком сложное правило
					rulePart[v] = ['regexp', value];
				}else{
					// точное совпадение
					rulePart[v] = ['equal', value];
				}
			}
		});
		ruleSet.push(rulePart);
	}

	/**
	 * Возвращает true или false если rule подходит для value
	 * @param {Array} rule
	 * @param {String} value
	 * @returns {Boolean}
	 */
	var logicMachine = function(rule, value){
		switch(rule[0]){
			// любое значение
			case 'any':
				return true;

			// точное значение
			case 'equal':
				return (rule[1] == value);

			// начинается с определенного значения
			case 'start_with':
				return value.startsWith(rule[1]);

			// заканчивается определенным значением
			case 'end_with':
				return value.endsWith(rule[1]);

			// содержит значение
			case 'contains':
				//return value.includes(rule[1]);
				return (value.indexOf(rule[1]) !== -1);

			// регулярное выражение
			case 'regexp':
				return rule[1].test(value);
		}
	};

	// перебираем каждое сообщение
	var msg, rule;
	for(msgKey in messages){
		msg = messages[msgKey];

		// перебираем правила
		v = [];
		for(rK in ruleSet){
			if(
				logicMachine(ruleSet[rK].from, msg.from)
				&& logicMachine(ruleSet[rK].to, msg.to)
			){
				v.push(ruleSet[rK].action);
			}
		}

		// добавляем ключ в итоговый массив
		results[msgKey] = v;
	}

	// возвращаем результат работы метода
	return results;
};
