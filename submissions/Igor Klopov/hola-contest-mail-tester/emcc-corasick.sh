source ../emsdk_portable/emsdk_env.sh

TOTAL_MEMORY=384*1024*1024
ABORTING_MALLOC=0

/usr/bin/node -p process.versions.node

rm ./solve-corasick-O3-emter.js 2> /dev/null
rm ./solve-corasick-O3.js 2> /dev/null
rm ./solve-corasick-Oz-g-emter.js 2> /dev/null
rm ./solve-corasick-Oz-g.js 2> /dev/null
rm ./*-v8.log 2> /dev/null
rm ./v8.log 2> /dev/null
rm ./v8.txt 2> /dev/null

echo 'compiling...'

emcc \
  ../hola-contest-mail/solve-corasick.c \
  -o ./solve-corasick-O3-emter.js \
  -O3 \
  -s EMTERPRETIFY=1 \
  -s TOTAL_MEMORY=$TOTAL_MEMORY \
  -s ABORTING_MALLOC=$ABORTING_MALLOC \
  -s NO_FILESYSTEM=1 \
  -s NO_BROWSER=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s NODE_STDOUT_FLUSH_WORKAROUND=0 \
  -s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
  -s EXPORTED_FUNCTIONS='["_main","_solve","_cleanup"]' \
  --minify 0 \
  --llvm-opts '["-O3"]' \
  --memory-init-file 0 \
  --pre-js ../hola-contest-mail/solve-corasick-prejs.js \
  --post-js ../hola-contest-mail/solve-corasick-postjs.js

emcc \
  ../hola-contest-mail/solve-corasick.c \
  -o ./solve-corasick-O3.js \
  -O3 \
  -s TOTAL_MEMORY=$TOTAL_MEMORY \
  -s ABORTING_MALLOC=$ABORTING_MALLOC \
  -s NO_FILESYSTEM=1 \
  -s NO_BROWSER=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s NODE_STDOUT_FLUSH_WORKAROUND=0 \
  -s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
  -s EXPORTED_FUNCTIONS='["_main","_solve","_cleanup"]' \
  --minify 0 \
  --llvm-opts '["-O3"]' \
  --memory-init-file 0 \
  --pre-js ../hola-contest-mail/solve-corasick-prejs.js \
  --post-js ../hola-contest-mail/solve-corasick-postjs.js

emcc \
  ../hola-contest-mail/solve-corasick.c \
  -o ./solve-corasick-Oz-g-emter.js \
  -Oz \
  -g \
  -s EMTERPRETIFY=1 \
  -s TOTAL_MEMORY=$TOTAL_MEMORY \
  -s ABORTING_MALLOC=$ABORTING_MALLOC \
  -s NO_FILESYSTEM=1 \
  -s NO_BROWSER=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s NODE_STDOUT_FLUSH_WORKAROUND=0 \
  -s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
  -s EXPORTED_FUNCTIONS='["_main","_solve","_cleanup"]' \
  --minify 0 \
  --memory-init-file 0 \
  --pre-js ../hola-contest-mail/solve-corasick-prejs.js \
  --post-js ../hola-contest-mail/solve-corasick-postjs.js

emcc \
  ../hola-contest-mail/solve-corasick.c \
  -o ./solve-corasick-Oz-g.js \
  -Oz \
  -g \
  -s TOTAL_MEMORY=$TOTAL_MEMORY \
  -s ABORTING_MALLOC=$ABORTING_MALLOC \
  -s NO_FILESYSTEM=1 \
  -s NO_BROWSER=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s NODE_STDOUT_FLUSH_WORKAROUND=0 \
  -s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
  -s EXPORTED_FUNCTIONS='["_main","_solve","_cleanup"]' \
  --minify 0 \
  --memory-init-file 0 \
  --pre-js ../hola-contest-mail/solve-corasick-prejs.js \
  --post-js ../hola-contest-mail/solve-corasick-postjs.js

# ../emsdk_portable/clang/fastcomp/build_master_64/bin/llvm-dis \
#   ./solve-corasick.bc

# cat ./solve-corasick.ll | wc -l

echo 'stripping...'

/usr/bin/node \
  ./strip.js \
  ./solve-corasick-O3.js

echo 'running...'

/usr/bin/node \
  ./solve-corasick-O3.js \
  test10.json

# /usr/bin/node --prof \
#   ./solve-corasick.js \
#   test20.json

# mv *-v8.log v8.log

# node-tick-processor > v8.txt 2> /dev/null

# cat v8.txt | grep 'Function: ~module.exports /home/igor/Work/hola-contest-mail/solve-corasick.js' | grep ' 0.0%'

sleep 2
