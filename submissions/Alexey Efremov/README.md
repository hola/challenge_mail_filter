Efremov Alexey (lexich121@gmail.com)

### Explanation
All rules compiles in AST tree. After that AST tree converts to string of javascript code. This code converts to js function with ```js
new Function(...)``` and this function modifies input messages object and this object become result. Samples of generated code locates in `./tests/fixtures` folder. Files `compile_*.js` generates with `test/compile_spec.js, `main_*.js` with `test/main_spec.js` (these codes is result bodies of functions).

### Unit tests
Locates in `./tests` folder.

### Benchmarks
Benchmarks locate in file `./benchmark/speed.js`.  
Run benchmarks `npm run speed`

#### Results
2,8 GHz Intel Core i5
`
node --version 
v5.0.0
`

`TEST=1 npm run speed`
>[test1] time: 326ms msgs: 55630 rules: 500 m/r: 111.3 speed: 170.64 ops/ms
55630 messages with 500 rules were processing at 341ms. Speed of processing 163.14 ops/ms.

`TEST=2 npm run speed`
>[test2] time: 1398ms msgs: 100000 rules: 999 m/r: 100.1 speed: 71.53 ops/ms
100000 messages with 999 rules were processing at 1429ms. Speed of processing 68.73 ops/ms.

`TEST=3 npm run speed`
>[test3] time: 245ms msgs: 55630 rules: 250 m/r: 222.5 speed: 227.06 ops/ms

`TEST=4 npm run speed`
>[test4] time: 327ms msgs: 55630 rules: 400 m/r: 139.1 speed: 170.12 ops/ms

`TEST=5 npm run speed`
>[test5] time: 174ms msgs: 55630 rules: 150 m/r: 370.9 speed: 319.71 ops/ms

Here we have dependence of result `filter` liking inverse linear. (graph.png)
