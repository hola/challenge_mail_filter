Hola Challenge 2015 - Mail Filtering by Lee Elenbaas
====================================================

Submitter
---------
Lee Elenbaas
[lee@elenbaas.org.il](mailto:lee@elenbaas.org.il)

Challenge
---------
[http://hola.org/challenge_mail_filter](http://hola.org/challenge_mail_filter)

Files
-----

README.md* - (This file) Description of this project, with change log.
mail-filter.js* - The mail filter submission. This file is the sole purpose of this project, a JS that can be submitted as a solution for the challenge.
package.json* - Node/NPM package definition for my project.
.gitignore - Git ignore rules to make sure my SCM will ignore files that should not be added in.
spec/ - Testing of the mail-filter.js for its correctness (Testing using jasmin.)
tests/ - Performance testing for different approaches to perform different tasks inside mail-filter.js (Testing uses jasmine to run the tests and console.time/endTime to time the different approaches.)

Those files all exists in the repository: [bitbucket:lee_elenbaas/hola-2015-challenge-mail-filter](https://bitbucket.org/lee_elenbaas/hola-2015-challenge-mail-filter).
Only files marked with * are part of the npm package.

Log
---

21-12-2015 - Some larger tests

> Adding to the jeneral spec some larger size tests, and playing with the repeat parameters to see how the timing handles larger timings.
> ` jasmine `

20-12-2015 - Improve pattern clasification

> Testing for the pattern classification time resulted in remaining withthe design of multiple regExp patterns for each pattern type.
> ` jasmine tests/classify-pattern/time.specs.js `

19-12-2015 - Improve testing by separation of the preparation from the usage

> Tests show that using objects with prototype mechanism makes for faster preparation time, but slower execution time.
> In this case i prefer execution time over preparation time.
> After starting to implement the simplified cases, ia m looking deeper into the contains case, and the starts/emdsWith cases where i might also be able to handle ? better then regex.
> Another point is problematic in my tests, it appears that the last tests are delayed more than the first tests (if i reorder the tests i get a different result)

17-12-2015 - Testing for starts with and ends with

> Added timing tests for starts/ends with implementations
> ` jasmine tests/starts-with-match/time.specs.js `
> ` jasmine tests/ends-with-match/time.specs.js `

15-12-2015 - Pattern class implementation done

> I created my own custom implementation for pattern matching that handles just the limited syntax allowed here.
> ` jasmine tests/pattern-matching/match-pattern.spec.js `
> ` jasmine tests/pattern-matching/match-pattern-part.spec.js `
> But timeing tests show that it is no better than using regex as i initially started.
> ` jasmine tests/exact-match/time.specs.js `
> Further testing about null matches, show that object creation is less of an issue then i suspected.
> ` jasmine tests/null-match/time.specs.js `
> This leads me again to want to test for several key formats: null matches, exact match, starts with, ends with and complex.
> Let complex be handled by the regex, while use for the other cases each its best option. But for that i need to start saving timing results, or be able to run them across implementations.

12-12-2015 - Object iteration performance improvement

> Perform tests on different object iteration approaches, and update the filter to use the best option.
> The same for array-iteration & array-mapping
> Tests can be run using:
> ` jasmine tests/object-iteration/time.specs.js `
> ` jasmine tests/array-iteration/time.specs.js `
> ` jasmine tests/array-map/time.specs.js `

11-12-2015 - Build basic implementation

> Basic implementation that perform the task, with tests that check it and validate the implementation against the reference implementation from hola
> Tests can be run using: git push` jasmine `

Performance ideas:
------------------
* Improve matching
* Multitask
