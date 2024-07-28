#!/bin/sh

cat <<EOI
const Problems = [
EOI

find problems -type f |\
  sort |\
  while read -r file_name
  do
    cat ${file_name} |\
      sed ':l;N;$!bl;s/\n/@/g;s/@$//;s/^.*$/  '\''\0'\'',/'
  done |\
  sed '$s/,$//'

cat <<EOI
];

export {
  Problems
};
EOI
