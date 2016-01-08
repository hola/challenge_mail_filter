/***************************************************************************
* Mail Filter v1
* Copyright © 2015 Serj Karasev
* 
* JS challenge Winter 2015: Mail Filtering Engine
* http://hola.org/challenge_mail_filter
***************************************************************************/

//нерекурсивная быстрая сортировка с трехчастным разбиением
function QuickSort3WPNoRwithSM(a, b, l, r) {
    var i, j, k, p, q, v, temp;
    var stack = [];
    var stack_top = 0;

    stack[stack_top] = l;
    stack[stack_top + 1] = r;
    stack_top += 2;
    while (stack_top > 0) {
        r = stack[stack_top - 1];
        l = stack[stack_top - 2];
        stack_top -= 2;
        if (r <= l) continue;
        i = l - 1; j = r; p = l - 1; q = r; v = a[r];
        while (1) {
            while (a[++i] < v);
            while (v < a[--j]) if (j == l) break;
            if (i >= j) break;
            temp = a[i]; a[i] = a[j]; a[j] = temp;
            temp = b[i]; b[i] = b[j]; b[j] = temp;
            if (a[i] == v) {
                p++;
                temp = a[p]; a[p] = a[i]; a[i] = temp;
                temp = b[p]; b[p] = b[i]; b[i] = temp;
            }
            if (v == a[j]) {
                q--;
                temp = a[j]; a[j] = a[q]; a[q] = temp;
                temp = b[j]; b[j] = b[q]; b[q] = temp;
            }
        }
        temp = a[i]; a[i] = a[r]; a[r] = temp;
        temp = b[i]; b[i] = b[r]; b[r] = temp;
        j = i - 1; i = i + 1;
        for (k = l; k < p; k++, j--) {
            temp = a[k]; a[k] = a[j]; a[j] = temp;
            temp = b[k]; b[k] = b[j]; b[j] = temp;
        }
        for (k = r - 1; k > q; k--, i++) {
            temp = a[i]; a[i] = a[k]; a[k] = temp;
            temp = b[i]; b[i] = b[k]; b[k] = temp;
        }
        stack[stack_top] = i;
        stack[stack_top + 1] = r;
        stack[stack_top + 2] = l;
        stack[stack_top + 3] = j;
        stack_top += 4;
    }
}

//сортировка Шелла
function ShellSortKnuth(a) {
    var i = 0, j = 0, h = 0, v = 0, l = 0, r = a.length - 1;
    var hg = Math.floor((r - l) / 9);

    for (h = 1; h <= hg; h = Math.floor(3 * h + 1));
    for (; h > 0; h = Math.floor(h / 3)) {
        for (i = l + h; i <= r; i++) {
            j = i; v = a[i];
            while ((j >= l + h) && (v < a[j - h])) {
                a[j] = a[j - h]; j -= h;
            }
            a[j] = v;
        }
    }
}

//сортировка вставками
function InsertSort(a) {
    var i, j, v, l = 0, r = a.length - 1, temp;

    for (i = r; i > l; i--) {
        if (a[i] < a[i - 1]) { temp = a[i - 1]; a[i - 1] = a[i]; a[i] = temp; }
    }
    for (i = l + 2; i <= r; i++) {
        j = i; v = a[i];
        while (v < a[j - 1]) {
            a[j] = a[j - 1]; j--;
        }
        a[j] = v;
    }
}

//сортировка вставками
function InsertSort2(a, l, r) {
    var i, j, v, temp;

    for (i = r; i > l; i--) {
        if (a[i] < a[i - 1]) { temp = a[i - 1]; a[i - 1] = a[i]; a[i] = temp; }
    }
    for (i = l + 2; i <= r; i++) {
        j = i; v = a[i];
        while (v < a[j - 1]) {
            a[j] = a[j - 1]; j--;
        }
        a[j] = v;
    }
}

//слияние 2-х массивов
function MergeAB(c, k, a, i, N, b, j, M) {
    var bk = k, bi = i, bj = j;

    while ((k - bk) < (N + M)) {
        if ((i - bi) == N) { c[k++] = b[j++]; continue; }
        if ((j - bj) == M) { c[k++] = a[i++]; continue; }
        c[k++] = (a[i] < b[j]) ? a[i++] : b[j++];
    }
}

//сортировка слиянием (рекурсивная)
function MergeSortR(a, b, l, r) {
    var m;
    if ((r - l) <= 44) { InsertSort2(a, l, r); return; }
    m = (l + r) >> 1;
    MergeSortR(b, a, l, m);
    MergeSortR(b, a, m + 1, r);
    MergeAB(a, l, b, l, m - l + 1, b, m + 1, r - m);
}

//функция вызова рекурсивной сортировки слиянием
function MergeSortR_44(a) {
	MergeSortR(a,a.slice(),0,a.length-1);
}

//сравнивает 2 строки по кол-ву символов N во второй строке s2
function CompareStringsBinaryN(s1, s2, N) {
    var i, s1_len = s1.length;
    i = 0;
    while ((i < s1_len) && (i < N)) {
        if (s1[i] > s2[i]) return 1;
        else if (s1[i] < s2[i]) return -1;
        i++;
    }
    if (i >= N) return 0;
    else return -1;
}

//определение левой границы совпадения начиная с ind
function BinarySearchLeft2(a, key, ind) {
    var l = 0, r = ind, step = 2;

    if (ind <= 1) {
        if (ind == 0) return 0;
        if (ind == 1) {
            if (a[0] === key) return 0; else return 1;
        }
    }
    while (1) {
        if (a[r - step] === key) {
            if ((r - step) == l) return l;
            else if ((r - step) == (l + 1)) {
                if (a[l] === key) return l; else return (l + 1);
            }
            step <<= 1;
            if ((r - step) < l) {
                r -= (step >> 1);
                step = 2;
            }
        }
        else {
            if (step == 2) {
                if (a[r - 1] === key) return (r - 1); else return (r);
            }
            else if (step == 4) {
                if (a[r - 3] === key) return (r - 3); else return (r - 2);
            }
            l = r - step + 1;
            r -= (step >> 1);
            step = 2;
        }
    }
}

//определение правой границы совпадения начиная с ind
function BinarySearchRight2(a, key, ind) {
    var l = ind, r = a.length - 1, step = 2, i0 = r, i1 = r - 1;

    if (ind >= i1) {
        if (ind == i0) return i0;
        if (ind == i1) {
            if (a[i0] === key) return i0; else return i1;
        }
    }
    while (1) {
        if (a[l + step] === key) {
            if ((l + step) == r) return r;
            else if ((l + step) == (r - 1)) {
                if (a[r] === key) return r; else return (r - 1);
            }
            step <<= 1;
            if ((l + step) > l) {
                l += (step >> 1);
                step = 2;
            }
        }
        else {
            if (step == 2) {
                if (a[l + 1] === key) return (l + 1); else return (l);
            }
            else if (step == 4) {
                if (a[l + 3] === key) return (l + 3); else return (l + 2);
            }
            r = l + step - 1;
            l += (step >> 1);
            step = 2;
        }
    }
}

//определение левой границы совпадения начиная с ind
function BinarySearchNLeft2(a, key, key_len, ind) {
    var l = 0, r = ind, step = 2;

    if (ind <= 1) {
        if (ind == 0) return 0;
        if (ind == 1) {
            if (CompareStringsBinaryN(a[0], key, key_len) == 0) return 0; else return 1;
        }
    }
    while (1) {
        if (CompareStringsBinaryN(a[r - step], key, key_len) == 0) {
            if ((r - step) == l) return l;
            else if ((r - step) == (l + 1)) {
                if (CompareStringsBinaryN(a[l], key, key_len) == 0) return l; else return (l + 1);
            }
            step <<= 1;
            if ((r - step) < l) {
                r -= (step >> 1);
                step = 2;
            }
        }
        else {
            if (step == 2) {
                if (CompareStringsBinaryN(a[r - 1], key, key_len) == 0) return (r - 1); else return (r);
            }
            else if (step == 4) {
                if (CompareStringsBinaryN(a[r - 3], key, key_len) == 0) return (r - 3); else return (r - 2);
            }
            l = r - step + 1;
            r -= (step >> 1);
            step = 2;
        }
    }
}

//определение правой границы совпадения начиная с ind
function BinarySearchNRight2(a, key, key_len, ind) {
    var l = ind, r = a.length - 1, step = 2, i0 = r, i1 = r - 1;

    if (ind >= i1) {
        if (ind == i0) return i0;
        if (ind == i1) {
            if (CompareStringsBinaryN(a[i0], key, key_len) == 0) return i0; else return i1;
        }
    }
    while (1) {
        if (CompareStringsBinaryN(a[l + step], key, key_len) == 0) {
            if ((l + step) == r) return r;
            else if ((l + step) == (r - 1)) {
                if (CompareStringsBinaryN(a[r], key, key_len) == 0) return r; else return (r - 1);
            }
            step <<= 1;
            if ((l + step) > l) {
                l += (step >> 1);
                step = 2;
            }
        }
        else {
            if (step == 2) {
                if (CompareStringsBinaryN(a[l + 1], key, key_len) == 0)  return (l + 1); else return (l);
            }
            else if (step == 4) {
                if (CompareStringsBinaryN(a[l + 3], key, key_len) == 0)  return (l + 3); else return (l + 2);
            }
            r = l + step - 1;
            l += (step >> 1);
            step = 2;
        }
    }
}

//бинарный поиск в массиве
function BinarySearch(a, key) {
    var l = 0, r = a.length - 1, m;
    while (l <= r) {
        m = (l + r) >> 1;
        if (key < a[m]) r = m - 1;
        else if (key > a[m]) l = m + 1;
        else return m;
    }
    return -1;
}

//бинарный поиск в массиве; определение нижней границы совпадения
function BinarySearchLow(a, key, l, r) {
    var m, m_save = -1;
    while (l <= r) {
        m = (l + r) >> 1;
        if (a[m] >= key) r = m - 1; else l = m + 1;
        if (a[m] === key) m_save = m;
    }
    return m_save;
}

//бинарный поиск в массиве; определение верхней границы совпадения
function BinarySearchHigh(a,key,l,r) {
    var m, m_save=-1;
    while (l <= r) {
        m = (l + r) >> 1;
        if (a[m]<=key) l = m + 1; else r = m - 1;
        if (a[m]===key) m_save=m;
    }
    return m_save;
}

//бинарный поиск в массиве по длине ключа
function BinarySearchN(a, key, key_len) {
    var l = 0, r = a.length - 1, m, res = 0;
    while (l <= r) {
        m = (l + r) >> 1;
        res = CompareStringsBinaryN(a[m], key, key_len);
        if (res > 0) r = m - 1;
        else if (res < 0) l = m + 1;
        else return m;
    }
    return -1;
}

//бинарный поиск в массиве по длине ключа; определение нижней границы совпадения
function BinarySearchNLow(a, key, key_len, l, r) {
    var m, m_save = -1, res;
    while (l <= r) {
        m = (l + r) >> 1;
        res = CompareStringsBinaryN(a[m], key, key_len);
        if (res >= 0) r = m - 1; else l = m + 1;
        if (res == 0) m_save = m;
    }
    return m_save;
}

//бинарный поиск в массиве по длине ключа; определение верхней границы совпадения
function BinarySearchNHigh(a, key, key_len, l, r) {
    var m, m_save = -1, res;
    while (l <= r) {
        m = (l + r) >> 1;
        res = CompareStringsBinaryN(a[m], key, key_len);
        if (res <= 0) l = m + 1; else r = m - 1;
        if (res == 0) m_save = m;
    }
    return m_save;
}

//сравнивает две строки "равны или нет", без рекурсии
//s1 - строка, s2 - строка с маской (может содержать * и ?)
function match_wc_nor_n(s, s_pos, sm, sm_pos) {
    var i, s_len = s.length, sm_len = sm.length;
    var stack = [];
    var stack_top = 0;

    //push
    stack[stack_top] = s_pos;
    stack[stack_top + 1] = sm_pos;
    stack_top += 2;
    next_from_stack:
        while (stack_top > 0) {
            //pop
            sm_pos = stack[stack_top - 1];
            s_pos = stack[stack_top - 2];
            stack_top -= 2;
            while ((sm_pos < sm_len) && (s_pos < s_len)) {
                if (sm[sm_pos] == '*') {
                    while ((sm_pos < sm_len) && (sm[sm_pos] == '*')) sm_pos++; //пропускаем все *
                    if (sm_pos >= sm_len)  return 1; //если * последняя, то равно
                    for (i = s_len - 1; i >= s_pos; i--) {
                        //push
                        stack[stack_top] = i;
                        stack[stack_top + 1] = sm_pos;
                        stack_top += 2;
                    }
                    continue next_from_stack;
                }
                else if (sm[sm_pos] == '?') {
                    s_pos++;
                    sm_pos++;
                }
                else {
                    if (s[s_pos] != sm[sm_pos]) {
                        continue next_from_stack;
                    }
                    s_pos++;
                    sm_pos++;
                }
            }
            while ((sm_pos < sm_len) && (sm[sm_pos] == '*')) sm_pos++; //пропускаем все *
            if ((s_pos >= s_len) && (sm_pos >= sm_len)) return 1;
        }
    return 0;
}

//переворачивает строку
function reverse_str(s) {
    return ((s.split("")).reverse()).join("");
}

//классифицируем wildcards в строке
function classify_wildcards(s) {
    var i, wc_left = -1, wc_right = -1, dog_pos = -1, s_len = s.length, some_wc, ind1;
    var result = {wc: 0, str: "", sf: 0};
    if (s_len <= 0) return result;

    //оптимизируем под звёздочки: все или в начале или в конце
    if (s[0] == '*') {
        i = 0;
        while ((i < s_len) && (s[i] == '*')) i++;
        if (i >= s_len) {
            result.wc = 4;
            return result;
        }
        ind1 = i;
        some_wc = 0;
        for (i = ind1; i < s_len; i++)
            if ((s[i] == '*') || (s[i] == '?')) some_wc++;
        if (some_wc == 0) {
            result.wc = 12;
            result.sf = 1;
            result.str = (reverse_str(s)).substring(0, s_len - ind1);
            return result;
        }
    }
    else if (s[s_len - 1] == '*') {
        i = s_len - 1;
        while ((i >= 0) && (s[i] == '*')) i--;
        ind1 = i;
        some_wc = 0;
        for (i = ind1; i >= 0; i--)
            if ((s[i] == '*') || (s[i] == '?')) some_wc++;
        if (some_wc == 0) {
            result.wc = 11;
            result.sf = 1;
            result.str = s.substring(0, ind1 + 1);
            return result;
        }

    }

    //определяем позиции wildcard
    for (i = 0; i < s_len; i++) {
        if ((s[i] == '*') || (s[i] == '?')) {
            wc_left = i;
            break;
        }
    }
    for (i = s_len - 1; i >= 0; i--) {
        if ((s[i] == '*') || (s[i] == '?')) {
            wc_right = i;
            break;
        }
    }
    dog_pos = s.indexOf("@");

    //определяем тип wc
    if ((wc_left == -1) && (wc_right == -1)) {
        result.wc = 0;
    }
    else if (((s[0] == '*') || (s[0] == '?') || (s[0] == '@')) &&
            ((s[s_len - 1] == '*') || (s[s_len - 1] == '?') || (s[s_len - 1] == '@'))) {
        result.wc = 2;
        result.str = "";
    }
    else if (((dog_pos > 0) && (wc_left > dog_pos)) || ((dog_pos > wc_left) && (wc_left > 3))) {
        result.wc = 11;
        result.str = s.substring(0, wc_left);
        return result;
    }
    else if ((s_len - 1 - wc_right) > wc_left) {
        result.wc = 12;
        result.str = (reverse_str(s)).substring(0, s_len - 1 - wc_right);
        return result;
    }
    else {
        result.wc = 11;
        result.str = s.substring(0, wc_left);
    }
    return result;
}

//применяет переквалифицированные правила
function apply_rule_for_rc(rule, rule_id, messages, result, from_opt_r, from_opt_r_msgids, to_opt_r, to_opt_r_msgids) {
    var rule_action, rule_from, rule_to, rule_searchstr, rule_wc, rule_sstr_len;
    var mes, mes_id, ind1, ind2, i;

    rule_wc = rule.wc;
    rule_from = rule.from;
    rule_to = rule.to;
    rule_searchstr = rule.searchstr;
    rule_sstr_len = rule_searchstr.length;
    rule_action = rule_id;

    switch (rule.type) {
        case 1:
            switch (rule_wc) {
                case 32:
                    ind1 = BinarySearchNLow(from_opt_r, rule_searchstr, rule_sstr_len, 0, from_opt_r.length - 1);
                    if (ind1 < 0) return;
                    ind2 = BinarySearchNHigh(from_opt_r, rule_searchstr, rule_sstr_len, ind1, from_opt_r.length - 1);
                    if (rule.sf == 1) {
                        for (i = ind1; i <= ind2; i++) {
                            mes_id = from_opt_r_msgids[i];
                            if (match_wc_nor_n(messages[mes_id].to, 0, rule_to, 0)) result[mes_id].push(rule_action);
                        }
                    }
                    else {
                        for (i = ind1; i <= ind2; i++) {
                            mes_id = from_opt_r_msgids[i];
                            mes = messages[mes_id];
                            if ((match_wc_nor_n(mes.from, 0, rule_from, 0)) && (match_wc_nor_n(mes.to, 0, rule_to, 0)))
                                result[mes_id].push(rule_action);
                        }
                    }
                break;
                case 35:
                    ind1 = BinarySearchNLow(to_opt_r, rule_searchstr, rule_sstr_len, 0, to_opt_r.length - 1);
                    if (ind1 < 0) return;
                    ind2 = BinarySearchNHigh(to_opt_r, rule_searchstr, rule_sstr_len, ind1, to_opt_r.length - 1);
                    if (rule.sf == 1) {
                        for (i = ind1; i <= ind2; i++) {
                            mes_id = to_opt_r_msgids[i];
                            if (match_wc_nor_n(messages[mes_id].from, 0, rule_from, 0)) result[mes_id].push(rule_action);
                        }
                    }
                    else {
                        for (i = ind1; i <= ind2; i++) {
                            mes_id = to_opt_r_msgids[i];
                            mes = messages[mes_id];
                            if ((match_wc_nor_n(mes.to, 0, rule_to, 0)) && (match_wc_nor_n(mes.from, 0, rule_from, 0)))
                                result[mes_id].push(rule_action);
                        }
                    }
                break;
            }
        break;
        case 2:
            switch (rule_wc) {
                case 12:
                    ind1 = BinarySearchNLow(from_opt_r, rule_searchstr, rule_sstr_len, 0, from_opt_r.length - 1);
                    if (ind1 < 0) return;
                    ind2 = BinarySearchNHigh(from_opt_r, rule_searchstr, rule_sstr_len, ind1, from_opt_r.length - 1);
                    if (rule.sf == 1) {
                        for (i = ind1; i <= ind2; i++)
                            result[from_opt_r_msgids[i]].push(rule_action);
                    }
                    else {
                        for (i = ind1; i <= ind2; i++) {
                            mes_id = from_opt_r_msgids[i];
                            mes = messages[mes_id];
                            if (match_wc_nor_n(mes.from, 0, rule_from, 0))
                                result[mes_id].push(rule_action);
                        }
                    }
                break;
            }
        break;
        case 3:
            switch (rule_wc) {
                case 12:
                    ind1 = BinarySearchNLow(to_opt_r, rule_searchstr, rule_sstr_len, 0, to_opt_r.length - 1);
                    if (ind1 < 0) return;
                    ind2 = BinarySearchNHigh(to_opt_r, rule_searchstr, rule_sstr_len, ind1, to_opt_r.length - 1);
                    if (rule.sf == 1) {
                        for (i = ind1; i <= ind2; i++)
                            result[to_opt_r_msgids[i]].push(rule_action);
                    }
                    else {
                        for (i = ind1; i <= ind2; i++) {
                            mes_id = to_opt_r_msgids[i];
                            mes = messages[mes_id];
                            if (match_wc_nor_n(mes.to, 0, rule_to, 0))
                                result[mes_id].push(rule_action);
                        }
                    }
                break;
            }
        break;
    }
}

//создание обратного массива по from
function create_from_r(messages, from_opt_r, from_opt_r_msgids, sortf) {
    var mes_from, mes_id, count = 0;

    for (mes_id in messages) {
        mes_from = messages[mes_id].from;
        from_opt_r[count] = ((mes_from.split("")).reverse()).join("");
        from_opt_r_msgids[count] = mes_id;
        count++;
    }
    sortf(from_opt_r, from_opt_r_msgids, 0, from_opt_r.length - 1);
}

//создание обратного массива по to
function create_to_r(messages, to_opt_r, to_opt_r_msgids, sortf) {
    var mes_to, mes_id, count = 0;

    for (mes_id in messages) {
        mes_to = messages[mes_id].to;
        to_opt_r[count] = ((mes_to.split("")).reverse()).join("");
        to_opt_r_msgids[count] = mes_id;
        count++;
    }
    sortf(to_opt_r, to_opt_r_msgids, 0, to_opt_r.length - 1);
}

//создание обратных массивов по from и to
function create_from_r_to_r(messages, from_opt_r, from_opt_r_msgids, to_opt_r, to_opt_r_msgids, sortf) {
    var mes_from, mes_to, mes_id, count = 0;

    for (mes_id in messages) {
        mes_from = messages[mes_id].from;
        from_opt_r[count] = ((mes_from.split("")).reverse()).join("");
        from_opt_r_msgids[count] = mes_id;

        mes_to = messages[mes_id].to;
        to_opt_r[count] = ((mes_to.split("")).reverse()).join("");

        count++;
    }
    to_opt_r_msgids = from_opt_r_msgids.slice();
    sortf(from_opt_r, from_opt_r_msgids, 0, from_opt_r.length - 1);
    sortf(to_opt_r, to_opt_r_msgids, 0, to_opt_r.length - 1);
}

//решение "в лоб"
function filter_vlob(messages, rules) {
    var result= {},count,rule,rule_id,rules_count,mes,mes_id;

    rules_count=rules.length;

    //определяем тип правил
    for (rule_id = 0; rule_id < rules_count; rule_id++) {
        rule = rules[rule_id];
        //if (!("action" in rule))
        //   return {"Error": "Отсутствует обязательное свойство action в правиле №"+rule_id};
        //if (rule.action==="")
        //    return {"Error": "Пустая строка в свойстве action правила №"+rule_id};
        if (("from" in rule) && ("to" in rule)) {
            rule.type = 1;
            //if ((rule.from==="")||(rule.to==="")) return {"Error": "Пустая строка в свойстве правила №"+rule_id};
        }
        else if ("from" in rule) {
            rule.type = 2;
            //if (rule.from==="") return {"Error": "Пустая строка в свойстве правила №"+rule_id};
        }
        else if ("to" in rule) {
            rule.type = 3;
            //if (rule.to==="") return {"Error": "Пустая строка в свойстве правила №"+rule_id};
        }
        else rule.type = 4;
    }

    //применяем правила
    for (mes_id in messages) {
        mes=messages[mes_id];
        //if ((!("from" in mes))||(!("to" in mes)))
        //    return {"Error": "Отсутствует обязательное свойство в сообщении "+mes_id};
        //if ((mes.from==="")||(mes.to===""))
        //    return {"Error": "Пустая строка в свойстве сообщения "+mes_id};
        result[mes_id]=[];
        count=0;
        for (rule_id = 0; rule_id < rules_count; rule_id++) {
            rule=rules[rule_id];
            switch (rule.type) {
                case 1:
                    if (match_wc_nor_n(mes.from,0,rule.from,0)&&match_wc_nor_n(mes.to,0,rule.to,0))
                        result[mes_id][count++]=rule.action;
                    break;
                case 2:
                    if (match_wc_nor_n(mes.from,0,rule.from,0)) result[mes_id][count++]=rule.action;
                    break;
                case 3:
                    if (match_wc_nor_n(mes.to,0,rule.to,0)) result[mes_id][count++]=rule.action;
                    break;
                case 4:
                    result[mes_id][count++]=rule.action;
                    break;
            }
        }
    }
    return result;
}

//----------------------------------------------------------------------------------------------------------------------
//главная функция;
//проверки входных данных на корректность нет (по условию конкурса этого не требуется);
//отключены проверки наличия обязательных свойств у объектов ("from" и "to" в messages и "action" в rules);
//отключены проверки свойств объектов на пустые строки (по условию конкурса все строки во входных данных не пустые);
//при необходимости все проверки можно включить(раскомментировать соответсвующие строки);
//----------------------------------------------------------------------------------------------------------------------
function filter(messages, rules) {
    var result = {}, is_only_type4 = 0, is_only_noopt = 0, is_only_opt = 0, rm, rm_length;
    var from_opt = [], from_opt_msgids = [], from_opt_r = [], from_opt_r_msgids = [];
    var to_opt = [], to_opt_msgids = [], to_opt_r = [], to_opt_r_msgids = [], msgids = [];
    var is_from_opt = 0, is_to_opt = 0, is_from_opt_r = 0, is_to_opt_r = 0, is_msgids;
    var rwc_noopt = [], r_type4 = [], r_type1_c = [], rwc_noopt2_from = [], rwc_noopt2_to = [];
    var is_to_opt_r_new = 0, is_from_opt_r_new = 0, rwc_noopt_length, r_type4_length, r_type1_c_length;
    var rule, rule2, rule_id, rule_action, rule_from, rule_to, rule_searchstr, rule_wc, rule_sstr_len;
    var mes, mes_id, ind, ind1, ind2, i, j, count, from_wc, to_wc, tind1, tind2,main_email;
    var med_pcount, med_max, dom_percent, dom_percent2,min_direct_pcount = 5, min_reverse_pcount = 10;
    var op_wcsf, op_wc, op_str, op_sort_r, op_inm;
    var checked_emails = [], checked_emails_length= 0, check_main_email_from = 1, check_main_email_to = 1;
    var from_percent, to_percent, from_pcount, to_pcount, cur_weight_from, cur_weight_to;
    var sum_from_pcount = 0, sum_to_pcount = 0, sum_to_pcount2 = 0;
    var f_skip_checked, f_add_check_to = 1, ind_param, from_sf_count, from_nosf_count, to_sf_count, to_nosf_count;
    var stat = {type: [], wc: [], sf11: 0, sf12: 0};
    var m_op_wc = [1.48, 1.48, 1.48, 1.48, 1.48, 1.47, 1.43, 1.42, 1.40, 1.38, 1.40, 1.44, 1.35, 1.33, 1.32, 1.33, 1.25, 1.24, 1.21, 1.24, 1.22];
    var m_op_str = [0.11, 0.11, 0.11, 0.11, 0.11, 0.13, 0.15, 0.23, 0.23, 0.25, 0.26, 0.29, 0.28, 0.28, 0.29, 0.30, 0.31, 0.30, 0.29, 0.31, 0.37];
    var m_op_inm = [0.08, 0.08, 0.08, 0.08, 0.08, 0.03, 0.02, 0.10, 0.13, 0.10, 0.14, 0.14, 0.25, 0.24, 0.36, 0.35, 0.45, 0.45, 0.56, 0.58, 0.79];
    var m_op_sort_r = [2.74, 2.74, 2.74, 2.74, 2.74, 2.91, 2.91, 2.97, 2.86, 2.68, 2.84, 2.99, 3.04, 3.10, 3.22, 3.27, 3.13, 3.28, 3.40, 3.59, 4.36];
    var messages_count = Object.keys(messages).length;
    var rules_count = rules.length;

    if (messages_count <= 0) return result;
    if (rules_count <= 0) {
        for (mes_id in messages) result[mes_id] = [];
        return result;
    }

    //на малом числе сообщений и правил эффективнее решение "в лоб"
    if ((messages_count<30)&&(rules_count<30))
    	return filter_vlob(messages,rules);

    //расчет параметров
    med_pcount = Math.floor(0.2 * messages_count);
    med_max = messages_count - med_pcount;
    dom_percent = 0.05;
    dom_percent2 = 0.2;
    op_wcsf = 1;
    ind_param = Math.floor(Math.log2(messages_count));
    if (ind_param > 20) ind_param = 20;
    op_wc = m_op_wc[ind_param];
    op_str = m_op_str[ind_param];
    op_inm = m_op_inm[ind_param];
    op_sort_r = m_op_sort_r[ind_param];

    //обнуляем статистику
    stat.type[1] = 0; stat.type[2] = 0; stat.type[3] = 0; stat.type[4] = 0;
    stat.wc[200] = 0; stat.wc[211] = 0; stat.wc[212] = 0; stat.wc[202] = 0;
    stat.wc[300] = 0; stat.wc[311] = 0; stat.wc[312] = 0; stat.wc[302] = 0;
    stat.wc[30] = 0; stat.wc[31] = 0; stat.wc[32] = 0; stat.wc[33] = 0; stat.wc[34] = 0; stat.wc[35] = 0;
    stat.wc[36] = 0; stat.wc[4] = 0;

    //первый проход по правилам, классифицируем правила
    rwc_noopt_length = 0; r_type4_length = 0; r_type1_c_length = 0;
    for (rule_id = 0; rule_id < rules_count; rule_id++) {
        rule = rules[rule_id];
        //if (!("action" in rule))
        //   return {"Error": "Отсутствует обязательное свойство action в правиле №"+rule_id};
        //if (rule.action==="")
        //    return {"Error": "Пустая строка в свойстве action правила №"+rule_id};
        //определяем тип правила
        if (("from" in rule) && ("to" in rule)) {
            rule.type = 1;
            //if ((rule.from==="")||(rule.to==="")) return {"Error": "Пустая строка в свойстве правила №"+rule_id};
        }
        else if ("from" in rule) {
            rule.type = 2;
            //if (rule.from==="") return {"Error": "Пустая строка в свойстве правила №"+rule_id};
        }
        else if ("to" in rule) {
            rule.type = 3;
            //if (rule.to==="") return {"Error": "Пустая строка в свойстве правила №"+rule_id};
        }
        else rule.type = 4;

        //определяем тип wildcard
        switch (rule.type) {
            case 1:
                from_wc = classify_wildcards(rule.from); rule.from_wc = from_wc;
                to_wc = classify_wildcards(rule.to); rule.to_wc = to_wc;
                if ((from_wc.wc == 4) && (to_wc.wc == 4)) {
                    rule.type = 4; rule.wc = 4; rule.searchstr = ""; rule.sf = 0;
                }
                else if (from_wc.wc == 4) {
                    rule.type = 3; rule.wc = to_wc.wc; rule.searchstr = to_wc.str; rule.sf = to_wc.sf;
                }
                else if (to_wc.wc == 4) {
                    rule.type = 2; rule.wc = from_wc.wc; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
                }
                else if (from_wc.wc == 0) {
                    rule.wc = 30; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
                }
                else if ((from_wc.sf == 1) && (from_wc.wc == 11)) {
                    rule.wc = 31; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
                }
                else if (to_wc.wc == 0) { 
                    rule.wc = 33; rule.searchstr = to_wc.str; rule.sf = to_wc.sf;
                }
                else if (from_wc.wc == 11) {
                    rule.wc = 31; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
                }
                else if (to_wc.wc == 11) { 
                    rule.wc = 34; rule.searchstr = to_wc.str; rule.sf = to_wc.sf;
                }
                else if ((from_wc.sf == 1) && (from_wc.wc == 12)) {
                    rule.wc = 32; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
                }
                else if ((to_wc.sf == 1) && (to_wc.wc == 12)) {
                    rule.wc = 35; rule.searchstr = to_wc.str; rule.sf = to_wc.sf;
                }
                else if (from_wc.wc == 12) {
                    rule.wc = 32; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
                }
                else if (to_wc.wc != 2) {
                    rule.wc = 35; rule.searchstr = to_wc.str; rule.sf = to_wc.sf;
                }
                else {
                    rule.wc = 36; rule.searchstr = ""; rule.sf = 0;
                }
            break;
            case 2:
                from_wc = classify_wildcards(rule.from);
                if (from_wc.wc == 4) rule.type = 4;
                rule.wc = from_wc.wc; rule.searchstr = from_wc.str; rule.sf = from_wc.sf;
            break;
            case 3:
                to_wc = classify_wildcards(rule.to);
                if (to_wc.wc == 4) rule.type = 4;
                rule.wc = to_wc.wc; rule.searchstr = to_wc.str; rule.sf = to_wc.sf;
            break;
        }

        if ((rule.wc == 2) || (rule.wc == 36)) rwc_noopt[rwc_noopt_length++] = rule_id;
        if (rule.type == 4) r_type4[r_type4_length++] = rule_id;
        if ((rule.wc == 30) || (rule.wc == 33)) r_type1_c[r_type1_c_length++] = rule_id;

        //статистика
        stat.type[rule.type]++;
        if (rule.type == 2 || rule.type == 3)
            stat.wc[100 * rule.type + rule.wc]++;
        else
            stat.wc[rule.wc]++;
        if (rule.wc == 11 || rule.wc == 31 || rule.wc == 34)
            stat.sf11 += rule.sf;
        else if (rule.wc == 12 || rule.wc == 32 || rule.wc == 35)
            stat.sf12 += rule.sf;

    }

    //создаём флаги того надо ли создавать массив оптимизации
    if (((stat.type[2] > 0) && ((stat.wc[200] > 0) || (stat.wc[211] > 0))) ||
        ((stat.type[1] > 0) && ((stat.wc[30] > 0) || (stat.wc[31] > 0)))) is_from_opt = 1;
    if (((stat.type[2] > 0) && (stat.wc[212] > 0)) ||
        ((stat.type[1] > 0) && (stat.wc[32] > 0))) is_from_opt_r = 1;
    if (((stat.type[3] > 0) && ((stat.wc[300] > 0) || (stat.wc[311] > 0))) ||
        ((stat.type[1] > 0) && ((stat.wc[33] > 0) || (stat.wc[34] > 0)))) is_to_opt = 1;
    if (((stat.type[3] > 0) && (stat.wc[312] > 0)) ||
        ((stat.type[1] > 0) && (stat.wc[35] > 0))) is_to_opt_r = 1;

    //ПЕРЕКВАЛИФИКАЦИЯ ПРАВИЛ
    if (is_to_opt_r || is_from_opt_r) {
        is_to_opt_r_new = is_to_opt_r;
        is_from_opt_r_new = is_from_opt_r;

        //оцениваем по среднему(dom_percent средний),
        if (is_to_opt_r) {
            if ((op_inm + op_wc * (stat.wc[312] + 2 * stat.wc[35])) <
                (op_sort_r + dom_percent2 * op_wc * (stat.wc[312] + 2 * stat.wc[35])))
                is_to_opt_r_new = 0;
        }
        if (is_from_opt_r) {
            if ((op_inm + op_wc * (stat.wc[212] + 2 * stat.wc[32])) <
                (op_sort_r + dom_percent2 * op_wc * (stat.wc[212] + 2 * stat.wc[32])))
                is_from_opt_r_new = 0;
        }

        //переквалифицируем правила
        if ((is_to_opt_r_new != is_to_opt_r) || (is_from_opt_r_new != is_from_opt_r)) {
            for (rule_id = 0; rule_id < rules_count; rule_id++) {
                rule = rules[rule_id];
                if ((rule.type == 3 && rule.wc == 12) || rule.wc == 35)
                    if (is_to_opt_r_new != is_to_opt_r) {
                        rule.brc_wc = rule.wc;
                        rule.wc = 2;
                        rwc_noopt2_to[rwc_noopt2_to.length] = rule_id;
                    }
                if ((rule.type == 2 && rule.wc == 12) || rule.wc == 32)
                    if (is_from_opt_r_new != is_from_opt_r) {
                        rule.brc_wc = rule.wc;
                        rule.wc = 2;
                        rwc_noopt2_from[rwc_noopt2_from.length] = rule_id;
                    }
            }
        }
        is_to_opt_r = is_to_opt_r_new;
        is_from_opt_r = is_from_opt_r_new;
    }

    //устанавливаем флаг проверки основного email
    if ((r_type1_c_length <= 1) || (messages_count <= 10)) {
        check_main_email_from = 0; //выкл.
        check_main_email_to = 0; //выкл.
    }
    else {
        check_main_email_from = (stat.wc[30] > 0) ? 1 : 0;
        check_main_email_to = (stat.wc[33] > 0) ? 1 : 0;
        if (check_main_email_to || check_main_email_from) {//создаём прямые массивы
            is_from_opt = 1;
            is_to_opt = 1;
        }
    }

    //предвыделяем память под массивы
    if (is_from_opt) from_opt.length = messages_count;
    if (is_from_opt_r) from_opt_r.length = messages_count;
    if (is_to_opt) to_opt.length = messages_count;
    if (is_to_opt_r) to_opt_r.length = messages_count;
    is_msgids = is_from_opt | is_from_opt_r | is_to_opt | is_to_opt_r;
    if (is_msgids) msgids.length = messages_count;

    if ((r_type4_length == rules_count) && (rwc_noopt_length == 0) &&
        (rwc_noopt2_from.length == 0) && (rwc_noopt2_to.length == 0)) is_only_type4 = 1;
    else if ((rwc_noopt_length == rules_count) && (r_type4_length == 0) &&
        (rwc_noopt2_from.length == 0) && (rwc_noopt2_to.length == 0)) is_only_noopt = 1;
    else if ((r_type4_length == 0) && (rwc_noopt_length == 0) &&
        (rwc_noopt2_from.length == 0) && (rwc_noopt2_to.length == 0)) is_only_opt = 1;
    
    //первый проход по сообщениям
    //применяем правила с wildcard без оптимизации и составляем массивы для оптимизации
    count = 0;
    for (mes_id in messages) {
        mes = messages[mes_id];
        //if ((!("from" in mes))||(!("to" in mes)))
        //    return {"Error": "Отсутствует обязательное свойство в сообщении "+mes_id};
        //if ((mes.from==="")||(mes.to===""))
        //    return {"Error": "Пустая строка в свойстве сообщения "+mes_id};

        //добавляем правила для всех (type=4)
        if (is_only_type4) {
            result[mes_id] = [];
            for (i = 0; i < r_type4_length; i++)
                result[mes_id][i] = rules[r_type4[i]].action;
            continue; //next message
        }
        else {
            result[mes_id] = r_type4.slice(0);
        }

        //применяем правила с wildcard без оптимизации
        for (j = 0; j < rwc_noopt_length; j++) {
            rule = rules[rwc_noopt[j]];
            if (is_only_noopt)
                rule_action = rule.action;
            else
                rule_action = rwc_noopt[j];
            switch (rule.type) {
                case 1:
                    if (match_wc_nor_n(mes.from, 0, rule.from, 0) && match_wc_nor_n(mes.to, 0, rule.to, 0))
                        result[mes_id].push(rule_action);
                break;
                case 2:
                    if (match_wc_nor_n(mes.from, 0, rule.from, 0)) result[mes_id].push(rule_action);
                break;
                case 3:
                    if (match_wc_nor_n(mes.to, 0, rule.to, 0)) result[mes_id].push(rule_action);
                break;
            }
        }

        if (is_from_opt) from_opt[count] = mes.from;
        if (is_from_opt_r) from_opt_r[count] = ((mes.from.split("")).reverse()).join("");
        if (is_to_opt) to_opt[count] = mes.to;
        if (is_to_opt_r) to_opt_r[count] = ((mes.to.split("")).reverse()).join("");
        if (is_msgids) msgids[count] = mes_id;
        count++;
    }

    if (is_only_type4 || is_only_noopt) return result;

    //формируем массивы ключей через slice
    if (is_msgids) {
        if (is_from_opt) from_opt_msgids = msgids;
        else if (is_from_opt_r) from_opt_r_msgids = msgids;
        else if (is_to_opt) to_opt_msgids = msgids;
        else if (is_to_opt_r) to_opt_r_msgids = msgids;

        if (is_from_opt && (from_opt_msgids.length == 0)) from_opt_msgids = msgids.slice();
        if (is_from_opt_r && (from_opt_r_msgids.length == 0)) from_opt_r_msgids = msgids.slice();
        if (is_to_opt && (to_opt_msgids.length == 0)) to_opt_msgids = msgids.slice();
        if (is_to_opt_r && (to_opt_r_msgids.length == 0)) to_opt_r_msgids = msgids.slice();
    }

    //сортируем массивы
    if (is_from_opt) QuickSort3WPNoRwithSM(from_opt, from_opt_msgids, 0, from_opt.length - 1);
    if (is_to_opt) QuickSort3WPNoRwithSM(to_opt, to_opt_msgids, 0, to_opt.length - 1);
    if (is_from_opt_r) QuickSort3WPNoRwithSM(from_opt_r, from_opt_r_msgids, 0, from_opt_r.length - 1);
    if (is_to_opt_r) QuickSort3WPNoRwithSM(to_opt_r, to_opt_r_msgids, 0, to_opt_r.length - 1);

    //второй проход по правилам, применяем правила
    for (rule_id = 0; rule_id < rules_count; rule_id++) {
        rule = rules[rule_id];
        if ((rule.wc == 2) || (rule.wc == 36) || (rule.type == 4)) continue; //пропускаем уже примененные
        rule_from = rule.from;
        rule_to = rule.to;
        rule_searchstr = rule.searchstr;
        rule_sstr_len = rule_searchstr.length;
        if (is_only_opt) rule_action = rule.action; else rule_action = rule_id;

        while (1) {
            rule_wc = rule.wc;
            switch (rule.type) {
                case 1:
                    switch (rule_wc) {
                        case 30:
                            if (check_main_email_from) {
                                f_skip_checked = 0;
                                for (i = 0; i < checked_emails.length; i++) {
                                    if (checked_emails[i].email === rule_from) {
                                        f_skip_checked = 1;
                                        ind1 = checked_emails[i].from_ind1;
                                        ind2 = checked_emails[i].from_ind2;
                                        break;
                                    }
                                }
                                if (!f_skip_checked) {
                                    ind = BinarySearch(from_opt, rule_from);
                                    if (ind < 0) break;
                                    ind1 = BinarySearchLeft2(from_opt, rule_from, ind);
                                    ind2 = BinarySearchRight2(from_opt, rule_from, ind);
                                }
                            }
                            else {
                                ind = BinarySearch(from_opt, rule_from);
                                if (ind < 0) break;
                                ind1 = BinarySearchLeft2(from_opt, rule_from, ind);
                                ind2 = BinarySearchRight2(from_opt, rule_from, ind);
                            }

                            if (check_main_email_from) {
                                if (!f_skip_checked) {
                                    cur_weight_from = ind2 - ind1 + 1;
                                    cur_weight_to = 0;
                                    if (f_add_check_to && (cur_weight_from <= med_pcount)) {
                                        tind1 = BinarySearchLow(to_opt, rule_from, 0, to_opt.length - 1);
                                        if (tind1 >= 0) {
                                            tind2 = BinarySearchHigh(to_opt, rule_from, tind1, to_opt.length - 1);
                                            cur_weight_to = tind2 - tind1 + 1;
                                        }
                                    }
                                    if ((cur_weight_from > med_pcount) || (cur_weight_to > med_pcount)) {
                                        //reclassify_from();
                                        main_email = rule_from;
                                        is_from_opt_r_new = 0;
                                        is_to_opt_r_new = 0;

                                        from_pcount = ind2 - ind1 + 1;
                                        from_percent = (from_pcount / messages_count) * 100.0;
                                        to_percent = 0;
                                        to_pcount = 0;

                                        sum_from_pcount += from_pcount;
                                        sum_to_pcount2 += from_pcount;
                                        if (sum_from_pcount > med_max) check_main_email_from = 0;

                                        //находим кол-во to
                                        if (f_add_check_to && (cur_weight_from <= med_pcount)) {
                                            to_pcount = cur_weight_to;
                                            to_percent = (to_pcount / messages_count) * 100.0;
                                        }
                                        else {
                                            tind1 = BinarySearchLow(to_opt, main_email, 0, to_opt.length - 1);
                                            if (tind1 >= 0) {

                                                tind2 = BinarySearchHigh(to_opt, main_email, tind1, to_opt.length - 1);
                                                to_pcount = tind2 - tind1 + 1;
                                                to_percent = (to_pcount / messages_count) * 100.0;
                                            }
                                        }
                                        sum_to_pcount += to_pcount;
                                        sum_to_pcount2 += to_pcount;
                                        if (sum_to_pcount > med_max) {
                                            check_main_email_to = 0;
                                            f_add_check_to = 0;
                                        }
                                        if (sum_to_pcount2 > med_max) f_add_check_to = 0;

                                        //добавляем проверенный мэйл в кэш
                                        checked_emails[checked_emails_length++] = {
                                            "email": main_email,
                                            "from_ind1": ind1,
                                            "from_ind2": ind2,
                                            "to_ind1": tind1,
                                            "to_ind2": tind2
                                        };

                                        //перекидываем в прямые массивы и оцениваем надо ли создавать обратные
                                        from_sf_count = 0;
                                        from_nosf_count = 0;
                                        to_sf_count = 0;
                                        to_nosf_count = 0;
                                        for (i = 0; i < r_type1_c_length; i++) {
                                            if (r_type1_c[i] < rule_id) continue; //пропускаем уже примененные
                                            rule2 = rules[r_type1_c[i]];
                                            if (rule2.wc == 30) { //from
                                                if (rule2.from != main_email) continue;
                                                if (rule2.to_wc.wc == 0 || rule2.to_wc.wc == 11) {
                                                    rule2.wc = (rule2.to_wc.wc == 0) ? 33 : 34;
                                                    rule2.searchstr = rule2.to_wc.str;
                                                    rule2.sf = rule2.to_wc.sf;
                                                    rule2.rcf = 1;
                                                    rule2.rc_weight = from_pcount;
                                                }
                                                else if (rule2.to_wc.wc == 12) {
                                                    if (is_to_opt_r) { //уже создан, переводим
                                                        rule2.wc = 35;
                                                        rule2.searchstr = rule2.to_wc.str;
                                                        rule2.sf = rule2.to_wc.sf;
                                                        rule2.rcf = 1;
                                                        rule2.rc_weight = from_pcount;
                                                    }
                                                    else { //ещё нет, оцениваем создание
                                                        if ("sf" in rule2) to_sf_count++; else to_nosf_count++;
                                                    }
                                                }
                                            }
                                            else if (rule2.wc == 33) {        //to
                                                if (rule2.to != main_email) continue;
                                                if (rule2.from_wc.wc == 0 || rule2.from_wc.wc == 11) {
                                                    if (to_pcount > min_direct_pcount) {
                                                        rule2.wc = (rule2.from_wc.wc == 0) ? 30 : 31;
                                                        rule2.searchstr = rule2.from_wc.str;
                                                        rule2.sf = rule2.from_wc.sf;
                                                        rule2.rcf = 1;
                                                        rule2.rc_weight = to_pcount;
                                                    }
                                                }
                                                else if (rule2.from_wc.wc == 12) {
                                                    if (is_from_opt_r) { //уже создан, переводим
                                                        if (to_pcount > min_reverse_pcount) {
                                                            rule2.wc = 32;
                                                            rule2.searchstr = rule2.from_wc.str;
                                                            rule2.sf = rule2.from_wc.sf;
                                                            rule2.rcf = 1;
                                                            rule2.rc_weight = to_pcount;
                                                        }
                                                    }
                                                    else { //ещё нет, оцениваем создание
                                                        if ("sf" in rule2) from_sf_count++; else from_nosf_count++;
                                                    }
                                                }

                                            }
                                        }

                                        //оцениваем надо ли создавать обратные массивы
                                        if (!is_from_opt_r) {
                                            if ((from_sf_count * op_wcsf * to_percent + from_nosf_count * op_wc * to_percent) >
                                                (op_sort_r + from_sf_count * op_str * dom_percent + from_nosf_count * (op_str + op_wc) * dom_percent))
                                                is_from_opt_r_new = 1;//создаём
                                            else is_from_opt_r_new = 0;
                                        }
                                        if (!is_to_opt_r) {
                                            if ((to_sf_count * op_wcsf * from_percent + to_nosf_count * op_wc * from_percent) >
                                                (op_sort_r + to_sf_count * op_str * dom_percent + to_nosf_count * (op_str + op_wc) * dom_percent))
                                                is_to_opt_r_new = 1;//создаём
                                            else is_to_opt_r_new = 0;
                                        }

                                        if (is_from_opt_r_new && is_to_opt_r_new)
                                            create_from_r_to_r(messages, from_opt_r, from_opt_r_msgids, to_opt_r, to_opt_r_msgids, QuickSort3WPNoRwithSM);
                                        else if (is_from_opt_r_new)
                                            create_from_r(messages, from_opt_r, from_opt_r_msgids, QuickSort3WPNoRwithSM);
                                        else if (is_to_opt_r_new)
                                            create_to_r(messages, to_opt_r, to_opt_r_msgids, QuickSort3WPNoRwithSM);

                                        //отмечаем флаги факта создания массива
                                        if (is_to_opt_r_new) is_to_opt_r = 1;
                                        if (is_from_opt_r_new) is_from_opt_r = 1;

                                        //второй проход; перекидываем только для обратных
                                        if (is_from_opt_r_new || is_to_opt_r_new) {
                                            for (i = 0; i < r_type1_c_length; i++) {
                                                if (r_type1_c[i] < rule_id) continue; //пропускаем уже примененные
                                                rule2 = rules[r_type1_c[i]];
                                                if (is_to_opt_r_new) {
                                                    if (rule2.wc == 30) { //from
                                                        if ((rule2.from == main_email) && (rule2.to_wc.wc == 12)) {
                                                            rule2.wc = 35;
                                                            rule2.searchstr = rule2.to_wc.str;
                                                            rule2.sf = rule2.to_wc.sf;
                                                            rule2.rcf = 1;
                                                            rule2.rc_weight = from_pcount;
                                                        }
                                                    }
                                                }
                                                if (is_from_opt_r_new) {
                                                    if (rule2.wc == 33) { //to
                                                        if ((rule2.to == main_email) && (rule2.from_wc.wc == 12)) {
                                                            if (to_pcount > min_reverse_pcount) {
                                                                rule2.wc = 32;
                                                                rule2.searchstr = rule2.from_wc.str;
                                                                rule2.sf = rule2.from_wc.sf;
                                                                rule2.rcf = 1;
                                                                rule2.rc_weight = to_pcount;
                                                            }
                                                        }
                                                    }
                                                }
                                            }//for
                                        }//if
                                        continue; //применяем правило заново после реклассификации
                                    }
                                }
                            }

                            if ("rcf" in rule) {
                                if (rule.rcf == 1) {
                                    if ((ind2 - ind1 + 1) > rule.rc_weight) {
                                        rule.wc = 33;
                                        rule.rcf = 0;
                                        continue;
                                    }
                                }
                            }

                            for (i = ind1; i <= ind2; i++) {
                                mes_id = from_opt_msgids[i];
                                if (match_wc_nor_n(messages[mes_id].to, 0, rule_to, 0)) result[mes_id].push(rule_action);
                            }
                        break;
                        case 31:
                            ind = BinarySearchN(from_opt, rule_searchstr, rule_sstr_len);
                            if (ind < 0) break;
                            ind1 = BinarySearchNLeft2(from_opt, rule_searchstr, rule_sstr_len, ind);
                            ind2 = BinarySearchNRight2(from_opt, rule_searchstr, rule_sstr_len, ind);
                            if ("rcf" in rule) {
                                if (rule.rcf == 1) {
                                    if ((ind2 - ind1 + 1) > rule.rc_weight) {
                                        rule.wc = 33;
                                        rule.rcf = 0;
                                        continue;
                                    }
                                }
                            }
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = from_opt_msgids[i];
                                    if (match_wc_nor_n(messages[mes_id].to, 0, rule_to, 0)) result[mes_id].push(rule_action);
                                }
                            }
                            else {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = from_opt_msgids[i];
                                    mes = messages[mes_id];
                                    if ((match_wc_nor_n(mes.from, rule_sstr_len, rule_from, rule_sstr_len)) &&
                                        (match_wc_nor_n(mes.to, 0, rule_to, 0)))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;

                        case 32:
                            ind1 = BinarySearchNLow(from_opt_r, rule_searchstr, rule_sstr_len, 0, from_opt_r.length - 1);
                            if (ind1 < 0) break;
                            ind2 = BinarySearchNHigh(from_opt_r, rule_searchstr, rule_sstr_len, ind1, from_opt_r.length - 1);
                            if ("rcf" in rule) {
                                if (rule.rcf == 1) {
                                    if ((ind2 - ind1 + 1) > rule.rc_weight) {
                                        rule.wc = 33;
                                        rule.rcf = 0;
                                        continue;
                                    }
                                }
                            }
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = from_opt_r_msgids[i];
                                    if (match_wc_nor_n(messages[mes_id].to, 0, rule_to, 0)) result[mes_id].push(rule_action);
                                }
                            }
                            else {

                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = from_opt_r_msgids[i];
                                    mes = messages[mes_id];
                                    if ((match_wc_nor_n(mes.from, 0, rule_from, 0)) && (match_wc_nor_n(mes.to, 0, rule_to, 0)))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;

                        case 33:
                            if (check_main_email_to) {
                                f_skip_checked = 0;
                                for (i = 0; i < checked_emails.length; i++) {
                                    if (checked_emails[i].email === rule_to) {
                                        f_skip_checked = 1;
                                        ind1 = checked_emails[i].to_ind1;
                                        ind2 = checked_emails[i].to_ind2;
                                        break;
                                    }
                                }
                                if (!f_skip_checked) {
                                    ind = BinarySearch(to_opt, rule_to);
                                    if (ind < 0) break;
                                    ind1 = BinarySearchLeft2(to_opt, rule_to, ind);
                                    ind2 = BinarySearchRight2(to_opt, rule_to, ind);
                                }
                            }
                            else {
                                ind = BinarySearch(to_opt, rule_to);
                                if (ind < 0) break;
                                ind1 = BinarySearchLeft2(to_opt, rule_to, ind);
                                ind2 = BinarySearchRight2(to_opt, rule_to, ind);
                            }

                            if (check_main_email_to) {
                                if (!f_skip_checked) {
                                    if ((ind2 - ind1 + 1) > med_pcount) {
                                        //reclassify_to();
                                        main_email = rule_to;
                                        is_from_opt_r_new = 0;
                                        is_to_opt_r_new = 0;

                                        to_pcount = ind2 - ind1 + 1;
                                        to_percent = (to_pcount / messages_count) * 100.0;
                                        from_pcount = 0;
                                        from_percent = 0;

                                        sum_to_pcount += to_pcount;
                                        sum_to_pcount2 += to_pcount;
                                        if (sum_to_pcount > med_max) {
                                            check_main_email_to = 0;
                                            f_add_check_to = 0;
                                        }
                                        if (sum_to_pcount2 > med_max) f_add_check_to = 0;

                                        //находим кол-во from
                                        tind1 = BinarySearchLow(from_opt, main_email, 0, from_opt.length - 1);
                                        if (tind1 >= 0) {

                                            tind2 = BinarySearchHigh(from_opt, main_email, tind1, from_opt.length - 1);
                                            from_pcount = tind2 - tind1 + 1;
                                            from_percent = (from_pcount / messages_count) * 100.0;
                                        }
                                        sum_from_pcount += from_pcount;
                                        if (sum_from_pcount > med_max) check_main_email_from = 0;

                                        //добавляем проверенный мэйл в кэш
                                        checked_emails[checked_emails_length++] = {
                                            "email": main_email,
                                            "from_ind1": tind1,
                                            "from_ind2": tind2,
                                            "to_ind1": ind1,
                                            "to_ind2": ind2
                                        };

                                        //перекидываем в прямые массивы и оцениваем надо ли создавать обратные
                                        from_sf_count = 0;
                                        from_nosf_count = 0;
                                        to_sf_count = 0;
                                        to_nosf_count = 0;
                                        for (i = 0; i < r_type1_c_length; i++) {
                                            if (r_type1_c[i] < rule_id) continue; //пропускаем уже примененные
                                            rule2 = rules[r_type1_c[i]];
                                            if (rule2.wc == 30) { //from
                                                if (rule2.from != main_email) continue;
                                                if (rule2.to_wc.wc == 0 || rule2.to_wc.wc == 11) {
                                                    if (from_pcount > min_direct_pcount) {
                                                        rule2.wc = (rule2.to_wc.wc == 0) ? 33 : 34;
                                                        rule2.searchstr = rule2.to_wc.str;
                                                        rule2.sf = rule2.to_wc.sf;
                                                        rule2.rcf = 1;
                                                        rule2.rc_weight = from_pcount;
                                                    }
                                                }
                                                else if (rule2.to_wc.wc == 12) {
                                                    if (is_to_opt_r) { //уже создан, переводим
                                                        if (from_pcount > min_reverse_pcount) {
                                                            rule2.wc = 35;
                                                            rule2.searchstr = rule2.to_wc.str;
                                                            rule2.sf = rule2.to_wc.sf;
                                                            rule2.rcf = 1;
                                                            rule2.rc_weight = from_pcount;
                                                        }
                                                    }
                                                    else { //ещё нет, оцениваем создание
                                                        if ("sf" in rule2) to_sf_count++; else to_nosf_count++;
                                                    }
                                                }
                                            }
                                            else if (rule2.wc.wc == 33) {        //to
                                                if (rule2.to != main_email) continue;
                                                if (rule2.from_wc.wc == 0 || rule2.from_wc.wc == 11) {
                                                    rule2.wc = (rule2.from_wc.wc == 0) ? 30 : 31;
                                                    rule2.searchstr = rule2.from_wc.str;
                                                    rule2.sf = rule2.from_wc.sf;
                                                    rule2.rcf = 1;
                                                    rule2.rc_weight = to_pcount;
                                                }
                                                else if (rule2.from_wc.wc == 12) {
                                                    if (is_from_opt_r) { //уже создан, переводим
                                                        rule2.wc = 32;
                                                        rule2.searchstr = rule2.from_wc.str;
                                                        rule2.sf = rule2.from_wc.sf;
                                                        rule2.rcf = 1;
                                                        rule2.rc_weight = to_pcount;
                                                    }
                                                    else { //ещё нет, оцениваем создание
                                                        if ("sf" in rule2) from_sf_count++; else from_nosf_count++;
                                                    }
                                                }

                                            }
                                        }

                                        //оцениваем надо ли создавать обратные массивы
                                        if (!is_from_opt_r) {
                                            if ((from_sf_count * op_wcsf * to_percent + from_nosf_count * op_wc * to_percent) >
                                                (op_sort_r + from_sf_count * op_str * dom_percent + from_nosf_count * (op_str + op_wc) * dom_percent))
                                                is_from_opt_r_new = 1; //создаём
                                            else is_from_opt_r_new = 0;
                                        }
                                        if (!is_to_opt_r) {
                                            if ((to_sf_count * op_wcsf * from_percent + to_nosf_count * op_wc * from_percent) >
                                                (op_sort_r + to_sf_count * op_str * dom_percent + to_nosf_count * (op_str + op_wc) * dom_percent))
                                                is_to_opt_r_new = 1; //создаём
                                            else is_to_opt_r_new = 0;
                                        }

                                        if (is_from_opt_r_new && is_to_opt_r_new)
                                            create_from_r_to_r(messages, from_opt_r, from_opt_r_msgids, to_opt_r, to_opt_r_msgids, QuickSort3WPNoRwithSM);
                                        else if (is_from_opt_r_new)
                                            create_from_r(messages, from_opt_r, from_opt_r_msgids, QuickSort3WPNoRwithSM);
                                        else if (is_to_opt_r_new)
                                            create_to_r(messages, to_opt_r, to_opt_r_msgids, QuickSort3WPNoRwithSM);

                                        //отмечаем флаги факта создания массива
                                        if (is_to_opt_r_new) is_to_opt_r = 1;
                                        if (is_from_opt_r_new) is_from_opt_r = 1;

                                        //второй проход; перекидываем только для обратных
                                        if (is_from_opt_r_new || is_to_opt_r_new) {
                                            for (i = 0; i < r_type1_c_length; i++) {
                                                if (r_type1_c[i] < rule_id) continue; //пропускаем уже примененные
                                                rule2 = rules[r_type1_c[i]];
                                                if (is_to_opt_r_new) {
                                                    if (rule2.wc == 30) {
                                                        if ((rule2.from == main_email) && (rule2.to_wc.wc == 12)) {
                                                            if (from_pcount > min_reverse_pcount) {
                                                                rule2.wc = 35;
                                                                rule2.searchstr = rule2.to_wc.str;
                                                                rule2.sf = rule2.to_wc.sf;
                                                                rule2.rcf = 1;
                                                                rule2.rc_weight = from_pcount;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (is_from_opt_r_new) {
                                                    if (rule2.wc == 33) {
                                                        if ((rule2.to == main_email) && (rule2.from_wc.wc == 12)) {
                                                            rule2.wc = 32;
                                                            rule2.searchstr = rule2.from_wc.str;
                                                            rule2.sf = rule2.from_wc.sf;
                                                            rule2.rcf = 1;
                                                            rule2.rc_weight = to_pcount;
                                                        }
                                                    }
                                                }
                                            }//for
                                        }//if
                                        continue; //применяем правило заново после реклассификации
                                    }
                                }
                            }
                            if ("rcf" in rule) {
                                if (rule.rcf == 1) {
                                    if ((ind2 - ind1 + 1) > rule.rc_weight) {
                                        rule.wc = 30;
                                        rule.rcf = 0;
                                        continue;
                                    }
                                }
                            }
                            for (i = ind1; i <= ind2; i++) {
                                mes_id = to_opt_msgids[i];
                                if (match_wc_nor_n(messages[mes_id].from, 0, rule_from, 0)) result[mes_id].push(rule_action);
                            }
                        break;
                        case 34:
                            ind = BinarySearchN(to_opt, rule_searchstr, rule_sstr_len);
                            if (ind < 0) break;
                            ind1 = BinarySearchNLeft2(to_opt, rule_searchstr, rule_sstr_len, ind);
                            ind2 = BinarySearchNRight2(to_opt, rule_searchstr, rule_sstr_len, ind);
                            if ("rcf" in rule) {
                                if (rule.rcf == 1) {
                                    if ((ind2 - ind1 + 1) > rule.rc_weight) {
                                        rule.wc = 30;
                                        rule.rcf = 0;
                                        continue;
                                    }
                                }
                            }
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = to_opt_msgids[i];
                                    if (match_wc_nor_n(messages[mes_id].from, 0, rule_from, 0)) result[mes_id].push(rule_action);
                                }
                            }
                            else {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = to_opt_msgids[i];
                                    mes = messages[mes_id];
                                    if ((match_wc_nor_n(mes.to, rule_sstr_len, rule_to, rule_sstr_len)) &&
                                        (match_wc_nor_n(mes.from, 0, rule_from, 0)))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;
                        case 35:
                            ind1 = BinarySearchNLow(to_opt_r, rule_searchstr, rule_sstr_len, 0, to_opt_r.length - 1);
                            if (ind1 < 0) break;
                            ind2 = BinarySearchNHigh(to_opt_r, rule_searchstr, rule_sstr_len, ind1, to_opt_r.length - 1);
                            if ("rcf" in rule) {
                                if (rule.rcf == 1) {
                                    if ((ind2 - ind1 + 1) > rule.rc_weight) {
                                        rule.wc = 30;
                                        rule.rcf = 0;
                                        continue;
                                    }
                                }
                            }
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = to_opt_r_msgids[i];
                                    if (match_wc_nor_n(messages[mes_id].from, 0, rule_from, 0)) result[mes_id].push(rule_action);
                                }
                            }
                            else {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = to_opt_r_msgids[i];
                                    mes = messages[mes_id];
                                    if ((match_wc_nor_n(mes.to, 0, rule_to, 0)) && (match_wc_nor_n(mes.from, 0, rule_from, 0)))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;
                    }
                break;
                case 2:
                    switch (rule_wc) {
                        case 0:
                            ind = BinarySearch(from_opt, rule_from);
                            if (ind < 0) break;
                            ind1 = BinarySearchLeft2(from_opt, rule_from, ind);
                            ind2 = BinarySearchRight2(from_opt, rule_from, ind);
                            for (i = ind1; i <= ind2; i++) result[from_opt_msgids[i]].push(rule_action);
                        break;
                        case 11:
                            ind = BinarySearchN(from_opt, rule_searchstr, rule_sstr_len);
                            if (ind < 0) break;
                            ind1 = BinarySearchNLeft2(from_opt, rule_searchstr, rule_sstr_len, ind);
                            ind2 = BinarySearchNRight2(from_opt, rule_searchstr, rule_sstr_len, ind);
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++) result[from_opt_msgids[i]].push(rule_action);
                            }
                            else {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = from_opt_msgids[i];
                                    if (match_wc_nor_n(messages[mes_id].from, rule_sstr_len, rule_from, rule_sstr_len))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;
                        case 12:
                            ind1 = BinarySearchNLow(from_opt_r, rule_searchstr, rule_sstr_len, 0, from_opt_r.length - 1);
                            if (ind1 < 0) break;
                            ind2 = BinarySearchNHigh(from_opt_r, rule_searchstr, rule_sstr_len, ind1, from_opt_r.length - 1);
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++)
                                    result[from_opt_r_msgids[i]].push(rule_action);
                            }
                            else {

                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = from_opt_r_msgids[i];
                                    mes = messages[mes_id];
                                    if (match_wc_nor_n(mes.from, 0, rule_from, 0))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;
                    }
                break;
                case 3:
                    switch (rule_wc) {
                        case 0:
                            ind = BinarySearch(to_opt, rule_to);
                            if (ind < 0) break;
                            ind1 = BinarySearchLeft2(to_opt, rule_to, ind);
                            ind2 = BinarySearchRight2(to_opt, rule_to, ind);
                            for (i = ind1; i <= ind2; i++) result[to_opt_msgids[i]].push(rule_action);
                        break;
                        case 11:
                            ind = BinarySearchN(to_opt, rule_searchstr, rule_sstr_len);
                            if (ind < 0) break;
                            ind1 = BinarySearchNLeft2(to_opt, rule_searchstr, rule_sstr_len, ind);
                            ind2 = BinarySearchNRight2(to_opt, rule_searchstr, rule_sstr_len, ind);
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++) result[to_opt_msgids[i]].push(rule_action);
                            }
                            else {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = to_opt_msgids[i];
                                    if (match_wc_nor_n(messages[mes_id].to, rule_sstr_len, rule_to, rule_sstr_len))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;
                        case 12:
                            ind1 = BinarySearchNLow(to_opt_r, rule_searchstr, rule_sstr_len, 0, to_opt_r.length - 1);
                            if (ind1 < 0) break;
                            ind2 = BinarySearchNHigh(to_opt_r, rule_searchstr, rule_sstr_len, ind1, to_opt_r.length - 1);
                            if (rule.sf == 1) {
                                for (i = ind1; i <= ind2; i++)
                                    result[to_opt_r_msgids[i]].push(rule_action);
                            }
                            else {
                                for (i = ind1; i <= ind2; i++) {
                                    mes_id = to_opt_r_msgids[i];
                                    mes = messages[mes_id];
                                    if (match_wc_nor_n(mes.to, 0, rule_to, 0))
                                        result[mes_id].push(rule_action);
                                }
                            }
                        break;
                    }
                break;
            }//switch
            break;
        }//while
    }//for

    //применяем переквалифицированные правила;
    //если были созданы обратные массивы, переносим уже переквалифицированные ранее правила обратно и применяем их
    if (is_from_opt_r && (rwc_noopt2_from.length > 0)) {
        for (i = 0; i < rwc_noopt2_from.length; i++) {
            rule_id = rwc_noopt2_from[i];
            rule = rules[rule_id];
            rule.wc = rule.brc_wc;
            apply_rule_for_rc(rule, rule_id, messages, result, from_opt_r, from_opt_r_msgids, to_opt_r, to_opt_r_msgids);
        }
        rwc_noopt2_from.length = 0;
    }
    if (is_to_opt_r && (rwc_noopt2_to.length > 0)) {
        for (i = 0; i < rwc_noopt2_to.length; i++) {
            rule_id = rwc_noopt2_to[i];
            rule = rules[rule_id];
            rule.wc = rule.brc_wc;
            apply_rule_for_rc(rule, rule_id, messages, result, from_opt_r, from_opt_r_msgids, to_opt_r, to_opt_r_msgids);
        }
        rwc_noopt2_to.length = 0;
    }

    //если не были созданы обратные массивы, применяем переквалифицированные правила
    if ((rwc_noopt2_from.length > 0) || (rwc_noopt2_to.length > 0)) {
        if (!is_msgids) {
            for (mes_id in messages) {
                mes = messages[mes_id];
                for (j = 0; j < rwc_noopt2_from.length; j++) {
                    rule = rules[rwc_noopt2_from[j]];
                    rule_action = rwc_noopt2_from[j];
                    switch (rule.type) {
                        case 1:
                            if (match_wc_nor_n(mes.from, 0, rule.from, 0) && match_wc_nor_n(mes.to, 0, rule.to, 0))
                                result[mes_id].push(rule_action);
                        break;
                        case 2:
                            if (match_wc_nor_n(mes.from, 0, rule.from, 0)) result[mes_id].push(rule_action);
                        break;
                    }
                }
                for (j = 0; j < rwc_noopt2_to.length; j++) {
                    rule = rules[rwc_noopt2_to[j]];
                    rule_action = rwc_noopt2_to[j];
                    switch (rule.type) {
                        case 1:
                            if (match_wc_nor_n(mes.to, 0, rule.to, 0) && match_wc_nor_n(mes.from, 0, rule.from, 0))
                                result[mes_id].push(rule_action);
                        break;
                        case 3:
                            if (match_wc_nor_n(mes.to, 0, rule.to, 0)) result[mes_id].push(rule_action);
                        break;
                    }
                }
            }
        }
        else {
            for (i = 0; i < messages_count; i++) {
                mes_id = msgids[i];
                mes = messages[mes_id];
                for (j = 0; j < rwc_noopt2_from.length; j++) {
                    rule = rules[rwc_noopt2_from[j]];
                    rule_action = rwc_noopt2_from[j];
                    switch (rule.type) {
                        case 1:
                            if (match_wc_nor_n(mes.from, 0, rule.from, 0) && match_wc_nor_n(mes.to, 0, rule.to, 0))
                                result[mes_id].push(rule_action);
                        break;
                        case 2:
                            if (match_wc_nor_n(mes.from, 0, rule.from, 0)) result[mes_id].push(rule_action);
                        break;
                    }
                }
                for (j = 0; j < rwc_noopt2_to.length; j++) {
                    rule = rules[rwc_noopt2_to[j]];
                    rule_action = rwc_noopt2_to[j];
                    switch (rule.type) {
                        case 1:
                            if (match_wc_nor_n(mes.to, 0, rule.to, 0) && match_wc_nor_n(mes.from, 0, rule.from, 0))
                                result[mes_id].push(rule_action);
                        break;
                        case 3:
                            if (match_wc_nor_n(mes.to, 0, rule.to, 0)) result[mes_id].push(rule_action);
                        break;
                    }
                }
            }
        }
    }

    //сортируем правила и изменяем номера на названия actions,
    if ((rwc_noopt_length > 0) || (r_type4_length > 0) || (rwc_noopt2_from.length > 0) || rwc_noopt2_to.length > 0) {
        if (rules_count <= 44) {
            for (mes_id in result) {
                rm = result[mes_id];
                rm_length = rm.length;
                InsertSort(rm);
                //заменяем номера правил на соответсвующие actions
                for (j = 0; j < rm_length; j++) rm[j] = rules[rm[j]].action;
            }
        }
        else {
            for (mes_id in result) {
                rm = result[mes_id];
                rm_length = rm.length;
                if (rm_length <= 44)
                    InsertSort(rm);
                else if (rm_length <= 32767)
                    MergeSortR_44(rm);
                else
                    ShellSortKnuth(rm);
                //заменяем номера правил на соответсвующие actions
                for (j = 0; j < rm_length; j++) rm[j] = rules[rm[j]].action;
            }
        }
    }

    return result;
}
//----------------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------------
exports.filter = filter;
//----------------------------------------------------------------------------------------------------------------------