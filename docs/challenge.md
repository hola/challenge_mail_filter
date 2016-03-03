# Mail Filtering Engine Callenge

Welcome to Hola's new programming challenge! Do you have the skills to write the fastest code? There's prize money at stake:

1. First prize: 1500 USD.
2. Second prize: 1000 USD.
3. Third prize: 500 USD.
4. We might also decide to award a 350 USD special prize for an exceptionally creative approach.
5. If you e-mail the link to this page to someone, with challengejs@hola.org in CC, and that someone enters the competition and wins a prize, you will receive the same amount, too!

For Hola, it's a chance to get to know many talented programmers, and to invite those who submit good code for job interviews.

## Rules
This time, we tried to eliminate every possible way for subjective judgment to affect the outcome. The fastest code, as long as it passes our correctness tests, wins.

* Send your solution to challengejs@hola.org.
* Submission deadline: **December 25, 2015**, 23:59:59 UTC.
* Winners will be announced on **January 8, 2016**.
* You may submit more than once. Only your latest submission, as long as it's still before the deadline, will be evaluated.
* We will use **Node.js v5.0.0** (stable release at the time of this publication) for testing.
* Your code must all be in a **single JS file**.
* Your submission must be in pure JS. If you prefer CoffeeScript or similar, translate to JS before submitting. Attaching your source in the original language (in addition to, not instead of JS) is welcome but not required.
* It is **not allowed to require any JS modules**, not even the standard ones built into Node.js.
* We will test your solution for both correctness and performance. Only solutions that pass the correctness testing will be admitted to performance testing. The fastest of the correct solutions wins.
* All submissions, as well as our correctness and performance tests, will be published after the end of the competition.
* Your full name (or a pseudonym if you sign your solution with one), but not your e-mail address, will be published.
* Do not publish your solution before the submission deadline, or you will be disqualified.
* If the problem statement seems ambiguous, check our reference implementation instead of asking us questions; but please [do tell us](mailto:challengejs@hola.org) if you suspect that the reference implementation contradicts this problem statement for a certain input.

## Problem Statement
You are in charge of developing the filtering engine for an e-mail system. Your task is to write a Node.js module exporting one single function:
```javascript
filter(messages, rules)
```
* `messages` is a mapping of unique message IDs to objects with two string properties: `from` and `to`. Each object describes one e-mail message.
* `rules` is an array of objects with three string properties: `from` (optional), `to` (optional), and `action` (mandatory). Each object describes one mail filtering rule.

All strings in the input are non-empty and only contain ASCII characters between `0x20` and `0x7F` (inclusive).

A rule is said to match a message if its `from` and `to` properties simultaneously match the corresponding properties of the message. The matching is case-sensitive, with `*` in the rule matching any number (zero or more) of arbitrary characters, and ? matching exactly one arbitrary character. If `from` or `to` are omitted, they are assumed to have the default value `*`. As a consequence, a rule that has neither `from` nor `to`, matches all messages.

Every message must have all matching rules applied to it, in the order in which the rules are listed. The `filter` function returns a mapping of message IDs to arrays of actions. For each message, the array should contain the values of the `action` property from all rules that match this message, respecting the order of the rules. If no rules match a certain message, its corresponding array in the output must still exist (and be empty).

## Example
Here is an example of a typical valid call to the `filter` function:
```javascript
filter({
    msg1: {from: 'jack@example.com', to: 'jill@example.org'},
    msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
    msg3: {from: 'boss@work.com', to: 'jack@example.com'}
}, [
    {from: '*@work.com', action: 'tag work'},
    {from: '*@spam.com', action: 'tag spam'},
    {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
    {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
])
```
This is what a correct implementation of `filter` would return in the above case:
```javascript
{
    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
    msg3: ['tag work']
}
```

## <a name="impl"></a>Reference Implementation
We have set up a reference implementation [here](https://github.com/hola/challenge_mail_filter/blob/master/tests/reference.js). For a given input to the `filter` function, it will produce the correct output. It will strictly reject any inputs that are not valid according to this problem statement (note that your own solution is not required to validate its inputs). Please use the reference implementation instead of asking us questions about the problem statement; but please [do tell us](mailto:challengejs@hola.org) if you suspect that the reference implementation contradicts this problem statement for a certain input.

To limit the load on our server, we have restricted the inputs to a maximum of 10 rules and 10 messages in our reference implementation; your own solution must not have any such limit.

You can make HTTP POST requests to the URL mentioned above with a body of type `application/json`. The body of the request should be a JSON object with two properties: `messages` and `rules`, containing the values of the corresponding arguments of the `filter` function. The JSON response body will be the value that the function must return. For invalid inputs, or when the size limits are exceeded, the response will be HTTP 400 with an error message in the `text/plain` body.

