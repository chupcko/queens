#!/bin/sh

find problems -type f |\
  xargs -n1 md5sum |\
  cut -d ' ' -f 1 |\
  sort |\
  uniq -c |\
  sort -n
