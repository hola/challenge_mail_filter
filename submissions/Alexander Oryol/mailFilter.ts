interface Message {
    from: string;
    to: string;
}

interface Messages {
    [messageKey: string]: Message;
}

interface Rule {
    from?: string;
    to?: string;
    action: string;
}

interface RxRule {
    fromRx: RegExp;
    toRx: RegExp;
    action: string;
}


function createRegExp(p: string) {
    if (!p || p === "*")
        return null;

    const rx = p
        .replace(/(\.|\+|\[|\]|\(|\)|\^|\$|\||\\|\{|\})/g, "$&")
        .replace(/\*/, ".*")
        .replace(/\?/, ".");

    return new RegExp(`^${rx}$`);
}

export function filter(messages: Messages, rules: Rule[]) {
    // create rx rules
    const rxRules = [];

    for (const rule of rules) {
        rxRules.push({
            fromRx: createRegExp(rule.from),
            toRx: createRegExp(rule.to),
            action: rule.action
        });
    }

    // filter messages
    const result = {};

    for (const messageKey in messages) {
        const actions = [];
        const message = messages[messageKey];

        for (const rule of rxRules) {
            if ((!rule.fromRx || rule.fromRx.test(message.from)) &&
                (!rule.toRx || rule.toRx.test(message.to))) {
                actions.push(rule.action);
            }
        }

        result[messageKey] = actions;
    }

    return result;
}
