# <img src=https://hola.org/img/hola_clean.png> Hola JS Challenge Winter 2015
## Mail Filtering Engine: Final Results

In winter 2015, we held a [programming contest](docs/challenge.md). Thanks to all who participated!

The problem statement and detailed rules are available on the contest page linked above. Now that the contest is over, we're publishing all the solutions we received, and announcing the winners.

## Statistics
We received a total of 408 submissions from 237 different participants. Only the last submission from each participant, received within the deadline, is published here in the `submissions` directory.

An additional 14 solutions were submitted either after the deadline or by Hola employees, and we considered them hors concours (off-contest). These are found in the `extra` directory.

64 solutions, or 16% of the total number, were submitted within the last 24 hours before the deadline; 15 of these were submitted within the last hour, and last one of these only 34 seconds before the deadline.

92 programs, or 39% of all participating solutions, passed our correctness tests. Also, 10 of the solutions considered hors concours passed.

The shortest correct submission is exactly 666 bytes long, while the longest one is 90274 bytes long.

## The Testing methodology
The correctness and performance tests were automatic. Correctness is tested by `tests/correctness.js` and performance by `tests/performance.js`.

Our [reference implementation](docs/challenge.md#impl), the same as was set up on our website, is included here as `tests/reference.js`. The reference implementation includes strict input validity testing and an optional input size limitation (to restrict the load on the website); neither of these features was expected of contest submissions.

### Correctness
The correctness tests can be found in the body of `tests/correctness.js`.

Unfortunately, many of the submissions failed on one or another corner case. Syntax errors, use of `require` (forbidden by the rules), and failure to export a `filter` function were considered correctness failures. If you are wondering why a particular solution failed, you can run the test program on the solution file and see the output.

Note that a few solutions passed the correctness tests but still produced wrong results in the performance tests; these were treated as having failed correctness.

### Performance
Performance testing consisted of one large test with 100,000 messages and 100 rules. We also generated an even larger test set with 800,000 messages and 100 rules.

The inputs for the performance tests were generated by `tests/generate_large_test.js`; to produce the expected outputs, the reference implementation was used.  We didn't include the test data files because of their size, but you can run the generating script to recreate exactly the same content as we used. The generating script uses a random number generator with a fixed seed, so that it produces the same output on every run. The statistical characteristics that we chose for the performance test are somewhat plausible for a real e-mail database of a typical user. Please refer to the script's source code for further details.

The performance tests were run on a 3 GHz Intel Core i7 machine running 64-bit Debian GNU/Linux (testing). Each submission was run 10 times (in 10 separate runs of `tests/performance.js`), and the best time was selected. The timing was taken by the real-time clock; it included the module parsing and initialization time.

### The export controversy
After we published the contest rules, we realized that one of the requirements was ambiguous: “Your task is to write a Node.js module exporting one single function `filter(messages, rules)`”. We originally intended it to mean a named export:

```javascript
exports.filter = function(messages, rules){ ... };
```

However, many participants interpreted it differently:

```javascript
module.exports = function(messages, rules){ ... };
```

Both seem to be coherent interpretations of the rules, and we decided to accept either way of exporting.

Yet some other submissions did not export the function at all, but merely defined it in their source files:

```javascript
function filter(messages, rules){ ... }
```

Because the rules clearly say “exporting”, we considered such solutions as failing. Nevertheless, we tried to fix each of these solutions and see if they would then pass. Only one solution passed, and was considered hors concours (see remark [2] in the final standings below).

### The controversy over the final standings
When we published the original version of the final standings, several participants have pointed out several defects. Firstly, we received two contributions to the correctness test suite. Thanks to the contributors! The additional tests helped detect several solutions that produce wrong results in some corner cases.

More troubling was a defect in our performance testing methodology. The Node.js `vm` module that we were originally using for performance testing, turned out to distort the measurements significantly. Namely, access to the globals within the virtual environment was disproportionately slow. In particular, those solutions whose authors chose to include all their helper functions in the body of the `filter` function, performed faster than those where helper functions were defined outside `filter`. We believe that this kind of stylistic choice should not have a dramatic effect on the results. Most participants seem to have been testing their solutions in simple test harnesses with `require`, without the use of `vm`, and weren't optimizing to the peculiarities of the Node.js virtualization technology.

At Hola, [we take pride in admitting mistakes](http://hola.org/dna#truth-mistakes). In the light of this serious flaw, we made a decision to revise the final standings. Our new test program, `tests/performance.js`, uses `require` to load the participant's module and run the `filter` function once. We ran it 10 times for every solution in a kernel-level VM and chose the best time.

We also received criticism on some other aspects of our performance testing, which I'll try to answer here:

* _The performance test does not include `?` characters in any rules._ The rationale here is that in real life, users rarely use `?` in their rules. I can't imagine why anyone would want that in a real rule. Just like in a real filtering system, there are some features that go unused or almost unused. In contrst to correctness tests, performance tests should resemble actual patterns of usage. Moreover, most of our patterns did not even include a `*`: most of the time, a user only wants to match a specific e-mail address. Where we did use `*`, it was used for the whole part of the address before or after the `@` character.
* _Performance should be tested with more rules._ When a user's database grows, the number of rules doesn't normally grow proportionally. The number of rules that we chose (100) is more than enough even for advanced e-mail users. Therefore we didn't test for scalability along this dimension.
* _Performance should be tested with more messages._ We chose 100,000 messages because it is on the order of the yearly number of messages in a typical heavy e-mail user's database. Nevertheless, responding to the critique, we tried increasing this number. About 800,000 seemed to be about the highest number of messages that didn't cause any of the correct submissions to run out of memory with the default Node.js engine settings, so we decided to go with this number in our extra-large test (see the `xlarge` option in `tests/generate_large_test.js`). Using the extra-large test, we also ran every correct solution 10 times. From what we saw, the extra-large test would change the final standings significantly, and so would certain in-between dataset sizes. Both 100,000 and 800,000 messages are valid choices, and we could pick one or the other, or combine them somehow in a weighted average. However, we decided to keep the changes to the minimum and only fix that which is obviously a defect (the Node.js `vm` issue), while otherwise sticking to our original test material.
* _The performance tests should have been published in advance._ The reason we didn't do that is that we didn't want participants to optimize for a specific test (or even try to manipulate it). We wanted programs that are correct on all valid inputs, and fast on typical use cases. Still, the lesson we learned from this is that at least the size of the test inputs should probably be published in advance.

## Final standings
The performance scores in this table are the best times out of 10 runs, in milliseconds. Solutions for which there isn't a performance score in the table, failed correctness tests or produced wrong results on the performance test. The final standings are ranked by the performance score on the `large` test (100,000 messages); the results of the `xlarge` test (800,000 messages) are included as well for your information.

We are sorry that we had to revise the final standings. Our apologies to the originally announced winners (whose solutions are undoubtedly very good).

Fianlly, we decided to award the 350 USD special prize to the author of the shortest correct submission.

Congratulations to the winners!

Place | Name                                | Performance | Performance (xlarge) | Remark
-----:|-------------------------------------|------------:|---------------------:|--------------------------
    1 | Roman Pletnev                       |         231 |                 2549 | **1500 USD prize**
      | Ouanalao                            |         260 |                 2676 | Hors concours
    2 | Andrew Kashta                       |         281 |                 2917 | **1000 USD prize**
      | Pavel Gruba                         |         286 |                 2993 | Hors concours
    3 | Evgeny Zeyler                       |         292 |                 2351 | **500 USD prize**
      | Vitaliy (vint)                      |         304 |                 2837 | Hors concours
    4 | Yuri Kilochek                       |         332 |                 2130 |
      | Ecma Scripter                       |         333 |                 2711 | Disqualified[[1](#rem1)]
    5 | Alex Kheben                         |         360 |                 2953 |
    6 | Igor Klopov                         |         367 |                 2745 |
      | Maksim Razumenko                    |         368 |                 3555 | Hors concours
    7 | Sergey Golub                        |         375 |                 3891 |
    8 | Alexander Rusakov                   |         382 |                 3495 |
    9 | Denis Bezrukov                      |         394 |                 3581 |
   10 | Vitalii Petrychuk                   |         403 |                 3701 |
   11 | Ilya Makarov                        |         431 |                 3632 |
   11 | Max Brodin                          |         431 |                 3772 |
   12 | R5t4nah6                            |         432 |                 3668 |
   13 | yuri_c                              |         436 |                 3491 |
   14 | Denis Kepeshchuk                    |         450 |                 3326 |
   15 | Hayk Martirosyan                    |         455 |                 3050 |
   16 | Denis Kreshikhin                    |         467 |                 3247 |
   17 | Andrey Pogoreltsev                  |         491 |                 3928 |
   18 | Nikolay Kuchumov                    |         504 |                 4374 |
      | Evgeny Shiryaev                     |         545 |                 3739 | Hors concours
   19 | Alexey Kolpakov                     |         556 |                 4262 |
   20 | Pavel Gruba                         |         576 |                 4794 |
      | Typealias Nonmutating               |         576 |                 4849 | Hors concours
   21 | Sergey Ivanov                       |         585 |                 5196 |
   22 | Vladimir Privalov                   |         589 |                 4252 |
   23 | Sergey Mikhailovich                 |         593 |                 4562 |
   24 | Nikolay Karev                       |         597 |                 4387 |
   25 | Ionicman                            |         612 |                 5177 |
   26 | Evgenii Kazmiruk                    |         618 |                 5523 |
   27 | Kobi                                |         625 |                 4670 |
   28 | Andrey Chernykh                     |         639 |                 6063 |
   28 | Denys Skychko                       |         639 |                 5352 |
   29 | Alexey Larkov                       |         645 |                 4636 |
   30 | KingOfNothing                       |         661 |                 4832 |
      | Pavel Kingsep                       |         667 |                 5068 | Hors concours
      | Dmitry Rybin                        |         683 |                 5441 | Hors concours
   31 | Sergey Petkun                       |         686 |                 4558 |
   32 | Andy5938                            |         703 |                 5223 |
   33 | Dmitry Rybin                        |         717 |                 6090 |
   34 | Vladimir Barbarosh                  |         740 |                 6908 |
   35 | Maxim Drozdov                       |         748 |                 5346 |
   36 | Oleg Popov                          |         763 |                 8351 |
   37 | Aydar Mirzagitov                    |         770 |                 6053 |
   38 | Dmitry Podgorniy                    |         803 |                 6235 |
   39 | Pavel Koltyshev                     |         821 |                 6560 |
   39 | Vasiliy Kostin                      |         821 |                 6098 |
   40 | Pavel Orlov                         |         843 |                 7954 |
   41 | Katerina Pavlenko                   |         844 |                 6547 |
   42 | Igor Potapov                        |         851 |                 7968 |
   43 | Alexander Ilyin                     |         864 |                 5165 |
   44 | Alina Lozhkina                      |         887 |                 8187 |
   45 | Nadav Ivgi                          |         915 |                 7944 | **350 USD special prize**
   46 | Vladislav Nezhutin                  |         940 |                 8512 |
   47 | Siroj Matchanov                     |         950 |                 8344 |
      | Alexey Vedyakov                     |         966 |                 7871 | Hors concours
   48 | Sergey Savelyev                     |         976 |                 7893 |
   49 | Daniil Onoshko                      |        1027 |                 9650 |
   50 | Alexander Zonov                     |        1033 |                 8088 |
   51 | Nickolay Savchenko                  |        1044 |                 8448 |
   52 | Ilya Mochalov                       |        1060 |                 8356 |
   53 | Danila Sukhanov                     |        1062 |                 8846 |
   54 | Arkadi Klepatch                     |        1063 |                 6682 |
   55 | Vitaly Dyatlov                      |        1067 |                10053 |
      | Aur Saraf                           |        1080 |                 8739 | Hors concours
   56 | Vitali Koshtoev                     |        1085 |                10181 |
   57 | Yuriy Khabarov                      |        1119 |                 9154 |
   58 | Aleksey Sergey                      |        1238 |                10601 |
   59 | Denis Protasov                      |        1270 |                10702 |
   60 | Serj Karasev                        |        1282 |                 9920 |
   61 | Valeriy Petlya                      |        1338 |                10628 |
   62 | Stanislav Vyshchepan                |        1382 |                11828 |
   63 | Dmitry Egorov                       |        1584 |                13452 |
      | Vladimir Menshakov                  |        1586 |                 9207 | Hors concours
   64 | Georgy Chebanov                     |        1591 |                14050 |
   65 | Ori Lahav                           |        1705 |                10914 |
   66 | Ruslan Minukov                      |        1774 |                17762 |
      | Evgeny Semyonov                     |        1882 |                16299 | Needed a fix[[2](#rem2)]
   67 | Jarek Płocki                        |        1982 |                16282 |
   68 | Sergey Lichack                      |        2105 |                15071 |
   69 | Alexey Chemichev                    |        2131 |                17971 |
   70 | Zibx                                |        2165 |                20335 |
   71 | Evgeny Lukianchikov                 |        2204 |                14319 |
   72 | berrunder                           |        2372 |                19356 |
   73 | Alexey Pushnikov                    |        2390 |                19320 |
   74 | Vyacheslav Bazhinov                 |        2543 |                16444 |
   75 | Slava Shklyaev                      |        2644 |                23627 |
   76 | Alex Ku                             |        2714 |                16372 |
   77 | Kirill Bykov                        |        2976 |                21976 |
   78 | Aleksei Murashin                    |        3258 |                29899 |
   79 | Vyacheslav Ryabinin                 |        3305 |                21615 |
   80 | Alexander Savchuk                   |        3375 |                45047 |
   81 | Vladimir Osipov                     |        4158 |                24410 |
   82 | Igor Vladimirovich                  |        4979 |                27130 |
   83 | nerv                                |        5375 |                38244 |
   84 | Nikolay Shevlyakov                  |        5931 |                56813 |
   85 | Dan Revah                           |        6172 |                62275 |
   86 | Konstantin Boyandin                 |        6970 |                57292 |
   87 | Nikita Isaev                        |        8280 |                64665 |
   88 | Ilya Chervonov                      |       10448 |                84935 |
      | Adam Yahid                          |             |                      |
      | Aleksandrs Fiļipovs                 |             |                      |
      | Alex Netkachov                      |             |                      |
      | Alex Vishnevsky                     |             |                      |
      | Alex Vishnevsky                     |             |                      | Hors concours
      | Alexander Baygeldin                 |             |                      |
      | Alexander Dubovsky                  |             |                      |
      | Alexander Hasselbach                |             |                      |
      | Alexander Kazachenko                |             |                      |
      | Alexander Oryol                     |             |                      |
      | Alexander Zasim                     |             |                      |
      | Alexey Alexandrovich                |             |                      |
      | Alexey Diyachenko                   |             |                      |
      | Alexey Efremov                      |             |                      |
      | Alexey Gora                         |             |                      |
      | Alexey Nichiporchik                 |             |                      |
      | Alexey Sadovin                      |             |                      |
      | Alexey Semashkevich                 |             |                      |
      | Alexey Vedyakov                     |             |                      |
      | Almaz Mubinov                       |             |                      |
      | Amir Absalyamov                     |             |                      |
      | Anatoly                             |             |                      |
      | Andrey Grankin                      |             |                      |
      | Andrey Kostakov                     |             |                      |
      | Andrey Kuznetsov                    |             |                      |
      | Andrey Saponenko                    |             |                      |
      | Andrey Solodovnikov                 |             |                      |
      | Anton Ivakin                        |             |                      |
      | Anton Podkuyko                      |             |                      |
      | Anton Vashurkin                     |             |                      |
      | Artem Kudryavtsev                   |             |                      |
      | Artem Mitloshuk                     |             |                      |
      | Arthur Khusaenov                    |             |                      |
      | Arthur Okeke                        |             |                      |
      | Bilik Sandanov                      |             |                      |
      | Black Knight                        |             |                      |
      | Daniel Shir                         |             |                      |
      | Danil Baibak                        |             |                      |
      | Denis Bogomoltsev                   |             |                      |
      | Denis Karavayev                     |             |                      |
      | Denis Maslov                        |             |                      |
      | Denis Zakharov                      |             |                      |
      | Dilshod Samatov                     |             |                      |
      | disamis                             |             |                      |
      | Dizzy D                             |             |                      |
      | Dmitry Fedoryak                     |             |                      |
      | Dmitry Kurochkin                    |             |                      |
      | Dmitry Petrov                       |             |                      |
      | Dmitry Poddubniy                    |             |                      |
      | Dmitry Soloviev                     |             |                      |
      | Dmitry Tarasenko                    |             |                      |
      | Dzmitry Ulasiankou                  |             |                      |
      | Elshad Shirinov                     |             |                      |
      | Evgeny Frolov                       |             |                      |
      | Evgeny Khramkov                     |             |                      |
      | Evgeny Olonov                       |             |                      |
      | Evgeny Shiryaev                     |             |                      |
      | fb5813a09c0f95242cb                 |             |                      |
      | Grigory Alexeev                     |             |                      |
      | Grigory Plotnikov                   |             |                      |
      | Guy Brukhis                         |             |                      |
      | Guy Rapaport                        |             |                      |
      | Haim Kom                            |             |                      |
      | happymarmoset                       |             |                      |
      | Hongliang Wang                      |             |                      |
      | Ice Kibitzer                        |             |                      |
      | Ido Ran                             |             |                      |
      | Igal Miroshnichenko                 |             |                      |
      | Igor Malanyk                        |             |                      |
      | Ihor Barakaiev and Dmitry Karaush   |             |                      |
      | Ilya Gelman                         |             |                      |
      | Ilya Kirichek                       |             |                      | Cheating([3](#rem3)]
      | Itay Komemy                         |             |                      |
      | Ivan Lukashov                       |             |                      |
      | Ivan Maltsev                        |             |                      |
      | Ivan Nikitin                        |             |                      |
      | Ivan Saloid                         |             |                      |
      | Ivan Zakharchenko                   |             |                      |
      | Jean-Philippe Gauthier              |             |                      |
      | jsmeister                           |             |                      |
      | Kazim                               |             |                      |
      | Kedem Diamant                       |             |                      |
      | Kirill Yakovlev                     |             |                      |
      | Kirill Yakovlev                     |             |                      | Hors concours
      | Konstantin Petryaev                 |             |                      |
      | Kwek Jing Yang                      |             |                      |
      | Lee Elenbaas                        |             |                      |
      | Leonid Kuznetsov                    |             |                      |
      | madshall                            |             |                      |
      | MakarovEm                           |             |                      |
      | Maksim Razumenko                    |             |                      |
      | Mark Gubarev                        |             |                      |
      | Max Leizerovich                     |             |                      |
      | Maxim Khoruzhko                     |             |                      |
      | Moshe Revah                         |             |                      |
      | Muthuswami Lakshminarayanan Susheel |             |                      | Hors concours
      | mycodef                             |             |                      |
      | NAR                                 |             |                      |
      | Nikita Molostvov                    |             |                      |
      | Nikita Polevoy                      |             |                      |
      | Nikolay Olonov                      |             |                      |
      | Nurguly Ashyrov                     |             |                      |
      | Oleg Panchenko                      |             |                      |
      | Oleh Tsiroh                         |             |                      |
      | Oleksandr Antonyuk                  |             |                      |
      | Ouanalao                            |             |                      |
      | Oz GabsoZ                           |             |                      |
      | Oz Shapira                          |             |                      |
      | Pavel Pogodaev                      |             |                      |
      | Pavel Polyakov                      |             |                      |
      | Pavel Tomsha                        |             |                      |
      | Petr Shalkov                        |             |                      |
      | Pham Vu Tuan                        |             |                      |
      | poluyanov                           |             |                      |
      | Ptax                                |             |                      |
      | qeled                               |             |                      |
      | Raoul Foaleng                       |             |                      |
      | Roman Timashev                      |             |                      |
      | Rostislav Galkin                    |             |                      |
      | Ruslan Bekenev                      |             |                      |
      | Ruslan Koptev                       |             |                      |
      | Sashko Matviychuk                   |             |                      |
      | Sergey Kluchkovsky                  |             |                      |
      | Sergey Serebryakov                  |             |                      |
      | Sergey Tolok                        |             |                      |
      | Sergii Iakymov                      |             |                      |
      | Sergius Galjuk                      |             |                      |
      | Serhiy Mitrovtsiy                   |             |                      |
      | serviceman                          |             |                      |
      | Shantanu Gupta                      |             |                      |
      | Stas Vasilyev                       |             |                      |
      | Stepan Pupkin                       |             |                      |
      | taitulism                           |             |                      |
      | Tan Ying Hao                        |             |                      |
      | Taras Ozarko                        |             |                      |
      | Timophey Nakhai                     |             |                      |
      | Victor Follet                       |             |                      |
      | Vitali Falileev                     |             |                      |
      | Vitaliy (vint)                      |             |                      |
      | Vitaliy Sunny                       |             |                      |
      | Vitaly Domnikov                     |             |                      |
      | Vladimir Menshakov                  |             |                      |
      | Vladimir Prikhozhenko               |             |                      |
      | Volodymyr Valkiv                    |             |                      |
      | Xawn Tan                            |             |                      |
      | Yair Haimovitch                     |             |                      |
      | Yury Loskot                         |             |                      |

### Remarks
1. <a name="rem1"></a> We disqualified one participant for trying to fool the test framework. Check their solution if you want to see how. Interestingly, the submission still wasn't the fastest.

2. <a name="rem2"></a> The submission passed correctness tests after adding a proper export of the `filter` function. The entry was therefore not assigned a rank in the final standings.

3. <a name="rem3"></a> This solution passed correctness tests but produced wrong output on the performance test. When we looked at its source code, it became apparent why the program was named `volkswagen.js`. The big players are doing it, so it might become an industry standard!

## More about Hola!
Hola was founded by serial entrepreneurs with the goal of making a better Internet. Hola's overlay P2P network for HTTP has disrupted the consumer VPN and online business intelligence markets, and is on its way to disrupting the $5B/yr CDN market. Hola is well funded and profitable ([read more about us](http://hola.org/about)).

## Stay tuned
More programming challenges to follow!
