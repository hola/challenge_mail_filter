var Module = {};
Module.noInitialRun = true;
Module.stdout = function(b) {
  process.stdout.write(String.fromCharCode(b));
};
