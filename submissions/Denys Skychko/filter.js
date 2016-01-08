/**
 * Messages filter
 */

var filter = function(messages, rules) {
    var i,
        j,
        mes,
        r_len,
        temp,
        mes_from,
        mes_to,
        rule_from,
        rule_to,
        i_s,
        i_r,
        r_index_end,
        s_index_end,
        stack_choice,
        i_stack,            // индекс в стеке, считаем что это быстрее чем push/pop
        break_flag;         // 0 - строка не удовлетворяет правилу, 1 - строка прошла правило, 2 - переход к следующей проверки

    mes     = Object.keys(messages);
    r_len   = rules.length;

    i       = mes.length;

    while (i--) {
        mes_from = messages[mes[i]].from || '';
        mes_to   = messages[mes[i]].to || '';

        j = -1;
        temp = [];

        while (++j < r_len) {
            // проверяем from
            rule_from = rules[j].from;

            if (rule_from && rule_from != '*') {
                i_s         = 0;
                i_r         = 0;
                r_index_end = rule_from.length;
                s_index_end = mes_from.length;

                // режим прямого обхода строки
                while (true) {
                    // Если правило закончилось
                    if (i_r == r_index_end) {
                        // Возможно и строка закончилась
                        break_flag = (i_s == s_index_end ? 1 : 0);

                        break;
                    }

                    // Если строка закончилась а правило нет
                    if (i_s == s_index_end) {
                        // Возможно правило допускает отсутствие символа
                        if (rule_from[i_r] == '*') {
                            ++i_r;
                            continue;
                        }

                        break_flag = 0;
                        break;
                    }

                    // Выходим из цикла, приступаем к обходу от конца строки (так короче стек вариантов)
                    if (rule_from[i_r] == '*') {
                        break_flag = 2;
                        break;
                    }

                    // Правило допускает любой символ, переходим к следующим элементам
                    if (rule_from[i_r] == '?') {
                        ++i_s;
                        ++i_r;

                        continue;
                    }

                    // Проверяем соответствие между элементом правила и элементом строки
                    if (mes_from[i_s] == rule_from[i_r]) {
                        ++i_s;
                        ++i_r;

                        continue;
                    }

                    break_flag = 0;
                    break;
                }

                if (break_flag == 0) {
                    continue;
                }

                if (break_flag == 2) {
                    stack_choice = [];
                    r_index_end = i_r;
                    s_index_end = i_s;
                    i_r         = rule_from.length - 1;
                    i_s         = mes_from.length - 1;
                    i_stack     = -1;

                    // режим обратного обхода строки
                    while (true) {
                        // Если правило закончилось
                        if (i_r < r_index_end) {
                            // Возможно и строка закончилась
                            if (i_s < s_index_end) {
                                break_flag = 1;
                                break;
                                //return true;
                            }

                            // Возможно есть альтернативный путь
                            if (i_stack != -1) {
                                i_s = stack_choice[i_stack--];
                                i_r = stack_choice[i_stack--];

                                continue;
                            } else {
                                break_flag = 0;
                                break;
                            }
                        }

                        // Если строка закончилась а правило нет
                        if (i_s < s_index_end) {
                            // Возможно правило допускает отсутствие символа
                            if (rule_from[i_r] == '*') {
                                --i_r;
                                continue;
                            }

                            // Возможно есть альтернативный путь
                            if (i_stack != -1) {
                                i_s = stack_choice[i_stack--];
                                i_r = stack_choice[i_stack--];

                                continue;
                            } else {
                                break_flag = 0;
                                break;
                            }
                        }

                        // На данном этапе и строка и правило не закончились, проверяем
                        switch (rule_from[i_r]) {
                            // Правило позволяет 0 и более любых элементов
                            case '*':
                                // Сохраняем альтернативный путь (0 символов)
                                stack_choice[++i_stack] = i_r - 1;
                                stack_choice[++i_stack] = i_s;

                                // Проверяем больше нуля символов
                                --i_s;
                                continue;

                            // Правило допускает любой символ, переходим к следующим элементам
                            case '?':
                                --i_s;
                                --i_r;

                                continue;

                            // Проверяем соответствие между элементом правила и элементом строки
                            default:
                                if (mes_from[i_s] == rule_from[i_r]) {
                                    --i_s;
                                    --i_r;
                                } else {
                                    // Возможно есть альтернативный путь
                                    if (i_stack != -1) {
                                        i_s = stack_choice[i_stack--];
                                        i_r = stack_choice[i_stack--];
                                    } else {
                                        break_flag = 0;
                                    }
                                }
                        }

                        if (break_flag == 0) {
                            break;
                        }
                    }
                }

                if (break_flag != 1) {
                    continue;
                }
            }

            // проверяем to
            rule_to = rules[j].to;

            if (rule_to && rule_to != '*') {
                i_s         = 0;
                i_r         = 0;
                r_index_end = rule_to.length;
                s_index_end = mes_to.length;

                // режим прямого обхода строки
                while (true) {
                    // Если правило закончилось
                    if (i_r == r_index_end) {
                        // Возможно и строка закончилась
                        break_flag = (i_s == s_index_end ? 1 : 0);

                        break;
                    }

                    // Если строка закончилась а правило нет
                    if (i_s == s_index_end) {
                        // Возможно правило допускает отсутствие символа
                        if (rule_to[i_r] == '*') {
                            ++i_r;
                            continue;
                        }

                        break_flag = 0;
                        break;
                    }

                    // Выходим из цикла, приступаем к обходу от конца строки (так короче стек вариантов)
                    if (rule_to[i_r] == '*') {
                        break_flag = 2;
                        break;
                    }

                    // Правило допускает любой символ, переходим к следующим элементам
                    if (rule_to[i_r] == '?') {
                        ++i_s;
                        ++i_r;

                        continue;
                    }

                    // Проверяем соответствие между элементом правила и элементом строки
                    if (mes_to[i_s] == rule_to[i_r]) {
                        ++i_s;
                        ++i_r;

                        continue;
                    }

                    break_flag = 0;
                    break;
                }

                if (break_flag == 0) {
                    continue;
                }

                if (break_flag == 2) {
                    stack_choice = [];
                    r_index_end = i_r;
                    s_index_end = i_s;
                    i_r         = rule_to.length - 1;
                    i_s         = mes_to.length - 1;
                    i_stack     = -1;

                    // режим обратного обхода строки
                    while (true) {
                        // Если правило закончилось
                        if (i_r < r_index_end) {
                            // Возможно и строка закончилась
                            if (i_s < s_index_end) {
                                break_flag = 1;
                                break;
                                //return true;
                            }

                            // Возможно есть альтернативный путь
                            if (i_stack != -1) {
                                i_s = stack_choice[i_stack--];
                                i_r = stack_choice[i_stack--];

                                continue;
                            } else {
                                break_flag = 0;
                                break;
                            }
                        }

                        // Если строка закончилась а правило нет
                        if (i_s < s_index_end) {
                            // Возможно правило допускает отсутствие символа
                            if (rule_to[i_r] == '*') {
                                --i_r;
                                continue;
                            }

                            // Возможно есть альтернативный путь
                            if (i_stack != -1) {
                                i_s = stack_choice[i_stack--];
                                i_r = stack_choice[i_stack--];

                                continue;
                            } else {
                                break_flag = 0;
                                break;
                            }
                        }

                        // На данном этапе и строка и правило не закончились, проверяем
                        switch (rule_to[i_r]) {
                            // Правило позволяет 0 и более любых элементов
                            case '*':
                                // Сохраняем альтернативный путь (0 символов)
                                stack_choice[++i_stack] = i_r - 1;
                                stack_choice[++i_stack] = i_s;

                                // Проверяем больше нуля символов
                                --i_s;
                                continue;

                            // Правило допускает любой символ, переходим к следующим элементам
                            case '?':
                                --i_s;
                                --i_r;

                                continue;

                            // Проверяем соответствие между элементом правила и элементом строки
                            default:
                                if (mes_to[i_s] == rule_to[i_r]) {
                                    --i_s;
                                    --i_r;
                                } else {
                                    // Возможно есть альтернативный путь
                                    if (i_stack != -1) {
                                        i_s = stack_choice[i_stack--];
                                        i_r = stack_choice[i_stack--];
                                    } else {
                                        break_flag = 0;
                                    }
                                }
                        }

                        if (break_flag == 0) {
                            break;
                        }
                    }
                }

                if (break_flag != 1) {
                    continue;
                }
            }

            temp[temp.length] = rules[j].action;
        }

        messages[mes[i]] = temp;
    }

    return messages;
};

exports.filter = filter;
