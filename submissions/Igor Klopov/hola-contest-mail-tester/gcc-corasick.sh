rm ./solve-corasick.exe 2> /dev/null

gcc \
  ../hola-contest-mail/solve-corasick.c \
  -Wpedantic \
  -O0 \
  -g \
  -o ./solve-corasick.exe

echo 'running...'

/usr/bin/node \
  ./solve-corasick-cpp.js \
  test10.json

sleep 2
