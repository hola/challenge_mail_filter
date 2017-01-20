
//------------------------------------------------------------------------------
// Razumenko Maksim
// razumenko.maksim@gmail.com
//------------------------------------------------------------------------------

module.exports = filter

//------------------------------------------------------------------------------
function filter(messages, rules)
{
    var message
      , m
      , tmp
      , rule
      , i
      , rules_len = rules.length
      , test_from
      , test_to

      , cache = {}
      , key
      , value

    extend_rules(rules)

    for (message in messages)
    {
        m     = messages[message]
        key   = (m.from ? m.from : '') + (m.to ? m.to : '')
        value = cache[key]

        if (value)
        {
            messages[message] = value
            continue
        }

        tmp = []

        for(i = 0; i < rules_len; i++)
        {
            rule = rules[i]

            test_from = m.from && rule.from
            test_to   = m.to   && rule.to

            if (rule.all)
            {
                tmp.push(rule.action)
            }
            else if (test_from && test_to)
            {
                check_field(m.from, rule.from, rule.is_from_re, rule.from_part) &&
                check_field(m.to,   rule.to,   rule.is_to_re,   rule.to_part) &&
                tmp.push(rule.action)
            }
            else if (test_from)
            {
                check_field(m.from, rule.from, rule.is_from_re, rule.from_part) &&
                tmp.push(rule.action)
            }
            else if (test_to)
            {
                check_field(m.to, rule.to, rule.is_to_re, rule.to_part) &&
                tmp.push(rule.action)
            }
        }

        cache[key] = messages[message] = tmp
    }

    return messages
}

//------------------------------------------------------------------------------
function check_field(from_to, rule, is_rule_re, part)
{
    if (!is_rule_re) return from_to === rule

    if (part && from_to.indexOf(part) === -1) return

    return rule.test(from_to)
}

//------------------------------------------------------------------------------
function extend_rules(rules)
{
    var rule
      , i
      , rules_len = rules.length

    for(i = 0; i < rules_len; i++)
    {
        rule = rules[i]

        if (rule.from === '*')      rule.from = false
        if (rule.to   === '*')      rule.to   = false

        if (!rule.from && !rule.to) rule.all  = true

        rule.from && extend_rule('from', rule)
        rule.to   && extend_rule('to',   rule)
    }
}

//------------------------------------------------------------------------------
function extend_rule(name, rule)
{
    var r       = rule[name]
      , is_re_1 = r.indexOf('?') !== -1
      , is_re_2 = r.indexOf('*') !== -1
      , is_re   = is_re_1 || is_re_2
      , rule_re
      , max_part

    rule["is_" + name + "_re"] = is_re

    if (is_re)
    {
        rule_re = hide_from_re(r)

        if (is_re_1) rule_re = rule_re.replace(/\?/g, '[\x20-\x7f]{1}')
        if (is_re_2) rule_re = rule_re.replace(/\*/g, '(.*)')

        rule[name] = new RegExp("^" + rule_re + "$")

        max_part = get_max_part(r)
        max_part.length && (rule[name+'_part'] = max_part)
    }
}

//------------------------------------------------------------------------------
function hide_from_re(rule)
{
    return rule
        .replace(/\\/g, '\\\\')

        .replace(/\(/g, '_(_')
        .replace(/\)/g, '(\\))')
        .replace(/(_\(_)/g, '(\\()')

        .replace(/\[/g, '(\\[)')
        .replace(/\]/g, '(\\])')

        .replace(/\{/g, '[{]')
        .replace(/\}/g, '[}]')

        .replace(/\./g, '[.]')
        .replace(/\$/g, '[$]')
        .replace(/\|/g, '[|]')
        .replace(/\+/g, '[+]')
        .replace(/\^/g, '(\\^)')
}

//------------------------------------------------------------------------------
function get_max_part(rule)
{
    var max_index = 0
      , i
      , parts = rule.split(/[\*\?]+/)
      , len   = parts.length

    for (i = 1; i < len; i++)
    {
        if (parts[max_index].length < parts[i].length) max_index = i
    }

    return parts[max_index];
}

//------------------------------------------------------------------------------
