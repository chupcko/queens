#!/bin/sh

SIZE=${1:-8}

DIR="problems/$(date '+%Y')/$(date '+%Y-%m')"
TODAY="$(date '+%Y-%m-%d')"
FILE="${DIR}/${TODAY}.qs"

mkdir -p "${DIR}"

cp "templates/${SIZE}.qs" "${FILE}"
$EDITOR "${FILE}"

find problems -type f |\
  xargs -n1 md5sum |\
  cut -d ' ' -f 1 |\
  sort |\
  uniq -c |\
  sort -n |\
  grep -v '^[ ]*1 '

(
  cd solver
  cargo run "../${FILE}"
)



cat <<EOI

git add "${FILE}"
git commit -m "${TODAY}"
git push

EOI
