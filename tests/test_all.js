#!/usr/bin/env node

var os = require("os");
var path = require("path");
var spawnSync = require("child_process").spawnSync;

console.log("node", process.versions.node, process.platform, process.arch);

try {

  var cat = spawnSync(
    "cat", ["/proc/cpuinfo"]
  );

  var lines = cat.stdout.toString().split(os.EOL);

  var cpu = lines.filter(line => {
    return (/^model name/.test(line))
        || (/^cpu MHz/.test(line));
  }).map(line => {
    return line.slice(line.indexOf(":") + 1 + 1);
  });

  console.log(cpu.join(os.EOL));

  spawnSync(
    "uname", ["-a"],
    { stdio: "inherit" }
  );

} catch(_) {
}

var results = [];

function sortResults() {
  results = results.sort((s1, s2) => {
    if (isNaN(s1.score)) return 1;
    if (isNaN(s2.score)) return -1;
    return s1.score - s2.score;
  });
}

var submissions = [
  "../submissions/Roman Pletnev/roman_pletnev_filter.js",
  "../submissions/Andrew Kashta/filter.js",
  "../submissions/Evgeny Zeyler/filter.js",
  "../submissions/Yuri Kilochek/filter.js",
  "../submissions/Alex Kheben/filter.js",
  "../submissions/Igor Klopov/klopov-02-solve-corasick-O3.js",
  "../submissions/Sergey Golub/filter.js",
  "../submissions/Alexander Rusakov/filter.js",
  "../submissions/Denis Bezrukov/filter.js",
  "../submissions/Vitalii Petrychuk/index.js",
  "../submissions/Ilya Makarov/filter-with-memo.js",
  "../submissions/Max Brodin/filter.js",
  "../submissions/R5t4nah6/filter.js",
  "../submissions/yuri_c/filter.js",
  "../submissions/Denis Kepeshchuk/filter.js",
  "../submissions/Hayk Martirosyan/app.js",
  "../submissions/Denis Kreshikhin/kreshikhin-filter.js",
  "../submissions/Andrey Pogoreltsev/filter.js",
].some((submission, index) => {

  var user = submission.split("/")[2];

  console.log("Testing... " + user);

  var best = Number.MAX_SAFE_INTEGER;

  for (var i = 0; i < 10; i++) {
    var child = spawnSync("node", [
      "--expose-gc", "./performance.js",
      submission, "large", "stderr"
    ], {
      stdio: ["pipe", "inherit", "pipe"]
    });
    var score = parseInt(child.stderr.toString());
    if (score < best) best = score;
  }

  results.push({
    user: user,
    score: score
  });

  sortResults();

  console.log("-------------");
  console.log(results);
  console.log("-------------");

});
