Mail Filtering Engine
====
The filtering module for an e-mail system.

[![Build Status](https://travis-ci.com/pyp/challenge_mail_filter.svg?token=qNwxRaEgFCcBCFs4QBgQ&branch=master)](https://travis-ci.com/pyp/challenge_mail_filter)

Install
-------

`npm install`

Usage
-----

A `filter` function has two arguments:

* `messages` is a mapping of unique message IDs to objects with two string properties: from and to. 
Each object describes one e-mail message.
* `rules` is an array of objects with three string properties: from (optional), to (optional), and action (mandatory). 
Each object describes one mail filtering rule.
 
```
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

Expected result is:

```
{
    msg1: ['folder jack', 'forward to jill@elsewhere.com'],
    msg2: ['tag spam', 'forward to jill@elsewhere.com'],
    msg3: ['tag work']
}
```

Test
-------

`npm test`

Benchmark
----------

`node benchmark/benchmark.js`
